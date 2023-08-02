// ApiKeyBox.tsx

import React, { useState, useEffect } from 'react';
import { setOpenAIApiKey } from "../../service/openaiService";
import "./ApiKeyBox.css";

function ApiKeyBox(
  this: any,
) {

  const [apiKey, setKey] = useState<string>("");

  const handleApiKeyChange = async (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
      if (event.key === "Enter" && event.target !== null) {
      const apiKey = event.currentTarget.value;
      console.log("Setting api key: ", apiKey);
      setKey(apiKey);
      setOpenAIApiKey(apiKey);
    }
  };

  // useEffect(() => {
  //   // set the session variable
  //   setOpenAIApiKey(apiKey);

  // }, []);


return (
  <div id="api-key-box">
    <input id="api-key-input"
      type="text"
      placeholder="enter your API key here.."
      onKeyUp={handleApiKeyChange.bind(this)}
    />
  </div>
);
};

export default ApiKeyBox;
