import Outbox from '@src/assets/icons/Outbox.svg';
import { EmailInfo } from '@src/models/email';

import './SentEmail.css';

function SentEmail({ emailDetails }: { emailDetails: EmailInfo }) {
	return (
		// eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
		<div className="sent-email" tabIndex={0}>
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
				<hr aria-hidden />
				<span className="visually-hidden">Email body: </span>
				<p>{emailDetails.body}</p>
			</div>
		</div>
	);
}

export default SentEmail;
