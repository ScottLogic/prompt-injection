import { PROMPT_ENCLOSURE_DEFENCES } from '@src/defences';
import {
	DEFENCE_ID,
	DefenceConfigItem,
	Defence,
	DEFENCE_CONFIG_ITEM_ID,
} from '@src/models/defence';

import DefenceMechanism from './DefenceMechanism';

import './DefenceBox.css';

function DefenceBox({
	defences,
	showConfigurations,
	toggleDefence,
	resetDefenceConfiguration,
	setDefenceConfiguration,
}: {
	currentLevel: number;
	defences: Defence[];
	showConfigurations: boolean;
	toggleDefence: (defence: Defence) => void;
	resetDefenceConfiguration: (
		defenceId: DEFENCE_ID,
		configItemId: DEFENCE_CONFIG_ITEM_ID
	) => void;
	setDefenceConfiguration: (
		defenceId: DEFENCE_ID,
		config: DefenceConfigItem[]
	) => Promise<boolean>;
}) {
	const promptEnclosureDefences = defences.filter((defence) =>
		PROMPT_ENCLOSURE_DEFENCES.some((id) => id === defence.id)
	);
	const notPromptEnclosureDefences = defences.filter(
		(defence) => !promptEnclosureDefences.includes(defence)
	);

	return (
		<div className="defence-box">
			{notPromptEnclosureDefences.map((defence, index) => {
				return (
					<DefenceMechanism
						key={index}
						defenceDetail={defence}
						promptEnclosureDefences={promptEnclosureDefences}
						showConfigurations={showConfigurations}
						toggleDefence={toggleDefence}
						resetDefenceConfiguration={resetDefenceConfiguration}
						setDefenceConfiguration={setDefenceConfiguration}
					/>
				);
			})}
		</div>
	);
}

export default DefenceBox;
