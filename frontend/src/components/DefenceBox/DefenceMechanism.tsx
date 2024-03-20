import DetailElement from '@src/components/ThemedButtons/DetailElement';
import {
	DEFENCE_ID,
	DefenceConfigItem,
	Defence,
	DEFENCE_CONFIG_ITEM_ID,
} from '@src/models/defence';

import DefenceConfiguration from './DefenceConfiguration';
import PromptEnclosureDefenceMechanism from './PromptEnclosureDefenceMechanism';

import './DefenceMechanism.css';

function DefenceMechanism({
	defenceDetail,
	showConfigurations,
	promptEnclosureDefences,
	toggleDefence,
	resetDefenceConfiguration,
	setDefenceConfiguration,
}: {
	defenceDetail: Defence;
	showConfigurations: boolean;
	promptEnclosureDefences: Defence[];
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
	function resetConfigurationValue(
		defence: Defence,
		configItemId: DEFENCE_CONFIG_ITEM_ID
	) {
		resetDefenceConfiguration(defence.id, configItemId);
	}

	async function setConfigurationValue(
		defence: Defence,
		configId: string,
		value: string
	) {
		const newConfiguration = defence.config.map((config) => {
			if (config.id === configId) {
				config.value = value;
			}
			return config;
		});
		await setDefenceConfiguration(defence.id, newConfiguration);
	}

	return (
		<fieldset className="defence-mechanism-fieldset">
			<legend className="defence-mechanism-legend">{defenceDetail.name}</legend>
			{defenceDetail.id !== DEFENCE_ID.PROMPT_ENCLOSURE && (
				<form className="defence-mechanism-form">
					<div className="toggles">
						<input
							id={defenceDetail.id}
							className="visually-hidden"
							type="checkbox"
							placeholder="defence-toggle"
							onChange={() => {
								toggleDefence(defenceDetail);
							}}
							// set checked if defence is active
							checked={defenceDetail.isActive}
						/>
						<label htmlFor={defenceDetail.id}>
							{defenceDetail.isActive ? 'on' : 'off'}
						</label>
					</div>
				</form>
			)}
			{defenceDetail.id !== DEFENCE_ID.PROMPT_ENCLOSURE ? (
				showConfigurations &&
				defenceDetail.config.map((config) => {
					return (
						<DetailElement useIcon={false} key={config.id}>
							<p>{defenceDetail.info}</p>
							<DefenceConfiguration
								defence={defenceDetail}
								isActive={defenceDetail.isActive}
								config={config}
								setConfigurationValue={setConfigurationValue}
								resetConfigurationValue={resetConfigurationValue}
							/>
						</DetailElement>
					);
				})
			) : (
				<DetailElement useIcon={false}>
					<p>{defenceDetail.info}</p>
					<PromptEnclosureDefenceMechanism
						defences={promptEnclosureDefences}
						toggleDefence={toggleDefence}
						showConfigurations={showConfigurations}
						setConfigurationValue={setConfigurationValue}
						resetConfigurationValue={resetConfigurationValue}
					/>
				</DetailElement>
			)}
		</fieldset>
	);
}

export default DefenceMechanism;
