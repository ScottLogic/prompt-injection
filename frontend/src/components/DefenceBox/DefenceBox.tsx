import DefenceMechanism from './DefenceMechanism';

import { DEFENCE_ID, DefenceConfigItem, Defence } from '@src/models/defence';

function DefenceBox({
	defences,
	showConfigurations,
	resetDefenceConfiguration,
	setDefenceActive,
	setDefenceInactive,
	setDefenceConfiguration,
}: {
	currentLevel: number;
	defences: Defence[];
	showConfigurations: boolean;
	resetDefenceConfiguration: (defenceId: DEFENCE_ID, configId: string) => void;
	setDefenceActive: (defence: Defence) => void;
	setDefenceInactive: (defence: Defence) => void;
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
						resetDefenceConfiguration={resetDefenceConfiguration}
						setDefenceActive={setDefenceActive}
						setDefenceInactive={setDefenceInactive}
						setDefenceConfiguration={setDefenceConfiguration}
					/>
				);
			})}
		</div>
	);
}

export default DefenceBox;
