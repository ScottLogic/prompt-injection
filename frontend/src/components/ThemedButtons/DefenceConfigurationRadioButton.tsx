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
		<div className="defence-radio-button" key={id}>
			<input
				type="radio"
				id={id}
				name={name}
				value={id}
				checked={checked}
				onChange={onChange}
			/>
			<label htmlFor={id}>{name}</label>
		</div>
	);
}

export default DefenceConfigurationRadioButton;
