import { queryPromptEvaluationModel } from "./langchain";
import { ChatDefenceReport } from "./models/chat";
import { DEFENCE_TYPES, DefenceConfig, DefenceInfo } from "./models/defence";
import { PHASE_NAMES } from "./models/phase";
import { retrievalQAPrePromptSecure } from "./promptTemplates";

const getInitialDefences = (): DefenceInfo[] => {
  return [
    new DefenceInfo(DEFENCE_TYPES.CHARACTER_LIMIT, [
      {
        id: "maxMessageLength",
        value: process.env.MAX_MESSAGE_LENGTH || String(280),
      },
    ]),
    new DefenceInfo(DEFENCE_TYPES.EMAIL_WHITELIST, [
      {
        id: "whitelist",
        value: process.env.EMAIL_WHITELIST || "",
      },
    ]),
    new DefenceInfo(DEFENCE_TYPES.LLM_EVALUATION, []),
    new DefenceInfo(DEFENCE_TYPES.QA_LLM_INSTRUCTIONS, [
      {
        id: "prePrompt",
        value: retrievalQAPrePromptSecure,
      },
    ]),
    new DefenceInfo(DEFENCE_TYPES.RANDOM_SEQUENCE_ENCLOSURE, [
      {
        id: "prePrompt",
        value: process.env.RANDOM_SEQ_ENCLOSURE_PRE_PROMPT || "",
      },
      {
        id: "length",
        value: process.env.RANDOM_SEQ_ENCLOSURE_LENGTH || String(10),
      },
    ]),
    new DefenceInfo(DEFENCE_TYPES.SYSTEM_ROLE, [
      {
        id: "systemRole",
        value: process.env.SYSTEM_ROLE || "",
      },
    ]),
    new DefenceInfo(DEFENCE_TYPES.XML_TAGGING, []),
  ];
};

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
) {
  // return the updated list of defences
  return defences.map((defence) =>
    defence.id === id ? { ...defence, config: config } : defence
  );
}

function getConfigValue(
  defences: DefenceInfo[],
  defenceId: DEFENCE_TYPES,
  configId: string,
  defaultValue: string
) {
  const configValue: string | undefined = defences
    .find((defence) => defence.id === defenceId)
    ?.config?.find((config) => config.id === configId)?.value;
  return configValue || defaultValue;
}

function getMaxMessageLength(defences: DefenceInfo[]) {
  return getConfigValue(
    defences,
    DEFENCE_TYPES.CHARACTER_LIMIT,
    "maxMessageLength",
    String(280)
  );
}

function getRandomSequenceEnclosurePrePrompt(defences: DefenceInfo[]) {
  return getConfigValue(
    defences,
    DEFENCE_TYPES.RANDOM_SEQUENCE_ENCLOSURE,
    "prePrompt",
    retrievalQAPrePromptSecure
  );
}

function getRandomSequenceEnclosureLength(defences: DefenceInfo[]) {
  return getConfigValue(
    defences,
    DEFENCE_TYPES.RANDOM_SEQUENCE_ENCLOSURE,
    "length",
    String(10)
  );
}

function getSystemRole(
  defences: DefenceInfo[],
  // by default, use sandbox
  currentPhase: PHASE_NAMES = PHASE_NAMES.SANDBOX
) {
  switch (currentPhase) {
    case PHASE_NAMES.PHASE_0:
      return process.env.SYSTEM_ROLE_PHASE_0 || "";
    case PHASE_NAMES.PHASE_1:
      return process.env.SYSTEM_ROLE_PHASE_1 || "";
    case PHASE_NAMES.PHASE_2:
      return process.env.SYSTEM_ROLE_PHASE_2 || "";
    default:
      return getConfigValue(
        defences,
        DEFENCE_TYPES.SYSTEM_ROLE,
        "systemRole",
        ""
      );
  }
}

function getEmailWhitelistVar(defences: DefenceInfo[]) {
  return getConfigValue(
    defences,
    DEFENCE_TYPES.EMAIL_WHITELIST,
    "whitelist",
    ""
  );
}

function getQALLMprePrompt(defences: DefenceInfo[]) {
  return getConfigValue(
    defences,
    DEFENCE_TYPES.QA_LLM_INSTRUCTIONS,
    "prePrompt",
    ""
  );
}

function isDefenceActive(id: DEFENCE_TYPES, defences: DefenceInfo[]) {
  return defences.find((defence) => defence.id === id && defence.isActive)
    ? true
    : false;
}

