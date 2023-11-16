import { StyleSheet, Text, View } from '@react-pdf/renderer';

import { EmailInfo } from '@src/models/email';

const styles = StyleSheet.create({
	sentEmail: {
		borderColor: '#ccc',
		borderRadius: 5,
		borderStyle: 'solid',
		borderWidth: 1,
		fontSize: 14,
		marginTop: 10,
		padding: 5,
		whiteSpace: 'pre-wrap',
	},
	sentEmailDivider: {
		borderBottom: '1px solid #ccc',
		margin: '5px 0',
		width: '100%',
	},
	text: {
		fontSize: 10,
	},
});

function ExportEmailMessage({ email }: { email: EmailInfo }) {
	return (
		<View style={styles.sentEmail}>
			<Text style={styles.text}>to: {email.address}</Text>
			<Text style={styles.text}>subject: {email.subject}</Text>
			<Text style={styles.sentEmailDivider}></Text>
			<Text style={styles.text}>{email.body}</Text>
		</View>
	);
}

export default ExportEmailMessage;
