import { useState } from 'react';

import DocumentViewBox from './DocumentViewBox';
import ThemedButton from '@src/components/ThemedButtons/ThemedButton';

import './DocumentViewButton.css';

function DocumentViewButton() {
	const [showPopup, setShowPopup] = useState(false);

	return (
		<div className="document-view-button-wrapper">
			<ThemedButton
				onClick={() => {
					setShowPopup(true);
				}}
			>
				View Documents
			</ThemedButton>
			<DocumentViewBox
				show={showPopup}
				onClose={() => {
					setShowPopup(false);
				}}
			/>
		</div>
	);
}

export default DocumentViewButton;
