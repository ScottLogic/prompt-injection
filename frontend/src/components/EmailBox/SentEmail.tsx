import Outbox from '@src/assets/icons/Outbox.svg';
import { EmailInfo } from '@src/models/email';

import './SentEmail.css';

function SentEmail({ emailDetails }: { emailDetails: EmailInfo }) {
	return (
		<div className="sent-email">
			<div className="sent-email-title">
				<img className="sent-email-icon" src={Outbox} alt="" />
				E-Mail
			</div>
			<div className="sent-email-main">
				<p>
					<b>To:</b> {emailDetails.address}
				</p>
				<p>
					<b>Subject:</b> {emailDetails.subject}
				</p>
				<hr />
				<p>{emailDetails.body}</p>
			</div>
		</div>
	);
}

export default SentEmail;
