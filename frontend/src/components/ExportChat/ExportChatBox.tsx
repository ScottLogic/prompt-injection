import { View, StyleSheet } from '@react-pdf/renderer';

import { ChatMessage } from '@src/models/chat';

import ExportChatMessage from './ExportChatMessage';

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
	},
});

function ExportChatBox({ items }: { items: ChatMessage[] }) {
	const rows = items.map((item, index) => (
		<View style={styles.row} key={index}>
			<ExportChatMessage message={item} />
		</View>
	));
	return <>{rows}</>;
}

export default ExportChatBox;
