import { ATTACKS_ALL, ATTACKS_LEVEL_2, ATTACKS_LEVEL_3 } from '@src/Attacks';
import { AttackInfo } from '@src/models/attack';
import { LEVEL_NAMES } from '@src/models/level';

import './HandbookPage.css';

function HandbookAttacks({ currentLevel }: { currentLevel: LEVEL_NAMES }) {
	const levelNameToAttacks = new Map<LEVEL_NAMES, AttackInfo[]>([
		[LEVEL_NAMES.LEVEL_1, []],
		[LEVEL_NAMES.LEVEL_2, ATTACKS_LEVEL_2],
		[LEVEL_NAMES.LEVEL_3, ATTACKS_LEVEL_3],
		[LEVEL_NAMES.SANDBOX, ATTACKS_ALL],
	]);

	function getHeaderText(level: LEVEL_NAMES) {
		return level === LEVEL_NAMES.LEVEL_1
			? 'Here you can read about some of the attacks you may attempt to bypass the bots security protocols. More information will be unlocked here as you progress through the each level, so be sure to check back often!'
			: 'There are many ways you might attempt to trick the bot into behaving in a way that it was not intended. Below are some examples of methods you might consider to attempt to fool the bot into revealing confidential information.';
	}

	const attacks = levelNameToAttacks.get(currentLevel) ?? ATTACKS_ALL;

	return (
		<article className="handbook-page">
			<div>
				<h2>Attacks</h2>
				<p>{getHeaderText(currentLevel)}</p>
			</div>
			{currentLevel > LEVEL_NAMES.LEVEL_1 && (
				<dl className="handbook-terms">
					{attacks.map((attack) => (
						<div className="term" key={attack.id}>
							<dt>{attack.name}</dt>
							<dd>{attack.info}</dd>
						</div>
					))}
				</dl>
			)}
		</article>
	);
}

export default HandbookAttacks;
