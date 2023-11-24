import { EmailInfo } from '@src/models/email';

import './SentEmail.css';

function SentEmail({ emailDetails }: { emailDetails: EmailInfo }) {
	return (
		<div className="sent-email">
			<p>
				<b>To:</b> {emailDetails.address}
			</p>
			<p>
				<b>Subject:</b> {emailDetails.subject}
			</p>
			<hr />
			<p>{emailDetails.body}</p>
		</div>
	);
}

export default SentEmail;
