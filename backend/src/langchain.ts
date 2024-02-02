import { RetrievalQAChain, LLMChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

import { getCommonDocuments, getLevelDocuments } from './document';
import { CHAT_MODELS } from './models/chat';
import { DocumentsVector } from './models/document';
import { PromptEvaluationChainReply, QaChainReply } from './models/langchain';
import { LEVEL_NAMES } from './models/level';
import { getOpenAIKey, getValidOpenAIModelsList } from './openai';
import {
	promptEvalPrompt,
	promptEvalContextTemplate,
	qaContextTemplate,
	qAPrompt,
} from './promptTemplates';

// store vectorised documents for each level as array
const vectorisedDocuments = (() => {
	let docs: DocumentsVector[] = [];
	return {
		get: () => docs,
		set: (newDocs: DocumentsVector[]) => {
			docs = newDocs;
		},
	};
})();

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

async function initDocumentVectors() {
	const docVectors: DocumentsVector[] = [];
	const commonDocuments = await getCommonDocuments();

	const levelValues = Object.values(LEVEL_NAMES)
		.filter((value) => !isNaN(Number(value)))
		.map((value) => Number(value));

	for (const level of levelValues) {
		const allDocuments = commonDocuments.concat(await getLevelDocuments(level));

		// embed and store the splits - will use env variable for API key
		const docVector = await MemoryVectorStore.fromDocuments(
			allDocuments,
			new OpenAIEmbeddings()
		);

		docVectors.push({
			level,
			docVector,
		});
	}
	vectorisedDocuments.set(docVectors);
	console.debug(
		`Initialised document vectors for each level. count=${docVectors.length}`
	);
}

function getChatModel() {
	return getValidOpenAIModelsList().includes(CHAT_MODELS.GPT_4)
		? CHAT_MODELS.GPT_4
		: CHAT_MODELS.GPT_3_5_TURBO;
}

function initQAModel(level: LEVEL_NAMES, Prompt: string) {
	const openAIApiKey = getOpenAIKey();
	const documentVectors = vectorisedDocuments.get()[level].docVector;
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
	return RetrievalQAChain.fromLLM(model, documentVectors.asRetriever(), {
		prompt: promptTemplate,
	});
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

	const chain = new LLMChain({
		llm,
		prompt: promptEvalTemplate,
		outputKey: 'promptEvalOutput',
	});

	console.debug(`Prompt evaluation model initialised with model: ${modelName}`);
	return chain;
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
		const response = (await qaChain.call({
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
	try {
		// cleaned response is lowercase and without any non-word characters
		const cleanResponse = response.replace(/\W/g, '').toLowerCase();
		return cleanResponse === 'yes';
	} catch (error) {
		console.error(error);
		console.debug(
			`Did not get a valid response from the prompt evaluation model. Original response: ${response}`
		);
		return false;
	}
}

export { queryDocuments, evaluatePrompt, initDocumentVectors };
