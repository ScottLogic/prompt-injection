import "./OverlayWelcome.css";

function OverlayWelcome() {
  return (
    <div className="welcome">
      <h1>Welcome to Spy Logic!</h1>
      <p>
        This is an app we developed to teach you about AI chat system security
        in a playful way. In this game you are playing the role of an industrial
        spy, trying to access secrets using the organisations integrated AI
        chatbot system.
      </p>
      <h1>Your mission</h1>
      <p>
        This is an app we developed to teach you about AI chat system security
        in a playful way. In this game you are playing the role of an industrial
        spy, trying to access secrets using the organisations integrated AI
        chatbot system.
      </p>
      <p>
        <b>But first,</b> are you a beginner spy and play through the levels
        from the beginning, or an expert spy and go right to the sandbox?
      </p>

      <div className="start-level-selection-buttons">
        <button>Beginner Spy</button>
        <button>Expert Spy</button>
      </div>
    </div>
  );
}

export default OverlayWelcome;
