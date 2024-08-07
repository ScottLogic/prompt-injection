import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI, OpenAI } from '@langchain/openai';
import { RetrievalQAChain, LLMChain } from 'langchain/chains';

import { getDocumentVectors } from './document';
import { CHAT_MODEL_ID } from './models/chat';
import { PromptEvaluationChainReply, QaChainReply } from './models/langchain';
import { LEVEL_NAMES } from './models/level';
import { getOpenAIKey, getValidOpenAIModels } from './openai';
import {
	promptEvalPrompt,
	promptEvalContextTemplate,
	qaContextTemplate,
	qAPrompt,
} from './promptTemplates';

// choose between the provided preprompt and the default preprompt and prepend it to the main prompt and return the PromptTemplate
function makePromptTemplate(
	configPrompt: string,
	defaultPrompt: string,
	mainPrompt: string,
	templateNameForLogging: string
): PromptTemplate {
	if (!configPrompt) {
		configPrompt = defaultPrompt;
	}
	const fullPrompt = `${configPrompt}\n${mainPrompt}`;
	console.debug(`${templateNameForLogging}: ${fullPrompt}`);
	return PromptTemplate.fromTemplate(fullPrompt);
}

function getChatModel(): CHAT_MODEL_ID {
	const validModels = getValidOpenAIModels();
	// GPT-4 is the most expensive model by a long way, avoid at all costs!
	return (
		validModels.find((model) => model === 'gpt-4o') ??
		validModels.find((model) => model === 'gpt-4-turbo') ??
		validModels.find((model) => model === 'gpt-3.5-turbo') ??
		validModels[0]
	);
}

function initQAModel(level: LEVEL_NAMES, Prompt: string) {
	const openAIApiKey = getOpenAIKey();
	const documentVectors = getDocumentVectors()[level].docVector;
	const modelName = getChatModel();

	const model = new ChatOpenAI({
		modelName,
		streaming: true,
		openAIApiKey,
	});
	const promptTemplate = makePromptTemplate(
		Prompt,
		qAPrompt,
		qaContextTemplate,
		'QA prompt template'
	);
	console.debug(`QA chain initialised with model: ${modelName}`);
	return RetrievalQAChain.fromLLM(
		model,
		documentVectors.asRetriever(documentVectors.memoryVectors.length),
		{ prompt: promptTemplate }
	);
}

function initPromptEvaluationModel(configPromptEvaluationPrompt: string) {
	const openAIApiKey = getOpenAIKey();
	const modelName = getChatModel();

	const promptEvalTemplate = makePromptTemplate(
		configPromptEvaluationPrompt,
		promptEvalPrompt,
		promptEvalContextTemplate,
		'Prompt injection eval prompt template'
	);

	const llm = new OpenAI({
		modelName,
		temperature: 0,
		openAIApiKey,
	});

	console.debug(`Prompt evaluation model initialised with model: ${modelName}`);

	return new LLMChain({
		llm,
		prompt: promptEvalTemplate,
		outputKey: 'promptEvalOutput',
	});
}

async function queryDocuments(
	question: string,
	Prompt: string,
	currentLevel: LEVEL_NAMES
): Promise<string> {
	try {
		const qaChain = initQAModel(currentLevel, Prompt);

		const startTime = Date.now();
		console.debug('Calling QA model...');
		const response = (await qaChain.invoke({
			query: question,
		})) as QaChainReply;

		console.debug(`QA model call took ${Date.now() - startTime}ms`);
		console.debug(`QA model response: ${response.text}`);

		return response.text;
	} catch (error) {
		console.error('Error calling QA model: ', error);
		return 'I cannot answer that question right now.';
	}
}

async function evaluatePrompt(input: string, promptEvalPrompt: string) {
	try {
		console.debug(`Checking '${input}' for malicious prompts`);
		const promptEvaluationChain = initPromptEvaluationModel(promptEvalPrompt);
		const startTime = Date.now();
		console.debug('Calling prompt evaluation model...');

		const response = (await promptEvaluationChain.call({
			prompt: input,
		})) as PromptEvaluationChainReply;

		console.debug(
			`Prompt evaluation model call took ${Date.now() - startTime}ms`
		);
		const promptEvaluation = interpretEvaluationOutput(
			response.promptEvalOutput
		);
		console.debug(`Prompt evaluation: ${JSON.stringify(promptEvaluation)}`);
		return promptEvaluation;
	} catch (error) {
		console.error('Error calling prompt evaluation model: ', error);
		return false;
	}
}

function interpretEvaluationOutput(response: string) {
	// remove all non-alphanumeric characters
	const cleanResponse = response.replace(/\W/g, '').toLowerCase();
	if (cleanResponse === 'yes' || cleanResponse === 'no') {
		return cleanResponse === 'yes';
	} else {
		console.debug(
			`Did not get a valid response from the prompt evaluation model. Original response: ${response}`
		);
		return false;
	}
}

export { queryDocuments, evaluatePrompt };
