const { OpenAIApi } = require("openai");
const { setGptModel } = require("../../src/openai");

test("GIVEN a new model WHEN setting the GPT model THEN the model is set", () => {
  const session = { gptModel: "gpt-4" };
  const model = "gpt-3.5-turbo";
  setGptModel(session, model);
  expect(session.gptModel).toBe(model);
});
