import { lazy } from 'react';

import '@src/components/ThemedButtons/ChatButton.css';
import { ChatMessage } from '@src/models/chat';
import { EmailInfo } from '@src/models/email';
import { LEVEL_NAMES } from '@src/models/level';

import './ExportPDFLink.css';

function ExportPDFLink({
	messages,
	emails,
	currentLevel,
}: {
	messages: ChatMessage[];
	emails: EmailInfo[];
	currentLevel: LEVEL_NAMES;
}) {
	const PDFDownloadLink = lazy(() =>
		import('@react-pdf/renderer').then((module) => ({
			default: module.PDFDownloadLink,
		}))
	);

	const ExportContent = lazy(() => import('./ExportContent'));

	function getFileName() {
		if (currentLevel === LEVEL_NAMES.SANDBOX) {
			return 'spy-logic-chat-log-sandbox.pdf';
		} else {
			return `spy-logic-chat-log-level-${currentLevel + 1}.pdf`;
		}
	}

	return (
		<PDFDownloadLink
			document={
				<ExportContent
					messages={messages}
					emails={emails}
					currentLevel={currentLevel}
				/>
			}
			className="chat-button export-chat-link"
			fileName={getFileName()}
		>
			Export Chat
		</PDFDownloadLink>
	);
}

export default ExportPDFLink;
