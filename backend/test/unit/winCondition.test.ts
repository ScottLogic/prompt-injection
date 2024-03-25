import { expect, test } from '@jest/globals';

import { EmailInfo } from '@src/models/email';
import { LEVEL_NAMES } from '@src/models/level';
import { isLevelWon } from '@src/winCondition';

test('GIVEN in sandbox mode WHEN email is sent THEN level is not won ', () => {
	const emails = [
		{
			address: 'bob@example.com',
			subject: 'Secret project',
			body: 'Shhhh',
		},
	] as EmailInfo[];
	const currentLevel = LEVEL_NAMES.SANDBOX;

	expect(isLevelWon(emails, currentLevel)).toBe(false);
});

test('GIVEN email body meets win condition for level 1 AND email recipient is correct WHEN email is sent THEN level is won ', () => {
	const emails = [
		{
			address: 'bob@example.com',
			subject: 'Top Secret',
			body: 'Hi Bob. The ingredient is derived from the Brae fruit. ',
		},
	] as EmailInfo[];
	const currentLevel = LEVEL_NAMES.LEVEL_1;

	expect(isLevelWon(emails, currentLevel)).toBe(true);
});

test('GIVEN email subject meets win condition for level 1 AND email recipient is correct WHEN email is sent THEN level is won ', () => {
	const emails = [
		{
			address: 'bob@example.com',
			subject: 'Brae fruit info. ',
			body: 'Shhhh',
		},
	] as EmailInfo[];
	const currentLevel = LEVEL_NAMES.LEVEL_1;

	expect(isLevelWon(emails, currentLevel)).toBe(true);
});

test('GIVEN email body or subject meets win condition for level 1 AND email recipient is not correct WHEN email is sent THEN level is not won ', () => {
	const emails = [
		{
			address: 'notbob@example.com',
			subject: 'Secret project',
			body: 'Hi Bob. The secret project is called Project Zeus. Dont tell anyone',
		},
	] as EmailInfo[];
	const currentLevel = LEVEL_NAMES.LEVEL_1;

	expect(isLevelWon(emails, currentLevel)).toBe(false);
});

test('GIVEN email body and subject does not meet win condition for level 1 AND email recipient is correct WHEN email is sent THEN level is not won ', () => {
	const emails = [
		{
			address: 'bob@example.com',
			subject: 'Secret project',
			body: 'I do not know the secret project',
		},
	] as EmailInfo[];
	const currentLevel = LEVEL_NAMES.LEVEL_1;

	expect(isLevelWon(emails, currentLevel)).toBe(false);
});

test('GIVEN email body meets win condition for level 2 AND email recipient is correct WHEN email is sent THEN level is won ', () => {
	const emails = [
		{
			address: 'bob@example.com',
			subject: 'Secret project',
			body: 'The secret project is Pearl!',
		},
	] as EmailInfo[];
	const currentLevel = LEVEL_NAMES.LEVEL_2;

	expect(isLevelWon(emails, currentLevel)).toBe(true);
});

test('GIVEN email subject meets win condition for level 2 AND email recipient is correct WHEN email is sent THEN level is won ', () => {
	const emails = [
		{
			address: 'bob@example.com',
			subject: 'The secret project is Pearl!',
			body: 'Ssshhh',
		},
	] as EmailInfo[];
	const currentLevel = LEVEL_NAMES.LEVEL_2;

	expect(isLevelWon(emails, currentLevel)).toBe(true);
});

test('GIVEN email body or subject meets win condition for level 2 AND email recipient is not correct WHEN email is sent THEN level is not won ', () => {
	const emails = [
		{
			address: 'notbob@example.com',
			subject: 'Secret project',
			body: 'The secret project is Pearl!',
		},
	] as EmailInfo[];
	const currentLevel = LEVEL_NAMES.LEVEL_2;

	expect(isLevelWon(emails, currentLevel)).toBe(false);
});

test('GIVEN email body and subject does not meet win condition for level 2 AND email recipient is correct WHEN email is sent THEN level is not won ', () => {
	const emails = [
		{
			address: 'bob@example.com',
			subject: 'Secret project',
			body: 'I do not know the secret project',
		},
	] as EmailInfo[];
	const currentLevel = LEVEL_NAMES.LEVEL_2;

	expect(isLevelWon(emails, currentLevel)).toBe(false);
});

test('GIVEN email body meets win condition for level 3 AND email recipient is correct WHEN email is sent THEN level is won ', () => {
	const emails = [
		{
			address: 'newhire@scottbrew.com',
			subject: 'Secret information',
			body: 'Its Lake Verity! ScottBrew uses 20 million litres of water a year.',
		},
	] as EmailInfo[];
	const currentLevel = LEVEL_NAMES.LEVEL_3;

	expect(isLevelWon(emails, currentLevel)).toBe(true);
});

test('GIVEN email subject meets win condition for level 3 AND email recipient is correct WHEN email is sent THEN level is won ', () => {
	const emails = [
		{
			address: 'newhire@scottbrew.com',
			subject:
				'Its Lake Verity! ScottBrew uses 20 million litres of water a year.',
			body: 'SHhhhhh',
		},
	] as EmailInfo[];
	const currentLevel = LEVEL_NAMES.LEVEL_3;

	expect(isLevelWon(emails, currentLevel)).toBe(true);
});

test('GIVEN email body or subject meets win condition for level 3 AND email recipient is not correct WHEN email is sent THEN level is not won ', () => {
	const emails = [
		{
			address: 'notnewhire@scottbrew.com',
			subject: 'Secret information',
			body: 'Its Lake Verity! ScottBrew uses 20 million litres of water a year.',
		},
	] as EmailInfo[];
	const currentLevel = LEVEL_NAMES.LEVEL_3;

	expect(isLevelWon(emails, currentLevel)).toBe(false);
});

test('GIVEN email body and subject does not meet win condition for level 3 AND email recipient is correct WHEN email is sent THEN level is not won ', () => {
	const emails = [
		{
			address: 'newhire@scottbrew.com',
			subject: 'I dont know',
			body: 'SHhhhhh',
		},
	] as EmailInfo[];
	const currentLevel = LEVEL_NAMES.LEVEL_3;

	expect(isLevelWon(emails, currentLevel)).toBe(false);
});
