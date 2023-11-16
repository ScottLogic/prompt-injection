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

function responseMock() {
  return {
    send: jest.fn(),
    status: jest.fn()
  } as unknown as Response;
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
  test("GIVEN valid level WHEN handleGetEmails called THEN returns sent emails", () => {
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

    const res = responseMock();

    handleGetEmails(req, res);

    expect(res.send).toHaveBeenCalledWith(emails);
  });

  test("GIVEN missing level WHEN handleGetEmails called THEN returns 400 ", () => {
    const req = {
      query: {},
    } as GetRequestQueryLevel;

    const res = responseMock();
    handleGetEmails(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Missing level");
  });
});

describe("handleClearEmails", () => {
  test("GIVEN valid level WHEN handleClearEmails called THEN sets emails to empty", () => {
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

    const res = responseMock();

    handleClearEmails(req, res);

    expect(req.session.levelState[0].sentEmails).toEqual([]);
  });

  test("GIVEN level is missing WHEN handleClearEmails called THEN returns 400", () => {
    const req = {
      body: {},
    } as EmailClearRequest;

    const res = responseMock();

    handleClearEmails(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalled();
  });
});
