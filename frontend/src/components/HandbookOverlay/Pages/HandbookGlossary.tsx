import { LEVEL_NAMES } from '@src/models/level';

import { GLOSSARY } from './Glossary';

import './HandbookPage.css';

function HandbookGlossary({ currentLevel }: { currentLevel: LEVEL_NAMES }) {
	function getHeaderText(level: LEVEL_NAMES) {
		return level === LEVEL_NAMES.LEVEL_1
			? 'Here you can read about some concepts that are useful to know about as you learn while playing this game. More information will be unlocked here as you progress through the each level, so be sure to check back often!'
			: 'Below are some concepts that you may find useful to know about as you learn while playing this game.';
	}
	return (
		<article className="handbook-page">
			<div>
				<h2>Glossary</h2>
				<p>{getHeaderText(currentLevel)}</p>
			</div>
			{currentLevel > LEVEL_NAMES.LEVEL_1 && (
				<dl className="handbook-terms">
					{GLOSSARY.map(({ term, definition }) => (
						<div className="term" key={term}>
							<dt>{term}</dt>
							<dd>{definition}</dd>
						</div>
					))}
				</dl>
			)}
		</article>
	);
}

export default HandbookGlossary;
