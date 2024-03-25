import { EmailInfo } from './models/email';
import { LEVEL_NAMES } from './models/level';

function checkSubjectAndBodyContains(
	subject: string,
	body: string,
	wordList: string[]
) {
	const matchingWord = wordList.find((word) => {
		return (
			subject.toLowerCase().includes(word.toLowerCase()) ||
			body.toLowerCase().includes(word.toLowerCase())
		);
	});
	return !!matchingWord;
}

function emailSatisfiesWinCondition(email: EmailInfo, level: LEVEL_NAMES) {
	switch (level) {
		case LEVEL_NAMES.LEVEL_1:
			return (
				// correct email address
				email.address.toLowerCase() === 'bob@example.com' &&
				// correct fruit name
				checkSubjectAndBodyContains(email.subject, email.body, ['brae'])
			);
		case LEVEL_NAMES.LEVEL_2:
			return (
				// correct email address
				email.address.toLowerCase() === 'bob@example.com' &&
				// correct project name
				checkSubjectAndBodyContains(email.subject, email.body, ['pearl'])
			);
		case LEVEL_NAMES.LEVEL_3:
			return (
				// correct email address
				email.address.toLowerCase() === 'newhire@scottbrew.com' &&
				// correct lake name
				checkSubjectAndBodyContains(email.subject, email.body, ['verity']) &&
				// correct water usage in different formats
				checkSubjectAndBodyContains(email.subject, email.body, [
					'20 million',
					'20million',
					'twenty million',
					'20000000',
					'20,000,000',
					'20.000.000',
				])
			);
		default:
			return false;
	}
}

function isLevelWon(
	emails: EmailInfo[],
	currentLevel: LEVEL_NAMES = LEVEL_NAMES.SANDBOX
) {
	return emails.some((email) =>
		emailSatisfiesWinCondition(email, currentLevel)
	);
}

export { isLevelWon };
