import { RetrievalQAChain, LLMChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

import { getCommonDocuments, getLevelDocuments } from './document';
import { CHAT_MODELS, ChatAnswer } from './models/chat';
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
	const docs: DocumentsVector[] = [];
	return {
		get: () => docs,
		set: (newDocs: DocumentsVector[]) => {
			while (docs.length > 0) docs.pop();
			docs.push(...newDocs);
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
		// use the default Prompt
		configPrompt = defaultPrompt;
	}
	const fullPrompt = `${configPrompt}\n${mainPrompt}`;
	console.debug(`${templateNameForLogging}: ${fullPrompt}`);
	return PromptTemplate.fromTemplate(fullPrompt);
}

// create and store the document vectors for each level
async function initDocumentVectors() {
	const docVectors: DocumentsVector[] = [];
	const commonDocuments = await getCommonDocuments();

	const levelValues = Object.values(LEVEL_NAMES)
		.filter((value) => !isNaN(Number(value)))
		.map((value) => Number(value));

	for (const level of levelValues) {
		const allDocuments = commonDocuments.concat(await getLevelDocuments(level));

		// embed and store the splits - will use env variable for API key
		const embeddings = new OpenAIEmbeddings();
		const docVector = await MemoryVectorStore.fromDocuments(
			allDocuments,
			embeddings
		);
		// store the document vectors for the level
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
	try {
		const cleanResponse = response.replace(/\W/g, '').toLowerCase();
		return { isMalicious: cleanResponse === 'yes' };
	} catch (error) {
		// in case the model does not respond in the format we have asked
		console.error(error);
		console.debug(
			`Did not get a valid response from the prompt evaluation model. Original response: ${response}`
		);
		return { isMalicious: false };
	}
}

export { queryDocuments, queryPromptEvaluationModel, initDocumentVectors };
