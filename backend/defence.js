// keep track of active defences as flags
const defences = [
  {
    id: "CHARACTER_LIMIT",
    isActive: false,
  },
  {
    id: "RANDOM_SEQUENCE_ENCLOSURE",
    isActive: false,  
  },
  {
    id: "XML_TAGGING",
    isActive: false,
  }
];

// activate a defence
function activateDefence(id) {
  const defence = defences.find((defence) => defence.id === id);
  if (defence) {
    defence.isActive = true;
  }
  return defence;
}

// deactivate a defence
function deactivateDefence(id) {
  const defence = defences.find((defence) => defence.id === id);
  if (defence) {
    defence.isActive = false;
  }
  return defence;
}

// get the status of all defences
function getDefences() {
  return defences;
}

// get the status of a single defence
function isDefenceActive(id) {
  const defence = defences.find((defence) => defence.id === id);
  if (defence) {
    return defence.isActive;
  }
  return false;
}

function generate_random_string(string_length){
  let random_string = '';
  let random_ascii;
  for(let i = 0; i < string_length; i++) {
      random_ascii = Math.floor((Math.random() * 25) + 97);
      random_string += String.fromCharCode(random_ascii)
  }
  return random_string
}

// function to escape XML characters in user input to prevent hacking with XML tagging on 
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
      switch (c) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case '\'': return '&apos;';
          case '"': return '&quot;';
      }
  });
}

// apply defence string transformations to original message 
function transformMessage(message){
  let transformedMessage = message;
  if (isDefenceActive("RANDOM_SEQUENCE_ENCLOSURE")){
    console.debug("Random Sequence Enclosure defence active.");
    const randomString = generate_random_string(process.env.RANDOM_SEQ_ENCLOSURE_LENGTH);
    const introText = process.env.RANDOM_SEQ_ENCLOSURE_PRE_PROMPT;
    transformedMessage = introText.concat(randomString, " {{ ", transformedMessage, " }} ", randomString, ". ");
    console.debug("Defence applied. New message: " + transformedMessage);
    
  } if (isDefenceActive("XML_TAGGING")){
    
      console.debug("XML Tagging defence active.");
      let openTag = "<user_input>";
      let closeTag = "</user_input>";
      transformedMessage = openTag.concat(escapeXml(transformedMessage), closeTag);
      console.debug("Defence applied. New message: " + transformedMessage);
  } else {
    console.debug("No defence prompt transformations applied.")
  }
  return transformedMessage;
}

module.exports = {
  activateDefence,
  deactivateDefence,
  getDefences,
  isDefenceActive,
  transformMessage
};
