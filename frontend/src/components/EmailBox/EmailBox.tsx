import { useRef } from 'react';

import SentEmail from './SentEmail';

import useIsOverflow from '@src/hooks/useIsOverflow';
import { EmailInfo } from '@src/models/email';

import './EmailBox.css';

function EmailBox({ emails }: { emails: EmailInfo[] }) {
	const emailBoxContainer = useRef<HTMLDivElement>(null);
	const isOverflow = useIsOverflow(emailBoxContainer);

	return (
		<div
			className="email-box"
			ref={emailBoxContainer}
			// eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
			tabIndex={isOverflow ? 0 : undefined}
		>
			{[...emails].reverse().map((email, index) => (
				<SentEmail emailDetails={email} key={index} />
			))}
		</div>
	);
}

export default EmailBox;
