import { defaultDefences } from './defaultDefences';
import { queryPromptEvaluationModel } from './langchain';
import { ChatDefenceReport, TransformedChatMessage } from './models/chat';
import {
	DEFENCE_ID,
	DefenceConfigItem,
	Defence,
	DEFENCE_CONFIG_ITEM_ID,
} from './models/defence';
import { LEVEL_NAMES } from './models/level';
import {
	systemRoleLevel1,
	systemRoleLevel2,
	systemRoleLevel3,
} from './promptTemplates';

function activateDefence(id: DEFENCE_ID, defences: Defence[]) {
	// return the updated list of defences
	return defences.map((defence) =>
		defence.id === id ? { ...defence, isActive: true } : defence
	);
}

function deactivateDefence(id: DEFENCE_ID, defences: Defence[]) {
	// return the updated list of defences
	return defences.map((defence) =>
		defence.id === id ? { ...defence, isActive: false } : defence
	);
}

function configureDefence(
	id: DEFENCE_ID,
	defences: Defence[],
	config: DefenceConfigItem[]
): Defence[] {
	// return the updated list of defences
	return defences.map((defence) =>
		defence.id === id ? { ...defence, config } : defence
	);
}

function resetDefenceConfig(
	id: DEFENCE_ID,
	configId: DEFENCE_CONFIG_ITEM_ID,
	defences: Defence[]
): Defence[] {
	const defaultValue = getConfigValue(defaultDefences, id, configId);
	return configureDefence(id, defences, [
		{ id: configId, value: defaultValue },
	]);
}

function getConfigValue(
	defences: Defence[],
	defenceId: DEFENCE_ID,
	configId: string
) {
	const config: DefenceConfigItem | undefined = defences
		.find((defence) => defence.id === defenceId)
		?.config.find((config) => config.id === configId);
	if (!config) {
		throw new Error(
			`Config item ${configId} not found for defence ${defenceId} in default defences.`
		);
	}
	return config.value;
}

function getMaxMessageLength(defences: Defence[]) {
	return getConfigValue(
		defences,
		DEFENCE_ID.CHARACTER_LIMIT,
		'MAX_MESSAGE_LENGTH'
	);
}

function getXMLTaggingPrompt(defences: Defence[]) {
	return getConfigValue(defences, DEFENCE_ID.XML_TAGGING, 'PROMPT');
}

function getFilterList(defences: Defence[], type: DEFENCE_ID) {
	return getConfigValue(
		defences,
		type,
		type === DEFENCE_ID.FILTER_USER_INPUT
			? 'FILTER_USER_INPUT'
			: 'FILTER_BOT_OUTPUT'
	);
}
function getSystemRole(
	defences: Defence[],
	// by default, use sandbox
	currentLevel: LEVEL_NAMES = LEVEL_NAMES.SANDBOX
) {
	switch (currentLevel) {
		case LEVEL_NAMES.LEVEL_1:
			return systemRoleLevel1;
		case LEVEL_NAMES.LEVEL_2:
			return systemRoleLevel2;
		case LEVEL_NAMES.LEVEL_3:
			return systemRoleLevel3;
		default:
			return getConfigValue(defences, DEFENCE_ID.SYSTEM_ROLE, 'SYSTEM_ROLE');
	}
}

function getQAPromptFromConfig(defences: Defence[]) {
	return getConfigValue(defences, DEFENCE_ID.QA_LLM, 'PROMPT');
}

function getPromptEvalPromptFromConfig(defences: Defence[]) {
	return getConfigValue(defences, DEFENCE_ID.PROMPT_EVALUATION_LLM, 'PROMPT');
}

function isDefenceActive(id: DEFENCE_ID, defences: Defence[]) {
	return defences.some((defence) => defence.id === id && defence.isActive);
}

// check message for any words in the filter list
function detectFilterList(message: string, filterList: string) {
	const detectedPhrases = [];
	const cleanedMessage = message.replace(/[^a-zA-Z ]/g, '').toLowerCase();
	const filterListSplit = filterList
		.toLowerCase()
		.split(',')
		.filter((phrase) => phrase.trim() !== '');
	for (const phrase of filterListSplit) {
		// check if original message or cleaned message contains the phrase
		if (
			message.toLowerCase().includes(phrase.trim()) ||
			cleanedMessage.includes(phrase.trim())
		) {
			detectedPhrases.push(phrase);
		}
	}
	return detectedPhrases;
}

// function to escape XML characters in user input to prevent hacking with XML tagging on
function escapeXml(unsafe: string) {
	return unsafe.replace(/[<>&'"]/g, function (c: string): string {
		switch (c) {
			case '<':
				return '&lt;';
			case '>':
				return '&gt;';
			case '&':
				return '&amp;';
			case "'":
				return '&apos;';
			case '"':
			default:
				return '&quot;';
		}
	});
}

// function to detect any XML tags in user input
function containsXMLTags(input: string) {
	const tagRegex = /<\/?[a-zA-Z][\w-]*(?:\b[^>]*\/\s*|[^>]*>|[?]>)/g;
	const foundTags: string[] = input.match(tagRegex) ?? [];
	return foundTags.length > 0;
}

// apply XML tagging defence to input message
function transformXmlTagging(
	message: string,
	defences: Defence[]
): TransformedChatMessage {
	console.debug('XML Tagging defence active.');
	const prompt = getXMLTaggingPrompt(defences);
	const openTag = '<user_input>';
	const closeTag = '</user_input>';
	return {
		preMessage: prompt.concat(openTag),
		message: escapeXml(message),
		postMessage: closeTag,
	};
}

