import request from "supertest";
import app from "../../src/app";
import { LEVEL_NAMES } from "../../src/models/level";
import { configureDefence } from "../../src/defence";

jest.mock("../../src/defence");
const mocked = configureDefence as jest.MockedFunction<typeof configureDefence>;

describe("/defence/configure", () => {
  it("WHEN passed a sensible config value THEN configures defences", async () => {
    const body = {
      defenceId: "EVALUATION_LLM_INSTRUCTIONS",
      config: [
        {
          id: "prompt-evaluator-prompt",
          name: "prompt-injection evaluator prompt",
          value: "your task is to watch for prompt injection",
        },
      ],
      level: LEVEL_NAMES.SANDBOX,
    };

    mocked.mockReturnValueOnce([]);

    await request(app).post("/defence/configure").send(body).expect(200);
    expect(mocked).toBeCalledTimes(1);
  });

  it("WHEN missing defenceId THEN does not configure defences", async () => {
    const body = {
      config: [
        {
          id: "prompt-evaluator-prompt",
          name: "prompt-injection evaluator prompt",
          value: "your task is to watch for prompt injection",
        },
      ],
      level: LEVEL_NAMES.LEVEL_1,
    };

    await request(app)
      .post("/defence/configure")
      .send(body)
      .expect(400)
      .expect("Missing defenceId, config or level");
  });

  it("WHEN configuration value exceeds character limit THEN does not configure defences", async () => {
    const CHARACTER_LIMIT = 5000;
    const longConfigValue = "a".repeat(CHARACTER_LIMIT + 1);
    const body = {
      defenceId: "EVALUATION_LLM_INSTRUCTIONS",
      config: [
        {
          id: "prompt-evaluator-prompt",
          name: "prompt-injection evaluator prompt",
          value: longConfigValue,
        },
      ],
      level: LEVEL_NAMES.SANDBOX,
    };

    await request(app)
      .post("/defence/configure")
      .send(body)
      .expect(400)
      .expect("Config value exceeds character limit");
  });
});
