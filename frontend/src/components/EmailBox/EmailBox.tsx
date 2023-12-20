import { useEffect, useRef } from 'react';

import { EmailInfo } from '@src/models/email';

import SentEmail from './SentEmail';

import './EmailBox.css';

function EmailBox({ emails }: { emails: EmailInfo[] }) {
	const emailBoxContainer = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (emailBoxContainer.current) {
			emailBoxContainer.current.scrollTop =
				emailBoxContainer.current.scrollHeight;
		}
	}, [emails]);

	return (
		<section className="email-box" ref={emailBoxContainer} aria-live="polite">
			<h2 className="visually-hidden">Email outbox</h2>
			{[...emails].map((email, index) => (
				<SentEmail emailDetails={email} key={index} />
			))}
		</section>
	);
}

export default EmailBox;
