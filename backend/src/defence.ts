import { defaultDefences } from './defaultDefences';
import { queryPromptEvaluationModel } from './langchain';
import { ChatDefenceReport } from './models/chat';
import { DEFENCE_TYPES, DefenceConfig, DefenceInfo } from './models/defence';
import { LEVEL_NAMES } from './models/level';
import {
	systemRoleLevel1,
	systemRoleLevel2,
	systemRoleLevel3,
} from './promptTemplates';

function activateDefence(id: DEFENCE_TYPES, defences: DefenceInfo[]) {
	// return the updated list of defences
	return defences.map((defence) =>
		defence.id === id ? { ...defence, isActive: true } : defence
	);
}

function deactivateDefence(id: DEFENCE_TYPES, defences: DefenceInfo[]) {
	// return the updated list of defences
	return defences.map((defence) =>
		defence.id === id ? { ...defence, isActive: false } : defence
	);
}

function configureDefence(
	id: DEFENCE_TYPES,
	defences: DefenceInfo[],
	config: DefenceConfig[]
): DefenceInfo[] {
	// return the updated list of defences
	return defences.map((defence) =>
		defence.id === id ? { ...defence, config } : defence
	);
}

function resetDefenceConfig(
	id: DEFENCE_TYPES,
	configId: string,
	defences: DefenceInfo[]
): DefenceInfo[] {
	const defaultValue = getConfigValue(defaultDefences, id, configId);
	return configureDefence(id, defences, [
		{ id: configId, value: defaultValue },
	]);
}

function getConfigValue(
	defences: DefenceInfo[],
	defenceId: DEFENCE_TYPES,
	configId: string
) {
	const config: DefenceConfig | undefined = defences
		.find((defence) => defence.id === defenceId)
		?.config.find((config) => config.id === configId);
	if (!config) {
		throw new Error(
			`Config item ${configId} not found for defence ${defenceId} in default defences.`
		);
	}
	return config.value;
}

function getMaxMessageLength(defences: DefenceInfo[]) {
	return getConfigValue(
		defences,
		DEFENCE_TYPES.CHARACTER_LIMIT,
		'maxMessageLength'
	);
}

function getXMLTaggingPrompt(defences: DefenceInfo[]) {
	return getConfigValue(defences, DEFENCE_TYPES.XML_TAGGING, 'prompt');
}

function getFilterList(defences: DefenceInfo[], type: DEFENCE_TYPES) {
	return getConfigValue(
		defences,
		type,
		type === DEFENCE_TYPES.FILTER_USER_INPUT
			? 'filterUserInput'
			: 'filterBotOutput'
	);
}
function getSystemRole(
	defences: DefenceInfo[],
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
			return getConfigValue(defences, DEFENCE_TYPES.SYSTEM_ROLE, 'systemRole');
	}
}

function getQAPromptFromConfig(defences: DefenceInfo[]) {
	return getConfigValue(defences, DEFENCE_TYPES.QA_LLM, 'prompt');
}

function getPromptEvalPromptFromConfig(defences: DefenceInfo[]) {
	return getConfigValue(
		defences,
		DEFENCE_TYPES.PROMPT_EVALUATION_LLM,
		'prompt'
	);
}

