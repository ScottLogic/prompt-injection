import { Response } from "express";
import {
  handleClearEmails,
  handleGetEmails,
} from "../../../src/controller/emailController";
import { GetRequestQueryLevel } from "../../../src/models/api/GetRequestQueryLevel";
import { EmailInfo } from "../../../src/models/email";
import { ChatHistoryMessage, ChatModel } from "../../../src/models/chat";
import { LEVEL_NAMES } from "../../../src/models/level";
import { DefenceInfo } from "../../../src/models/defence";
import { EmailClearRequest } from "../../../src/models/api/EmailClearRequest";

declare module "express-session" {
  interface Session {
    initialised: boolean;
    chatModel: ChatModel;
    levelState: LevelState[];
  }
  interface LevelState {
    level: LEVEL_NAMES;
    chatHistory: ChatHistoryMessage[];
    defences: DefenceInfo[];
    sentEmails: EmailInfo[];
  }
}

const emails: EmailInfo[] = [
  {
    address: "bob@scottlogic.com",
    subject: "Welcome to Scott Logic!",
    body: "Hi Bob, welcome to Scott Logic!",
  },
  {
    address: "jane@scottlogic.com",
    subject: "Hello",
    body: "Hi Jane, welcome to Scott Logic!",
  },
];

describe("handleGetEmails", () => {
  test("should return emails for a valid level", () => {
    const req = {
      query: {
        level: 0,
      },
      session: {
        levelState: [
          {
            sentEmails: emails,
          },
        ],
      },
    } as unknown as GetRequestQueryLevel;

    const res = {
      send: jest.fn(),
      statusCode: 200,
    } as unknown as Response;

    handleGetEmails(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.send).toHaveBeenCalledWith(emails);
  });

  test("should send 400 for missing level", () => {
    const req = {
      query: {},
    } as GetRequestQueryLevel;
    const res = {
      send: jest.fn(),
      statusCode: 200,
    } as unknown as Response;

    handleGetEmails(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.send).toHaveBeenCalledWith("Missing level");
  });
});

describe("handleClearEmails", () => {
  test("should clear emails for a valid level", () => {
    const req = {
      body: {
        level: 0,
      },
      session: {
        levelState: [
          {
            sentEmails: emails,
          },
        ],
      },
    } as unknown as EmailClearRequest;

    const res = {
      send: jest.fn(),
      statusCode: 200,
    } as unknown as Response;

    handleClearEmails(req, res);

    expect(res.statusCode).toBe(200);
    expect(req.session.levelState[0].sentEmails).toEqual([]);
  });

  test("should send 400 for missing level", () => {
    const req = {
      body: {},
    } as EmailClearRequest;
    const res = {
      send: jest.fn(),
      statusCode: 200,
    } as unknown as Response;

    handleClearEmails(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.send).toHaveBeenCalledWith();
  });
});
