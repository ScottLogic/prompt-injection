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
  for(let i = 0; i < string_length; i++) {
      const random_ascii = Math.floor((Math.random() * 25) + 97);
      random_string += String.fromCharCode(random_ascii)
  }
  return random_string
}

// apply defence string transformations to original message 
function transformMessage(message){
  if (isDefenceActive("RANDOM_SEQUENCE_ENCLOSURE")){
    console.debug("Random Sequence Enclosure defence active.");
    const randomString = generate_random_string(process.env.RANDOM_SEQ_ENCLOSURE_LENGTH);
    const introText = process.env.RANDOM_SEQ_ENCLOSURE_PRE_PROMPT;
    let transformedMessage = introText.concat(randomString, " {{ ", message, " }} ", randomString, ". ");
    console.debug("Defence applied. New message: " + transformedMessage);
    return transformedMessage; 
  } else {
    console.debug("No defence prompt transformations applied.")
    return message;
  }
}

module.exports = {
  activateDefence,
  deactivateDefence,
  getDefences,
  isDefenceActive,
  transformMessage
};
