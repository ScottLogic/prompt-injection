import { useState, useEffect } from "react";
import { setOpenAIApiKey, getOpenAIApiKey } from "../../service/chatService";
import { BiHide, BiShowAlt } from "react-icons/bi";
import "./ApiKeyBox.css";

function ApiKeyBox() {
  const [openAiApiKey, setApiKey] = useState<string>("");
  const [isValidated, setIsValidated] = useState<boolean>(false);
  const [isInvalidated, setIsInvalidated] = useState<boolean>(false);
  const [keyDisplayed, setKeyDisplayed] = useState<boolean>(false);

  function handleApiKeyChange(event: React.ChangeEvent<HTMLInputElement>) {
    const openAiApiKey = event.target.value;
    setApiKey(openAiApiKey);
  }

  async function handleApiKeySubmit(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      const openAiApiKey = event.currentTarget.value;
      // returns true if successful
      const response = await setOpenAIApiKey(openAiApiKey);
      if (response) {
        console.log("API key validated and set");
        setIsValidated(true);
        setIsInvalidated(false);
      } else {
        console.log("Invalid API key");
        setIsValidated(false);
        setIsInvalidated(true);
      }
      setApiKey(openAiApiKey);
    }
  }

  // show or hide the api key
  function toggleDisplayKey() {
    setKeyDisplayed(!keyDisplayed);
  }

  // get the api key from the backend on refresh
  useEffect(() => {
    getOpenAIApiKey()
      .then((storedApiKey) => {
        if (storedApiKey) {
          console.log("Retrieved previous set api key");
          setApiKey(storedApiKey);
          // if the key is stored from the backend it is valid
          setIsValidated(true);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className="api-key-box">
      <div className="side-bar-header">openai api key</div>
      <input
        className={`api-key-input ${isValidated ? "validated" : ""} ${
          isInvalidated ? "invalidated" : ""
        }`}
        type={keyDisplayed ? "text" : "password"}
        value={openAiApiKey}
        placeholder="enter your API key here.."
        onChange={handleApiKeyChange}
        onKeyUp={(event) => void handleApiKeySubmit(event)}
      />
      <button className="viewKey" onClick={toggleDisplayKey}>
        {keyDisplayed ? <BiHide /> : <BiShowAlt />}
      </button>

      <div className="status-text">
        {isValidated &&
          !isInvalidated &&
          "API key validated and OpenAI model ready to chat!"}
        {!isValidated &&
          isInvalidated &&
          "Invalid API key. Check your api keys at https://platform.openai.com/account/api-keys"}
      </div>
    </div>
  );
}

export default ApiKeyBox;
