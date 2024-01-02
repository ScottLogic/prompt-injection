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
		<label className="defence-radio-button" key={id}>
			<input
				type="radio"
				name={name}
				value={id}
				checked={checked}
				onChange={onChange}
			/>
			<span className="checkmark"></span>
			<span className="label">{name}</span>
		</label>
	);
}

export default DefenceConfigurationRadioButton;
