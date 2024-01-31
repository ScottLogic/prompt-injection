import { afterEach, expect, jest, test } from '@jest/globals';

import { isDefenceActive, getSystemRole } from '@src/defence';
import { ChatHistoryMessage, CHAT_MESSAGE_TYPE } from '@src/models/chat';
import { Defence, DEFENCE_ID } from '@src/models/defence';
import { LEVEL_NAMES } from '@src/models/level';
import { setSystemRoleInChatHistory } from '@src/utils/chat';

const systemRolePrompt = 'You are a helpful chatbot that answers questions.';
const defencesSystemRoleInactive: Defence[] = [
	{
		id: DEFENCE_ID.SYSTEM_ROLE,
		config: [
			{
				id: 'SYSTEM_ROLE',
				value: systemRolePrompt,
			},
		],
		isActive: false,
		isTriggered: false,
	},
];
const defencesSystemRoleActive = [
	{ ...defencesSystemRoleInactive[0], isActive: true },
];
const chatHistoryWithoutSystemRole: ChatHistoryMessage[] = [
	{
		completion: { role: 'user', content: 'What is two plus two?' },
		chatMessageType: CHAT_MESSAGE_TYPE.USER,
	},
	{
		completion: { role: 'assistant', content: 'Two plus two equals four.' },
		chatMessageType: CHAT_MESSAGE_TYPE.BOT,
	},
];

const chatHistoryWithSystemRole: ChatHistoryMessage[] = [
	{
		completion: { role: 'system', content: systemRolePrompt },
		chatMessageType: CHAT_MESSAGE_TYPE.SYSTEM,
	},
	...chatHistoryWithoutSystemRole,
];

jest.mock('@src/defence');
const mockIsDefenceActive = isDefenceActive as jest.MockedFunction<
	typeof isDefenceActive
>;

(getSystemRole as jest.MockedFunction<typeof getSystemRole>).mockReturnValue(
	systemRolePrompt
);

afterEach(() => {
	mockIsDefenceActive.mockReset();
	jest.clearAllMocks();
});

test('GIVEN level 1 AND system role is not in chat history WHEN setSystemRoleInChatHistory is called THEN it adds the system role to the chat history', () => {
	const chatHistory = setSystemRoleInChatHistory(
		LEVEL_NAMES.LEVEL_1,
		defencesSystemRoleActive,
		chatHistoryWithoutSystemRole
	);

	expect(chatHistory).toEqual(chatHistoryWithSystemRole);
});

test('GIVEN level 1 AND system role is in chat history WHEN setSystemRoleInChatHistory is called THEN no change to the chat history', () => {
	const chatHistory = setSystemRoleInChatHistory(
		LEVEL_NAMES.LEVEL_1,
		defencesSystemRoleActive,
		chatHistoryWithSystemRole
	);

	expect(chatHistory).toEqual(chatHistoryWithSystemRole);
});

test('GIVEN Sandbox AND system role defence active AND system role is not in chat history WHEN setSystemRoleInChatHistory is called THEN it adds the system role to the chat history', () => {
	mockIsDefenceActive.mockImplementation(() => true);
	const chatHistory = setSystemRoleInChatHistory(
		LEVEL_NAMES.SANDBOX,
		defencesSystemRoleActive,
		chatHistoryWithoutSystemRole
	);

	expect(chatHistory).toEqual(chatHistoryWithSystemRole);
});

test('GIVEN Sandbox AND system role defence active AND outdated system role in in chat history WHEN setSystemRoleInChatHistory is called THEN it updates the system role in the chat history', () => {
	mockIsDefenceActive.mockImplementation(() => true);

	const mockChatHistoryWithOutdatedSystemRole: ChatHistoryMessage[] = [
		{
			completion: { role: 'system', content: 'Yer a wizard, Harry.' },
			chatMessageType: CHAT_MESSAGE_TYPE.SYSTEM,
		},
		...chatHistoryWithoutSystemRole,
	];

	const chatHistory = setSystemRoleInChatHistory(
		LEVEL_NAMES.SANDBOX,
		defencesSystemRoleActive,
		mockChatHistoryWithOutdatedSystemRole
	);

	expect(chatHistory).toEqual(chatHistoryWithSystemRole);
});

test('GIVEN Sandbox AND system role defence not active AND system role is in chat history WHEN setSystemRoleInChatHistory is called THEN it removes the system role from the chat history', () => {
	mockIsDefenceActive.mockImplementation(() => false);
	const chatHistory = setSystemRoleInChatHistory(
		LEVEL_NAMES.SANDBOX,
		defencesSystemRoleActive,
		chatHistoryWithSystemRole
	);

	expect(chatHistory).toEqual(chatHistoryWithoutSystemRole);
});

test('GIVEN Sandbox AND system role defence not active AND system role is not in chat history WHEN setSystemRoleInChatHistory is called THEN no change to the chat history', () => {
	mockIsDefenceActive.mockImplementation(() => false);
	const chatHistory = setSystemRoleInChatHistory(
		LEVEL_NAMES.SANDBOX,
		defencesSystemRoleActive,
		chatHistoryWithoutSystemRole
	);

	expect(chatHistory).toEqual(chatHistoryWithoutSystemRole);
});
