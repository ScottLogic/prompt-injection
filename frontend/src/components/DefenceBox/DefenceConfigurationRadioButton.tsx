import './DefenceConfigurationRadioButton.css';

function DefenceConfigurationRadioButton({
	id,
	name,
	checked,
	onChange,
}: {
	id: string;
	name: string;
	checked: boolean;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
	return (
		<label className="defence-radio-button">
			<input
				type="radio"
				id={id}
				name="defence-option"
				value={id}
				checked={checked}
				onChange={onChange}
			/>
			<span>{name}</span>
		</label>
	);
}

export default DefenceConfigurationRadioButton;
