import { EmailInfo } from './models/email';

function sendEmail(
	address: string,
	subject: string,
	body: string,
	confirmed: boolean
) {
	if (!confirmed) {
		return {
			response: 'Email not sent as not confirmed with user',
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

	return { response, sentEmail };
}

export { sendEmail };
