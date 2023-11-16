import { useEffect, useRef, useState } from 'react';

import HandbookAttacks from './HandbookAttacks';
import HandbookCloseIcon from './HandbookCloseIcon';
import HandbookGlossary from './HandbookGlossary';
import './HandbookOverlay.css';
import HandbookSpine from './HandbookSpine';
import HandbookSystemRole from './HandbookSystemRole';

import useIsOverflow from '@src/hooks/useIsOverflow';
import { HANDBOOK_PAGES } from '@src/models/handbook';
import { LEVEL_NAMES } from '@src/models/level';
import { getLevelPrompt } from '@src/service/levelService';

function HandbookOverlay({
	currentLevel,
	closeOverlay,
}: {
	currentLevel: LEVEL_NAMES;
	closeOverlay: () => void;
}) {
	const [selectedPage, setSelectedPage] = useState<HANDBOOK_PAGES>(
		HANDBOOK_PAGES.ATTACKS
	);
	const [levelSystemRole, setLevelSystemRole] = useState<string>('');

	// hooks to control tabIndex when there is scrolling
	const handBookPageContainer = useRef<HTMLDivElement>(null);
	const isOverflow = useIsOverflow(handBookPageContainer);

	// update system role when currentLevel changes to display in handbook
	useEffect(() => {
		if (
			currentLevel > LEVEL_NAMES.LEVEL_1 &&
			currentLevel < LEVEL_NAMES.SANDBOX
		) {
			getLevelPrompt(currentLevel - 1)
				.then((prompt) => {
					setLevelSystemRole(prompt);
				})
				.catch((err) => {
					console.log(err);
				});
		}
	}, [currentLevel]);

	const pageContent = {
		[HANDBOOK_PAGES.ATTACKS]: <HandbookAttacks currentLevel={currentLevel} />,
		[HANDBOOK_PAGES.GLOSSARY]: <HandbookGlossary />,
		[HANDBOOK_PAGES.SYSTEM_ROLE]: (
			<HandbookSystemRole level={currentLevel} systemRole={levelSystemRole} />
		),
	}[selectedPage];

	return (
		<div className="handbook-overlay">
			<button
				className="prompt-injection-min-button close-button"
				title="close the handbook"
				aria-label="close the handbook"
				onClick={closeOverlay}
			>
				<HandbookCloseIcon />
			</button>
			<HandbookSpine
				currentLevel={currentLevel}
				currentPage={selectedPage}
				selectPage={setSelectedPage}
			/>
			<div
				id={`handbook-page-${selectedPage}`}
				className="content"
				role="tabpanel"
				ref={handBookPageContainer}
				tabIndex={isOverflow ? 0 : undefined}
				aria-labelledby={`handbook-tab-${selectedPage}`}
			>
				{pageContent}
			</div>
		</div>
	);
}

export default HandbookOverlay;
