import './HandbookTerms.css';

import { ATTACKS_ALL, ATTACKS_LEVEL_2, ATTACKS_LEVEL_3 } from '@src/Attacks';
import { AttackInfo } from '@src/models/attack';
import { LEVEL_NAMES } from '@src/models/level';

function HandbookAttacks({ currentLevel }: { currentLevel: LEVEL_NAMES }) {
	const levelNameToAttacks = new Map<LEVEL_NAMES, AttackInfo[]>([
		[LEVEL_NAMES.LEVEL_1, []],
		[LEVEL_NAMES.LEVEL_2, ATTACKS_LEVEL_2],
		[LEVEL_NAMES.LEVEL_3, ATTACKS_LEVEL_3],
		[LEVEL_NAMES.SANDBOX, ATTACKS_ALL],
	]);

	const attacks = levelNameToAttacks.get(currentLevel) ?? ATTACKS_ALL;

	return (
		<dl className="handbook-terms">
			{attacks.map((attack) => (
				<div className="term" key={attack.id}>
					<dt>{attack.name}</dt>
					<dd>{attack.info}</dd>
				</div>
			))}
		</dl>
	);
}

export default HandbookAttacks;
