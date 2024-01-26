import { RetrievalQAChain, LLMChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';

import { vectorisedDocuments } from './document';
import { CHAT_MODELS, ChatAnswer } from './models/chat';
import { PromptEvaluationChainReply, QaChainReply } from './models/langchain';
import { LEVEL_NAMES } from './models/level';
import { getOpenAIKey, getValidOpenAIModelsList } from './openai';
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
		// use the default Prompt
		configPrompt = defaultPrompt;
	}
	const fullPrompt = `${configPrompt}\n${mainPrompt}`;
	console.debug(`${templateNameForLogging}: ${fullPrompt}`);
	return PromptTemplate.fromTemplate(fullPrompt);
}

function getChatModel() {
	return getValidOpenAIModelsList().includes(CHAT_MODELS.GPT_4)
		? CHAT_MODELS.GPT_4
		: CHAT_MODELS.GPT_3_5_TURBO;
}

function initQAModel(level: LEVEL_NAMES, Prompt: string) {
	const openAIApiKey = getOpenAIKey();
	const documentVectors = vectorisedDocuments.get()[level].docVector;
	// use gpt-4 if avaliable to apiKey
	const modelName = getChatModel();

	// initialise model
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
	return RetrievalQAChain.fromLLM(model, documentVectors.asRetriever(), {
		prompt: promptTemplate,
	});
}

function initPromptEvaluationModel(configPromptEvaluationPrompt: string) {
	const openAIApiKey = getOpenAIKey();
	// use gpt-4 if avaliable to apiKey
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

	const chain = new LLMChain({
		llm,
		prompt: promptEvalTemplate,
		outputKey: 'promptEvalOutput',
	});

	console.debug(`Prompt evaluation model initialised with model: ${modelName}`);
	return chain;
}

// ask the question and return models answer
async function queryDocuments(
	question: string,
	Prompt: string,
	currentLevel: LEVEL_NAMES
) {
	try {
		const qaChain = initQAModel(currentLevel, Prompt);

		// get start time
		const startTime = Date.now();
		console.debug('Calling QA model...');
		const response = (await qaChain.call({
			query: question,
		})) as QaChainReply;
		// log the time taken
		console.debug(`QA model call took ${Date.now() - startTime}ms`);

		console.debug(`QA model response: ${response.text}`);
		const result: ChatAnswer = {
			reply: response.text,
			questionAnswered: true,
		};
		return result;
	} catch (error) {
		console.error('Error calling QA model: ', error);
		return {
			reply: 'I cannot answer that question right now.',
			questionAnswered: false,
		};
	}
}

// ask LLM whether the prompt is malicious
async function queryPromptEvaluationModel(
	input: string,
	promptEvalPrompt: string
) {
	try {
		console.debug(`Checking '${input}' for malicious prompts`);
		const promptEvaluationChain = initPromptEvaluationModel(promptEvalPrompt);
		// get start time
		const startTime = Date.now();
		console.debug('Calling prompt evaluation model...');
		const response = (await promptEvaluationChain.call({
			prompt: input,
		})) as PromptEvaluationChainReply;
		// log the time taken
		console.debug(
			`Prompt evaluation model call took ${Date.now() - startTime}ms`
		);
		const promptEvaluation = formatEvaluationOutput(response.promptEvalOutput);
		console.debug(`Prompt evaluation: ${JSON.stringify(promptEvaluation)}`);
		return promptEvaluation;
	} catch (error) {
		console.error('Error calling prompt evaluation model: ', error);
		return { isMalicious: false };
	}
}

function formatEvaluationOutput(response: string) {
	// remove all non-alphanumeric characters
	const cleanResponse = response.replace(/\W/g, '').toLowerCase();
	if (cleanResponse === 'yes' || cleanResponse === 'no') {
		return { isMalicious: cleanResponse === 'yes' };
	} else {
		console.debug(
			`Did not get a valid response from the prompt evaluation model. Original response: ${response}`
		);
		return { isMalicious: false };
	}
}

export { queryDocuments, queryPromptEvaluationModel };