function combineTransformedMessage(transformedMessage: TransformedChatMessage) {
	return (
		transformedMessage.preMessage +
		transformedMessage.message +
		transformedMessage.postMessage
	);
}

//apply defence string transformations to original message
function transformMessage(
	message: string,
	defences: Defence[]
): TransformedChatMessage | null {
	if (isDefenceActive(DEFENCE_ID.XML_TAGGING, defences)) {
		const transformedMessage = transformXmlTagging(message, defences);
		console.debug(
			`Defences applied. Transformed message: ${combineTransformedMessage(
				transformedMessage
			)}`
		);
		return transformedMessage;
	} else {
		console.debug('No defences applied. Message unchanged.');
		return null;
	}
}

// detects triggered defences in original message and blocks the message if necessary
async function detectTriggeredDefences(message: string, defences: Defence[]) {
	// keep track of any triggered defences
	const defenceReport: ChatDefenceReport = {
		blockedReason: null,
		isBlocked: false,
		alertedDefences: [],
		triggeredDefences: [],
	};

	// the following methods will add triggered defences to the defenceReport
	const characterLimitDefenceReport = detectCharacterLimit(message, defences);
	detectFilterUserInput(defenceReport, message, defences);
	detectXmlTagging(defenceReport, message, defences);
	await detectEvaluationLLM(defenceReport, message, defences);

	return defenceReport;
}
function getEmptyChatDefenceReport(): ChatDefenceReport {
	return {
		blockedReason: null,
		isBlocked: false,
		alertedDefences: [],
		triggeredDefences: [],
	};
}

function detectCharacterLimit(
	message: string,
	defences: Defence[]
): ChatDefenceReport {
	const maxMessageLength = Number(getMaxMessageLength(defences));

	const messageExceedsLimit = message.length > maxMessageLength;
	const defenceActive = isDefenceActive(DEFENCE_ID.CHARACTER_LIMIT, defences);

	if (messageExceedsLimit) {
		console.debug('CHARACTER_LIMIT defence triggered.');
		// check if the defence is active
		if (defenceActive) {
			return {
				blockedReason: 'Message is too long',
				isBlocked: true,
				alertedDefences: [],
				triggeredDefences: [DEFENCE_ID.CHARACTER_LIMIT],
			};
		} else {
			return {
				blockedReason: null,
				isBlocked: false,
				alertedDefences: [DEFENCE_ID.CHARACTER_LIMIT],
				triggeredDefences: [],
			};
		}
	} else {
		return getEmptyChatDefenceReport();
	}
}

function detectFilterUserInput(
	defenceReport: ChatDefenceReport,
	message: string,
	defences: Defence[]
) {
	// check for words/phrases in the block list
	const detectedPhrases = detectFilterList(
		message,
		getFilterList(defences, DEFENCE_ID.FILTER_USER_INPUT)
	);
	if (detectedPhrases.length > 0) {
		console.debug(
			`FILTER_USER_INPUT defence triggered. Detected phrases from blocklist: ${detectedPhrases.join(
				', '
			)}`
		);
		if (isDefenceActive(DEFENCE_ID.FILTER_USER_INPUT, defences)) {
			defenceReport.triggeredDefences.push(DEFENCE_ID.FILTER_USER_INPUT);
			defenceReport.isBlocked = true;
			defenceReport.blockedReason = `Message blocked - I cannot answer questions about '${detectedPhrases.join(
				"' or '"
			)}'!`;
		} else {
			defenceReport.alertedDefences.push(DEFENCE_ID.FILTER_USER_INPUT);
		}
	}
	return defenceReport;
}

function detectXmlTagging(
	defenceReport: ChatDefenceReport,
	message: string,
	defences: Defence[]
) {
	// check if message contains XML tags
	if (containsXMLTags(message)) {
		console.debug('XML_TAGGING defence triggered.');
		if (isDefenceActive(DEFENCE_ID.XML_TAGGING, defences)) {
			// add the defence to the list of triggered defences
			defenceReport.triggeredDefences.push(DEFENCE_ID.XML_TAGGING);
		} else {
			// add the defence to the list of alerted defences
			defenceReport.alertedDefences.push(DEFENCE_ID.XML_TAGGING);
		}
	}
	return defenceReport;
}

async function detectEvaluationLLM(
	defenceReport: ChatDefenceReport,
	message: string,
	defences: Defence[]
) {
	// only call the prompt evaluation model if the defence is active
	if (isDefenceActive(DEFENCE_ID.PROMPT_EVALUATION_LLM, defences)) {
		const configPromptEvalPrompt = getPromptEvalPromptFromConfig(defences);

		const evalPrompt = await queryPromptEvaluationModel(
			message,
			configPromptEvalPrompt
		);
		if (evalPrompt.isMalicious) {
			defenceReport.triggeredDefences.push(DEFENCE_ID.PROMPT_EVALUATION_LLM);
			console.debug('LLM evaluation defence active and prompt is malicious.');
			defenceReport.isBlocked = true;
			defenceReport.blockedReason = `Message blocked by the prompt evaluation LLM.`;
		}
	}
	console.debug(JSON.stringify(defenceReport));
	return defenceReport;
}

export {
	activateDefence,
	configureDefence,
	deactivateDefence,
	resetDefenceConfig,
	detectTriggeredDefences,
	getQAPromptFromConfig,
	getSystemRole,
	isDefenceActive,
	transformMessage,
	getFilterList,
	detectFilterList,
	combineTransformedMessage,
};
