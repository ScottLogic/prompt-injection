import { PROMPT_ENCLOSURE_DEFENCES } from '@src/Defences';
import { DEFENCE_ID, DefenceConfigItem, Defence } from '@src/models/defence';

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
	resetDefenceConfiguration: (defenceId: DEFENCE_ID, configId: string) => void;
	setDefenceConfiguration: (
		defenceId: DEFENCE_ID,
		config: DefenceConfigItem[]
	) => Promise<boolean>;
}) {
	function getPromptEnclosureDefences() {
		return defences.filter((defence) => {
			return PROMPT_ENCLOSURE_DEFENCES.some((id) => id === defence.id);
		});
	}
	function getNotPromptEnclosureDefences() {
		return defences.filter((defence) => {
			return !PROMPT_ENCLOSURE_DEFENCES.some((id) => id === defence.id);
		});
	}

	return (
		<div className="defence-box">
			{getNotPromptEnclosureDefences().map((defence, index) => {
				return (
					<DefenceMechanism
						key={index}
						defenceDetail={defence}
						promptEnclosureDefences={getPromptEnclosureDefences()}
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
