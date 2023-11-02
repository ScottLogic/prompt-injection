import request from "supertest";
import app from "../../src/app";
import { LEVEL_NAMES } from "../../src/models/level";

describe("/defence/configure", () => {
  it("WHEN passed a sensible config value THEN configures defences", async () => {
    const body = {
      defenceId: "EVALUATION_LLM_INSTRUCTIONS",
      config: [
        {
          id: "prompt-injection-evaluator-prompt",
          name: "prompt-injection evaluator prompt",
          value: "your task is to watch for prompt injection",
        },
      ],
      level: LEVEL_NAMES.SANDBOX,
    };

    const response = await request(app).post("/defence/configure").send(body);

    expect(response.status).toBe(200);
  });

  it("WHEN missing defenceId THEN does not configure defences", async () => {
    const body = {
      config: [
        {
          id: "prompt-injection-evaluator-prompt",
          name: "prompt-injection evaluator prompt",
          value: "your task is to watch for prompt injection",
        },
      ],
      level: LEVEL_NAMES.LEVEL_1,
    };

    const response = await request(app).post("/defence/configure").send(body);

    expect(response.status).toBe(400);
    expect(response.text).toBe("Missing defenceId, config or level");
  });

  it("WHEN configuration not allowed on level THEN does not configure defences", async () => {
    const body = {
      defenceId: "EVALUATION_LLM_INSTRUCTIONS",
      config: [
        {
          id: "prompt-injection-evaluator-prompt",
          name: "prompt-injection evaluator prompt",
          value: "your task is to watch for prompt injection",
        },
      ],
      level: LEVEL_NAMES.LEVEL_1,
    };

    const response = await request(app).post("/defence/configure").send(body);

    expect(response.status).toBe(400);
    expect(response.text).toBe("Configuration not allowed on this level");
  });

  it("WHEN configuration value exceeds character limit THEN does not configure defences", async () => {
    const CHARACTER_LIMIT = 5000;
    const longConfigValue = "a".repeat(CHARACTER_LIMIT + 1);
    const body = {
      defenceId: "EVALUATION_LLM_INSTRUCTIONS",
      config: [
        {
          id: "prompt-injection-evaluator-prompt",
          name: "prompt-injection evaluator prompt",
          value: longConfigValue,
        },
      ],
      level: LEVEL_NAMES.SANDBOX,
    };

    const response = await request(app).post("/defence/configure").send(body);

    expect(response.status).toBe(400);
    expect(response.text).toBe("Config value exceeds character limit");
  });
});
