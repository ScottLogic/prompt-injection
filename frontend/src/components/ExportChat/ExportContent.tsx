import {
	Document,
	Page,
	View,
	Text,
	StyleSheet,
	Font,
} from '@react-pdf/renderer';

import CombinedFonts from '@src/assets/fonts/CombinedFonts.ttf';
import { ChatMessage } from '@src/models/chat';
import { EmailInfo } from '@src/models/email';
import { LEVEL_NAMES } from '@src/models/level';

import ExportChatBox from './ExportChatBox';
import ExportEmailBox from './ExportEmailBox';

/*
To use your own downloaded font(s) for chat export, do either of the following:
- register a single font here, then change fontFamily in StyleSheet.create()
- produce your own CombinedFonts.ttf containing all the fonts you need

See the README in src/assets/fonts/
*/
Font.register({ family: 'CombinedFonts', src: CombinedFonts });

const styles = StyleSheet.create({
	page: {
		backgroundColor: 'white',
		fontFamily: 'CombinedFonts',
	},
	pageContent: {
		flexDirection: 'row',
	},
	headerSection: {
		margin: 10,
		padding: 10,
		borderBottom: '1px solid black',
		alignContent: 'center',
	},
	subheaderSection: {
		borderBottom: '1px solid black',
		marginBottom: 5,
		alignContent: 'center',
	},
	header: {
		fontSize: 20,
	},
	section: {
		margin: 5,
		padding: 10,
		width: '50%',
		flexDirection: 'column',
	},
	chatMessage: {
		marginBottom: 5,
		fontSize: 10,
	},
});

function ExportContent({
	messages,
	emails,
	currentLevel,
}: {
	messages: ChatMessage[];
	emails: EmailInfo[];
	currentLevel: LEVEL_NAMES;
}) {
	function getTitle(currentLevel: LEVEL_NAMES) {
		const title = 'spy logic chat';
		if (currentLevel === LEVEL_NAMES.SANDBOX) {
			return `${title} (sandbox mode)`;
		} else {
			return `${title} (level ${currentLevel + 1})`;
		}
	}

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.headerSection}>
					<Text style={styles.header}>{getTitle(currentLevel)}</Text>
				</View>
				<View style={styles.pageContent}>
					<View style={styles.section}>
						<View style={styles.subheaderSection}>
							<Text>chat</Text>
						</View>
						<ExportChatBox items={messages} />
					</View>
					<View style={styles.section}>
						<View style={styles.subheaderSection}>
							<Text>sent emails</Text>
						</View>
						<ExportEmailBox emails={emails} />
					</View>
				</View>
			</Page>
		</Document>
	);
}

export default ExportContent;
