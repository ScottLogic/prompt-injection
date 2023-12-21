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
	return (
		<div className="defence-box">
			{defences.map((defence, index) => {
				return (
					<DefenceMechanism
						key={index}
						defenceDetail={defence}
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
