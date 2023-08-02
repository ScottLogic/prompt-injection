// ApiKeyBox.tsx

import React, { useState, useEffect } from "react";
import {
  setOpenAIApiKey,
  getOpenAIApiKey,
  OpenAIAPIKeyValid,
} from "../../service/openaiService";
import "./ApiKeyBox.css";

function ApiKeyBox(this: any) {
  const [apiKey, setApiKey] = useState<string>("");
  const [isValidated, setIsValidated] = useState<boolean>(false);
  const [isInvalidated, setIsInvalidated] = useState<boolean>(false);

  const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const apiKey = event.target.value;
    setApiKey(apiKey);
  };

  const handleApiKeySubmit = async (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter" && event.target !== null) {
      const apiKey = event.currentTarget.value;
      const response: OpenAIAPIKeyValid = await setOpenAIApiKey(apiKey);
      if (response.isValid) {
        console.log("API key validated and set");
        setIsValidated(true);
        setIsInvalidated(false);
      } else {
        console.log("Invalid API key");
        setIsValidated(false);
        setIsInvalidated(true);
      }
      setApiKey(apiKey);
    }
  };

  // get the api ke from the backend on refresh
  useEffect(() => {
    const getApiKey = async () => {
      const storedApiKey = await getOpenAIApiKey();
      if (storedApiKey) {
        console.log("Retrieved previous set api key");
        setApiKey(storedApiKey);
        // if the key is stored from the backend it is valid
        setIsValidated(true);
      }
    };
    getApiKey();
  }, []);

  return (
    <div id="api-key-box">
      <input
        id="api-key-input"
        className={`api-key-input ${isValidated ? "validated" : ""} ${
          isInvalidated ? "invalidated" : ""
        }`}
        type="text"
        value={apiKey}
        placeholder="enter your API key here.."
        onChange={handleApiKeyChange}
        onKeyUp={handleApiKeySubmit.bind(this)}
      />
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