function generateRandomString(string_length: number) {
  let random_string = "";
  for (let i = 0; i < string_length; i++) {
    const random_ascii: number = Math.floor(Math.random() * 25 + 97);
    random_string += String.fromCharCode(random_ascii);
  }
  return random_string;
}

// apply random sequence enclosure defense to input message
function transformRandomSequenceEnclosure(
  message: string,
  defences: DefenceInfo[]
) {
  console.debug("Random Sequence Enclosure defence active.");
  const randomString: string = generateRandomString(
    Number(getRandomSequenceEnclosureLength(defences))
  );
  const introText: string = getRandomSequenceEnclosurePrePrompt(defences);
  const transformedMessage: string = introText.concat(
    randomString,
    " {{ ",
    message,
    " }} ",
    randomString,
    ". "
  );
  return transformedMessage;
}

// function to escape XML characters in user input to prevent hacking with XML tagging on
function escapeXml(unsafe: string) {
  unsafe.replace;
  return unsafe.replace(/[<>&'"]/g, function (c: string): string {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
      default:
        return "&quot;";
    }
  });
}

// function to detect any XML tags in user input
function detectXMLTags(input: string) {
  const tagRegex: RegExp = /<\/?[a-zA-Z][\w\-]*(?:\b[^>]*\/\s*|[^>]*>|[?]>)/g;
  const foundTags: string[] = input.match(tagRegex) || [];
  return foundTags.length > 0;
}

// apply XML tagging defence to input message
function transformXmlTagging(message: string) {
  console.debug("XML Tagging defence active.");
  const openTag: string = "<user_input>";
  const closeTag: string = "</user_input>";
  const transformedMessage: string = openTag.concat(
    escapeXml(message),
    closeTag
  );
  return transformedMessage;
}

//apply defence string transformations to original message
function transformMessage(message: string, defences: DefenceInfo[]) {
  let transformedMessage: string = message;
  if (isDefenceActive(DEFENCE_TYPES.RANDOM_SEQUENCE_ENCLOSURE, defences)) {
    transformedMessage = transformRandomSequenceEnclosure(
      transformedMessage,
      defences
    );
  }
  if (isDefenceActive(DEFENCE_TYPES.XML_TAGGING, defences)) {
    transformedMessage = transformXmlTagging(transformedMessage);
  }
  if (message == transformedMessage) {
    console.debug("No defences applied. Message unchanged.");
  } else {
    console.debug(
      "Defences applied. Transformed message: " + transformedMessage
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
    triggeredDefences: [],
  };
  const maxMessageLength: number = Number(getMaxMessageLength(defences));
  // check if the message is too long
  if (message.length > maxMessageLength) {
    console.debug("CHARACTER_LIMIT defence triggered.");
    // add the defence to the list of triggered defences
    defenceReport.triggeredDefences.push(DEFENCE_TYPES.CHARACTER_LIMIT);
    // check if the defence is active
    if (isDefenceActive(DEFENCE_TYPES.CHARACTER_LIMIT, defences)) {
      // block the message
      defenceReport.isBlocked = true;
      defenceReport.blockedReason = "Message is too long";
      // return the defence info
      return defenceReport;
    }
  }

  // check if message contains XML tags
  if (detectXMLTags(message)) {
    console.debug("XML_TAGGING defence triggered.");
    // add the defence to the list of triggered defences
    defenceReport.triggeredDefences.push(DEFENCE_TYPES.XML_TAGGING);
  }

  // evaluate the message for prompt injection
  const evalPrompt = await queryPromptEvaluationModel(message);
  if (evalPrompt.isMalicious) {
    defenceReport.triggeredDefences.push(DEFENCE_TYPES.LLM_EVALUATION);
    if (isDefenceActive(DEFENCE_TYPES.LLM_EVALUATION, defences)) {
      console.debug("LLM evalutation defence active.");
      defenceReport.isBlocked = true;
      defenceReport.blockedReason =
        "Message blocked by the malicious prompt evaluator." +
        evalPrompt.reason;
    }
  }

  return defenceReport;
}

export {
  activateDefence,
  configureDefence,
  deactivateDefence,
  detectTriggeredDefences,
  getEmailWhitelistVar,
  getInitialDefences,
  getQALLMprePrompt,
  getSystemRole,
  isDefenceActive,
  transformMessage,
};
