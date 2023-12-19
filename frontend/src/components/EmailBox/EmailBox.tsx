import { useRef } from 'react';

import useIsOverflow from '@src/hooks/useIsOverflow';
import { EmailInfo } from '@src/models/email';

import SentEmail from './SentEmail';

import './EmailBox.css';

function EmailBox({ emails }: { emails: EmailInfo[] }) {
	const emailBoxContainer = useRef<HTMLDivElement>(null);
	const isOverflow = useIsOverflow(emailBoxContainer);

	return (
		<section
			className="email-box"
			ref={emailBoxContainer}
			// eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
			tabIndex={isOverflow ? 0 : undefined}
			aria-live="polite"
		>
			<h2 className="visually-hidden">Email outbox</h2>
			{[...emails].map((email, index) => (
				<SentEmail emailDetails={email} key={index} />
			))}
		</section>
	);
}

export default EmailBox;
