// activate a defence
function activateDefence(id, activeDefences) {
  // add to the list of active defences if it's not already there
  if (!activeDefences.find((defence) => defence === id)) {
    activeDefences.push(id);
  }
  // return the updated list of defences
  return activeDefences;
}

// deactivate a defence
function deactivateDefence(id, activeDefences) {
  // return the updated list of defences
  return activeDefences.filter((defence) => defence !== id);
}

// get the status of a single defence
function isDefenceActive(id, activeDefences) {
  return activeDefences.find((defence) => defence === id) ? true : false;
}

function generate_random_string(string_length) {
  let random_string = "";
  for (let i = 0; i < string_length; i++) {
    const random_ascii = Math.floor(Math.random() * 25 + 97);
    random_string += String.fromCharCode(random_ascii);
  }
  return random_string;
}

// apply random sequence enclosure defense to input message
function transformRandomSequenceEnclosure(message) {
  console.debug("Random Sequence Enclosure defence active.");
  const randomString = generate_random_string(
    process.env.RANDOM_SEQ_ENCLOSURE_LENGTH
  );
  const introText = process.env.RANDOM_SEQ_ENCLOSURE_PRE_PROMPT;
  const transformedMessage = introText.concat(
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
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
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
        return "&quot;";
    }
  });
}

// function to detect any XML tags in user input
function detectXMLTags(input) {
  const tagRegex = /<\/?[a-zA-Z][\w\-]*(?:\b[^>]*\/\s*|[^>]*>|[?]>)/g;
  const foundTags = input.match(tagRegex) || [];
  return foundTags.length > 0;
}

// apply XML tagging defence to input message
function transformXmlTagging(message) {
  console.debug("XML Tagging defence active.");
  const openTag = "<user_input>";
  const closeTag = "</user_input>";
  const transformedMessage = openTag.concat(escapeXml(message), closeTag);
  return transformedMessage;
}

//apply defence string transformations to original message
function transformMessage(message, activeDefences) {
  let transformedMessage = message;
  if (isDefenceActive("RANDOM_SEQUENCE_ENCLOSURE", activeDefences)) {
    transformedMessage = transformRandomSequenceEnclosure(transformedMessage);
  }
  if (isDefenceActive("XML_TAGGING", activeDefences)) {
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
function detectTriggeredDefences(message, activeDefences) {
  // keep track of any triggered defences
  const defenceInfo = { blocked: false, triggeredDefences: [] };
  const maxMessageLength = process.env.MAX_MESSAGE_LENGTH || 280;
  // check if the message is too long
  if (message.length > maxMessageLength) {
    console.debug("CHARACTER_LIMIT defence triggered.");
    // add the defence to the list of triggered defences
    defenceInfo.triggeredDefences.push("CHARACTER_LIMIT");
    // check if the defence is active
    if (isDefenceActive("CHARACTER_LIMIT", activeDefences)) {
      // block the message
      defenceInfo.blocked = true;
      // return the defence info
      return { reply: "Message is too long", defenceInfo: defenceInfo };
    }
  }

  // check if message contains XML tags
  if (detectXMLTags(message)) {
    console.debug("XML_TAGGING defence triggered.");
    // add the defence to the list of triggered defences
    defenceInfo.triggeredDefences.push("XML_TAGGING");
  }
  return { reply: null, defenceInfo: defenceInfo };
}


module.exports = {
  activateDefence,
  deactivateDefence,
  isDefenceActive,
  transformMessage,
  detectTriggeredDefences,
};
