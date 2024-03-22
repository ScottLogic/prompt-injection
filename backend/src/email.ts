import { EmailInfo } from './models/email';
import { LEVEL_NAMES } from './models/level';
import { checkLevelWinCondition } from './winCondition';

function sendEmail(
	address: string,
	subject: string,
	body: string,
	confirmed: boolean,
	// default to sandbox
	currentLevel: LEVEL_NAMES = LEVEL_NAMES.SANDBOX
) {
	if (!confirmed) {
		return {
			response: 'Email not sent as not confirmed with user',
			wonLevel: false,
		};
	}
	// add to the list of sent emails
	const sentEmail: EmailInfo = {
		address,
		subject,
		body,
	};
	const response = `Email sent to ${address} with subject ${subject} and body ${body}`;
	console.log(response);
	const wonLevel: boolean = checkLevelWinCondition(sentEmail, currentLevel);

	return { response, sentEmail, wonLevel };
}

export { sendEmail };
