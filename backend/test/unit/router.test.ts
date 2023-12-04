import request from 'supertest';

import app from '@src/app';
import { ChatHttpResponse } from '@src/models/chat';
import { LEVEL_NAMES } from '@src/models/level';

jest.mock('@src/defence');

describe('/defence/configure', () => {
	it('WHEN configuration value exceeds character limit THEN does not configure defences', async () => {
		const CHARACTER_LIMIT = 5000;
		const longConfigValue = 'a'.repeat(CHARACTER_LIMIT + 1);
		const body = {
			defenceId: 'PROMPT_EVALUATION_LLM',
			config: [
				{
					id: 'prompt',
					name: 'prompt',
					value: longConfigValue,
				},
			],
			level: LEVEL_NAMES.SANDBOX,
		};

		await request(app)
			.post('/defence/configure')
			.send(body)
			.expect(400)
			.expect('Config value exceeds character limit');
	});
});

describe('/openai/chat', () => {
	const noMessageOrLevelResponse: ChatHttpResponse = {
		reply: 'Please send a message and current level to chat to me!',
		defenceReport: {
			blockedReason: 'Please send a message and current level to chat to me!',
			isBlocked: true,
			alertedDefences: [],
			triggeredDefences: [],
		},
		transformedMessage: '',
		wonLevel: false,
		isError: true,
	};

	it('WHEN no message is provided THEN does not accept message', async () => {
		await request(app)
			.post('/openai/chat')
			.send({ level: LEVEL_NAMES.SANDBOX })
			.expect(400)
			.expect(noMessageOrLevelResponse);
	});

	it('WHEN no level is provided THEN does not accept message', async () => {
		await request(app)
			.post('/openai/chat')
			.send({ message: 'hello' })
			.expect(400)
			.expect(noMessageOrLevelResponse);
	});

	it('WHEN message exceeds character limit THEN does not accept message', async () => {
		const CHARACTER_LIMIT = 16384;
		const longMessage = 'a'.repeat(CHARACTER_LIMIT + 1);

		const messageTooLongResponse: ChatHttpResponse = {
			reply: 'Message exceeds character limit',
			defenceReport: {
				blockedReason: 'Message exceeds character limit',
				isBlocked: true,
				alertedDefences: [],
				triggeredDefences: [],
			},
			transformedMessage: '',
			wonLevel: false,
			isError: true,
		};

		await request(app)
			.post('/openai/chat')
			.send({ message: longMessage, currentLevel: LEVEL_NAMES.SANDBOX })
			.expect(400)
			.expect(messageTooLongResponse);
	});
});
