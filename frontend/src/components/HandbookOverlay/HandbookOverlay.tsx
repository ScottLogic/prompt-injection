import { useRef, useState } from 'react';

import OverlayHeader from '@src/components/Overlay/OverlayHeader';
import useIsOverflow from '@src/hooks/useIsOverflow';
import { HANDBOOK_PAGES } from '@src/models/handbook';
import { LEVEL_NAMES, LevelSystemRole } from '@src/models/level';

import HandbookAttacks from './HandbookAttacks';
import HandbookGlossary from './HandbookGlossary';
import HandbookSpine from './HandbookSpine';
import HandbookSystemRole from './HandbookSystemRole';

import './HandbookOverlay.css';

function HandbookOverlay({
	currentLevel,
	numCompletedLevels,
	systemRoles,
	closeOverlay,
}: {
	currentLevel: LEVEL_NAMES;
	numCompletedLevels: number;
	systemRoles: LevelSystemRole[];
	closeOverlay: () => void;
}) {
	const [selectedPage, setSelectedPage] = useState<HANDBOOK_PAGES>(
		HANDBOOK_PAGES.ATTACKS
	);

	// hooks to control tabIndex when there is scrolling
	const handBookPageContainer = useRef<HTMLDivElement>(null);
	const isOverflow = useIsOverflow(handBookPageContainer);

	const pageContent = {
		[HANDBOOK_PAGES.ATTACKS]: <HandbookAttacks currentLevel={currentLevel} />,
		[HANDBOOK_PAGES.GLOSSARY]: <HandbookGlossary currentLevel={currentLevel} />,
		[HANDBOOK_PAGES.SYSTEM_ROLE]: (
			<HandbookSystemRole
				numCompletedLevels={numCompletedLevels}
				systemRoles={systemRoles}
			/>
		),
	}[selectedPage];

	return (
		<div className="handbook">
			<OverlayHeader closeOverlay={closeOverlay} heading="Handbook" />
			<div className="handbook-overlay">
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
		</div>
	);
}

export default HandbookOverlay;