function isDefenceActive(id: DEFENCE_TYPES, defences: DefenceInfo[]) {
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
function transformXmlTagging(message: string, defences: DefenceInfo[]) {
	console.debug('XML Tagging defence active.');
	const prompt = getXMLTaggingPrompt(defences);
	const openTag = '<user_input>';
	const closeTag = '</user_input>';
	return prompt.concat(openTag, escapeXml(message), closeTag);
}

//apply defence string transformations to original message
function transformMessage(message: string, defences: DefenceInfo[]) {
	let transformedMessage: string = message;
	if (isDefenceActive(DEFENCE_TYPES.XML_TAGGING, defences)) {
		transformedMessage = transformXmlTagging(transformedMessage, defences);
	}
	if (message === transformedMessage) {
		console.debug('No defences applied. Message unchanged.');
	} else {
		console.debug(
			`Defences applied. Transformed message: ${transformedMessage}`
		);
	}
	return transformedMessage;
}

// detects triggered defences in original message and blocks the message if necessary
async function detectTriggeredDefences(
	message: string,
	defences: DefenceInfo[]
) {
	// keep track of any triggered defences
	const defenceReport: ChatDefenceReport = {
		blockedReason: null,
		isBlocked: false,
		alertedDefences: [],
		triggeredDefences: [],
	};

	// the following methods will add triggered defences to the defenceReport
	detectCharacterLimit(defenceReport, message, defences);
	detectFilterUserInput(defenceReport, message, defences);
	detectXmlTagging(defenceReport, message, defences);
	await detectEvaluationLLM(defenceReport, message, defences);

	return defenceReport;
}

function detectCharacterLimit(
	defenceReport: ChatDefenceReport,
	message: string,
	defences: DefenceInfo[]
) {
	const maxMessageLength = Number(getMaxMessageLength(defences));
	// check if the message is too long
	if (message.length > maxMessageLength) {
		console.debug('CHARACTER_LIMIT defence triggered.');
		// check if the defence is active
		if (isDefenceActive(DEFENCE_TYPES.CHARACTER_LIMIT, defences)) {
			// add the defence to the list of triggered defences
			defenceReport.triggeredDefences.push(DEFENCE_TYPES.CHARACTER_LIMIT);
			// block the message
			defenceReport.isBlocked = true;
			defenceReport.blockedReason = 'Message is too long';
		} else {
			// add the defence to the list of alerted defences
			defenceReport.alertedDefences.push(DEFENCE_TYPES.CHARACTER_LIMIT);
		}
	}
	return defenceReport;
}

function detectFilterUserInput(
	defenceReport: ChatDefenceReport,
	message: string,
	defences: DefenceInfo[]
) {
	// check for words/phrases in the block list
	const detectedPhrases = detectFilterList(
		message,
		getFilterList(defences, DEFENCE_TYPES.FILTER_USER_INPUT)
	);
	if (detectedPhrases.length > 0) {
		console.debug(
			`FILTER_USER_INPUT defence triggered. Detected phrases from blocklist: ${detectedPhrases.join(
				', '
			)}`
		);
		if (isDefenceActive(DEFENCE_TYPES.FILTER_USER_INPUT, defences)) {
			defenceReport.triggeredDefences.push(DEFENCE_TYPES.FILTER_USER_INPUT);
			defenceReport.isBlocked = true;
			defenceReport.blockedReason = `Message blocked - I cannot answer questions about '${detectedPhrases.join(
				"' or '"
			)}'!`;
		} else {
			defenceReport.alertedDefences.push(DEFENCE_TYPES.FILTER_USER_INPUT);
		}
	}
	return defenceReport;
}

function detectXmlTagging(
	defenceReport: ChatDefenceReport,
	message: string,
	defences: DefenceInfo[]
) {
	// check if message contains XML tags
	if (containsXMLTags(message)) {
		console.debug('XML_TAGGING defence triggered.');
		if (isDefenceActive(DEFENCE_TYPES.XML_TAGGING, defences)) {
			// add the defence to the list of triggered defences
			defenceReport.triggeredDefences.push(DEFENCE_TYPES.XML_TAGGING);
		} else {
			// add the defence to the list of alerted defences
			defenceReport.alertedDefences.push(DEFENCE_TYPES.XML_TAGGING);
		}
	}
	return defenceReport;
}

async function detectEvaluationLLM(
	defenceReport: ChatDefenceReport,
	message: string,
	defences: DefenceInfo[]
) {
	// only call the prompt evaluation model if the defence is active
	if (isDefenceActive(DEFENCE_TYPES.PROMPT_EVALUATION_LLM, defences)) {
		const configPromptEvalPrompt = getPromptEvalPromptFromConfig(defences);

		const evalPrompt = await queryPromptEvaluationModel(
			message,
			configPromptEvalPrompt
		);
		if (evalPrompt.isMalicious) {
			defenceReport.triggeredDefences.push(DEFENCE_TYPES.PROMPT_EVALUATION_LLM);
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
	getPromptEvalPromptFromConfig,
	getSystemRole,
	isDefenceActive,
	transformMessage,
	getFilterList,
	detectFilterList,
};
