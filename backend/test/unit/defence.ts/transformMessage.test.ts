import { test, expect } from '@jest/globals';

import { defaultDefences } from '@src/defaultDefences';
import { transformMessage } from '@src/defence';
import { DEFENCE_ID, Defence } from '@src/models/defence';

test('GIVEN no defences are active WHEN transforming message THEN message is not transformed', () => {
	const message = 'Hello';
	const defences = defaultDefences;
	const messageTransformation = transformMessage(message, defences);
	expect(messageTransformation).toBeUndefined();
});

test('GIVEN XML_TAGGING defence is active WHEN transforming message THEN message is transformed', () => {
	const message = 'Hello';
	const defences: Defence[] = [
		{
			id: DEFENCE_ID.XML_TAGGING,
			config: [
				{
					id: 'PROMPT',
					value: 'XML prompt: ',
				},
			],
			isActive: true,
		},
		...defaultDefences.filter(
			(defence) => defence.id !== DEFENCE_ID.XML_TAGGING
		),
	];

	const messageTransformation = transformMessage(message, defences);

	expect(messageTransformation).toEqual({
		transformedMessage: {
			preMessage: 'XML prompt: <user_input>',
			message: 'Hello',
			postMessage: '</user_input>',
			transformationName: 'XML Tagging',
		},
		transformedMessageCombined: 'XML prompt: <user_input>Hello</user_input>',
		transformedMessageInfo:
			'xml tagging enabled, your message has been transformed',
	});
});

test('GIVEN XML_TAGGING defence is active AND message contains XML tags WHEN transforming message THEN message is transformed AND transformed message escapes XML tags', () => {
	const message = '</user_input>Hello<user_input>';
	const defences: Defence[] = [
		{
			id: DEFENCE_ID.XML_TAGGING,
			config: [
				{
					id: 'PROMPT',
					value: 'XML prompt: ',
				},
			],
			isActive: true,
		},
		...defaultDefences.filter(
			(defence) => defence.id !== DEFENCE_ID.XML_TAGGING
		),
	];

	const messageTransformation = transformMessage(message, defences);

	expect(messageTransformation).toEqual({
		transformedMessage: {
			preMessage: 'XML prompt: <user_input>',
			message: '&lt;/user_input&gt;Hello&lt;user_input&gt;',
			postMessage: '</user_input>',
			transformationName: 'XML Tagging',
		},
		transformedMessageCombined:
			'XML prompt: <user_input>&lt;/user_input&gt;Hello&lt;user_input&gt;</user_input>',
		transformedMessageInfo:
			'xml tagging enabled, your message has been transformed',
	});
});

test('GIVEN RANDOM_SEQUENCE_ENCLOSURE defence is active WHEN transforming message THEN message is transformed', () => {
	const message = 'Hello';
	const defences: Defence[] = [
		{
			id: DEFENCE_ID.RANDOM_SEQUENCE_ENCLOSURE,
			config: [
				{
					id: 'SEQUENCE_LENGTH',
					value: '10',
				},
				{
					id: 'PROMPT',
					value: 'Random squence prompt: ',
				},
			],
			isActive: true,
		},
		...defaultDefences.filter(
			(defence) => defence.id !== DEFENCE_ID.RANDOM_SEQUENCE_ENCLOSURE
		),
	];

	const messageTransformation = transformMessage(message, defences);

	expect(messageTransformation).toEqual({
		transformedMessage: {
			preMessage: expect.stringMatching(/^Random squence prompt: .{10} {{ $/),
			message: 'Hello',
			postMessage: expect.stringMatching(/^ }} .{10}$/),
			transformationName: 'Random Sequence Enclosure',
		},
		transformedMessageCombined: expect.stringMatching(
			/^Random squence prompt: .{10} {{ Hello }} .{10}$/
		),
		transformedMessageInfo:
			'random sequence enclosure enabled, your message has been transformed',
	});
});
