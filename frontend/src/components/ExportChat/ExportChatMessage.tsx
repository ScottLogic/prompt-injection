import { Text, View, StyleSheet } from '@react-pdf/renderer';

import { CHAT_MESSAGE_TYPE, ChatMessage } from '@src/models/chat';

const styles = StyleSheet.create({
	chatBoxMessageBot: {
		borderColor: '#888',
		borderRadius: 8,
		borderStyle: 'solid',
		borderWidth: 1,
		marginTop: 8,
		padding: 8,
		maxWidth: '85%',
		hyphens: 'auto',
		whiteSpace: 'pre-line',
		wordWrap: 'break-word',
		float: 'left',
		textAlign: 'left',
	},
	chatBoxMessage: {
		borderColor: '#888',
		borderRadius: 8,
		borderStyle: 'solid',
		borderWidth: 1,
		marginTop: 8,
		padding: 8,
		maxWidth: '85%',
		hyphens: 'auto',
		whiteSpace: 'pre-line',
		wordWrap: 'break-word',
		float: 'right',
		marginLeft: 'auto',
		textAlign: 'right',
	},
	chatBoxInfo: {
		marginTop: 8,
		marginBottom: 8,
	},
	text: {
		fontSize: 10,
	},
});

function getFullPrefix(message: ChatMessage) {
	switch (message.type) {
		case 'INFO':
		case 'DEFENCE_ALERTED':
		case 'RESET_LEVEL':
		case 'DEFENCE_TRIGGERED':
			return `Info: ${message.message}`;
		case 'USER':
			return `You: ${message.message}`;
		case 'USER_TRANSFORMED':
			return `You (transformed): ${message.message}`;
		case 'ERROR_MSG':
			return `Error: ${message.message}`;
		case 'BOT':
			return `Bot: ${message.message}`;
		case 'BOT_BLOCKED':
			return `Bot (blocked): ${message.message}`;
		default:
			return message.message;
	}
}

function getMessageStyle(type: CHAT_MESSAGE_TYPE) {
	switch (type) {
		case 'INFO':
		case 'DEFENCE_ALERTED':
		case 'RESET_LEVEL':
		case 'DEFENCE_TRIGGERED':
			return styles.chatBoxInfo;
		case 'BOT_BLOCKED':
		case 'BOT':
		case 'LEVEL_INFO':
		case 'ERROR_MSG':
			return styles.chatBoxMessageBot;
		case 'USER':
		default:
			return styles.chatBoxMessage;
	}
}

function ExportChatMessage({ message }: { message: ChatMessage }) {
	return (
		<View style={getMessageStyle(message.type)}>
			<Text style={styles.text}>{getFullPrefix(message)}</Text>
		</View>
	);
}

export default ExportChatMessage;
