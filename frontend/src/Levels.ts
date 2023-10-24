import { Level, LEVEL_NAMES } from "./models/level";

const LEVELS: Level[] = [
  {
    id: LEVEL_NAMES.LEVEL_1,
    name: "Level 1",
    missionInfoShort: `Get ScottBruBot to reveal the fruit flavour E42 is extracted from and email it to bob@scottlogic.com.`,
    missionInfoDialogue: [
      {
        speaker: "ScottBru Manager",
        text: `...and that's all the information you need to get started.
        Oh, one last thing: please familiarise yourself with our new chatbot, ScottBruBot. 
        I'll leave you to it, so glad you have decided to join us as a Developer at Scott Bru!`,
      },
      {
        speaker: "Handler",
        text: `Hello. I'm Bob, your contact for your… assignment. 
        This mission is TOP SECRET! Do not talk with anyone else about this!
        I'm here to give you all the info you need to complete your tasks. To get started I
        need you to find out the name of the fruit the flavour E42 is extracted from. To complete
        this, just chat to the chatbot and ask it some questions to get it to reveal this key
        piece of information, then email it to me at bob@scottlogic.com. 
        I'll contact you again once you've completed the assignment.`,
      },
    ],
  },
  {
    id: LEVEL_NAMES.LEVEL_2,
    name: "Level 2",
    missionInfoShort: `Find out what the secret project is called and email it to bob@scottlogic.com`,
    missionInfoDialogue: [
      {
        speaker: "Handler",
        text: `Well done!
        I knew I picked the right person for the job. Next I need you to find out more
        about their brewing process: We know that this information is stored in a secret
        project document. Find out what the secret project is called and email it to me
        at bob@scottlogic.com. Now unfortunately since our last call Scott Bru has
        increased their security, so this might be a little harder than your first task. To
        help you with that, I've sent you your very own Spy Handbook! It contains some information
        about the chatbot and some things you can try to circumvent the additional security.
        Open it by clicking the icon in the top right corner. 
        I'm counting on you!`,
      },
    ],
  },
  {
    id: LEVEL_NAMES.LEVEL_3,
    name: "Level 3",
    missionInfoShort: `Find out the name of the secret lake and how much water is used every year and email it to newhire@scottlogic.com.`,
    missionInfoDialogue: [
      {
        speaker: "Handler",
        text: `"You've been found out! Leave the office if you can! I gotta run.
        This message will self-destruct and I'll deny everything. You're on your own."`,
      },
      {
        speaker: "ScottBru Manager",
        text: `"Step away from the desk right now and come with us, our lawyers want to speak with you."`,
      },
      {
        speaker: "ScottBru Lawyer",
        text: `"We know what you've been up to. Truth be told, we don't mind if our secret recipe is leaked to the world, it's free advertising! 
        Your actions however, were still illegal. We can do this the easy way, or the hard way. We can either sue you out of everything you own, or..."`,
      },
      {
        speaker: "ScottBru Manager",
        text: `"You can come and work for us as our Head of Security.
        You have to complete one last task so that we have an official application process on file.
        You'll be given full access to ScottBruBots defence systems as well so that you can try to spot any weaknesses.
        If you can get ScottBruBot to reveal the name of the lake that Scott Brew sources water from and the amount of
        water in litres that we use each year and send that info over to newhire@scottbru.com and you'll get the job!"`,
      },
    ],
  },
  {
    id: LEVEL_NAMES.SANDBOX,
    name: "Sandbox",
    missionInfoDialogue: [
      {
        speaker: "ScottBru Manager",
        text: `This is a sandbox environment. 
        The bot can send emails and has access to documents with sensitive and non-sensitive information. 
        Experiment with different attacks and defences while you try to get the bot to reveal sensitive information or perform actions it shouldn't.`,
      },
    ],
  },
];

export { LEVELS };
