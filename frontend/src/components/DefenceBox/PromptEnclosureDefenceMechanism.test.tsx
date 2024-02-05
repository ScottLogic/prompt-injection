import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { DEFENCE_ID, Defence } from '@src/models/defence';

import PromptEnclosureDefenceMechanism from './PromptEnclosureDefenceMechanism';

const mockDefences: Defence[] = [
	{
		id: DEFENCE_ID.XML_TAGGING,
		name: 'xml tagging',
		info: 'xml tagging description',
		config: [
			{
				id: 'PROMPT',
				inputType: 'text',
				name: 'xml tag prompt',
				value: 'this is xml tagging value',
			},
		],
		isActive: false,
	},
	{
		id: DEFENCE_ID.RANDOM_SEQUENCE_ENCLOSURE,
		name: 'random sequence enclosure',
		info: 'rse description',
		config: [
			{
				id: 'PROMPT',
				inputType: 'text',
				name: 'rse prompt',
				value: 'this is rse value',
			},
		],
		isActive: false,
	},
];

const mockToggleDefence = vi.fn();
const mockSetConfigurationValue = vi.fn();
const mockResetConfigurationValue = vi.fn();

function renderComponent(defences: Defence[] = mockDefences) {
	const user = userEvent.setup();
	render(
		<PromptEnclosureDefenceMechanism
			defences={defences}
			showConfigurations={true}
			toggleDefence={mockToggleDefence}
			setConfigurationValue={mockSetConfigurationValue}
			resetConfigurationValue={mockResetConfigurationValue}
		/>
	);
	return { user };
}

describe('PromptEnclosureDefenceMechanism component tests', () => {
	afterEach(() => {
		vi.resetAllMocks();
		mockToggleDefence.mockClear();
	});

	test('renders defence names plus Off option', () => {
		renderComponent();
		expect(screen.queryByText('xml tagging')).toBeInTheDocument();
		expect(screen.queryByText('random sequence enclosure')).toBeInTheDocument();

		const radioButtonsInput = screen.getAllByRole('radio');
		expect(radioButtonsInput).toHaveLength(mockDefences.length + 1);

		expect(radioButtonsInput[0]).toHaveAccessibleName('Off');
		expect(radioButtonsInput[1]).toHaveAccessibleName('xml tagging');
		expect(radioButtonsInput[2]).toHaveAccessibleName(
			'random sequence enclosure'
		);
	});

	test('when off is selected, no config items are rendered', async () => {
		const { user } = renderComponent();
		const radioButton = screen.getByRole('radio', { name: 'Off' });
		await user.click(radioButton);

		expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
		expect(screen.queryByText('rse description')).not.toBeInTheDocument();
		expect(screen.queryByText('rse prompt')).not.toBeInTheDocument();
		expect(
			screen.queryByText('xml tagging description')
		).not.toBeInTheDocument();

		expect(screen.queryByText('rse prompt')).not.toBeInTheDocument();
		expect(
			screen.queryByText('xml tagging description')
		).not.toBeInTheDocument();
		expect(screen.queryByText('xml tag prompt')).not.toBeInTheDocument();
	});

	test('when xml defence is selected, only that defence info is shown and config items are rendered', async () => {
		const { user } = renderComponent();
		const radioButton = screen.getByRole('radio', { name: 'xml tagging' });
		await user.click(radioButton);

		expect(screen.queryByText('xml tagging description')).toBeInTheDocument();
		expect(screen.queryByLabelText(/xml tag prompt:/i)).toBeInTheDocument();
		expect(screen.getAllByRole('textbox')).toHaveLength(1);
		expect(screen.getByRole('textbox')).toHaveValue(
			'this is xml tagging value'
		);

		expect(screen.queryByText('rse description')).not.toBeInTheDocument();
		expect(screen.queryByLabelText(/rse prompt:/i)).not.toBeInTheDocument();
	});

	test('when rse defence is selected, only that defence info is shown and config items are rendered', async () => {
		const { user } = renderComponent();
		const radioButton = screen.getByRole('radio', {
			name: 'random sequence enclosure',
		});
		await user.click(radioButton);

		expect(screen.queryByText('rse description')).toBeInTheDocument();
		expect(screen.queryByLabelText(/rse prompt:/i)).toBeInTheDocument();

		expect(screen.getAllByRole('textbox')).toHaveLength(1);
		expect(screen.getByRole('textbox')).toHaveValue('this is rse value');

		expect(
			screen.queryByText('xml tagging description')
		).not.toBeInTheDocument();
		expect(screen.queryByLabelText(/xml tag prompt:/i)).not.toBeInTheDocument();
	});

	test('when Off radio is selected, active defences are toggled off', async () => {
		const newMockDefences = [...mockDefences];
		newMockDefences[0].isActive = true;

		const { user } = renderComponent(newMockDefences);
		const radioButton = screen.getByRole('radio', { name: 'Off' });
		await user.click(radioButton);

		expect(mockToggleDefence).toHaveBeenCalledWith(newMockDefences[0]);
		// the active defence is not toggled off
		expect(mockToggleDefence).not.toHaveBeenCalledWith(newMockDefences[1]);
	});

	test('when xml tagging radio button is selected, it is toggled on and others are toggled off', async () => {
		const newMockDefences = [...mockDefences];
		newMockDefences[0].isActive = false;
		newMockDefences[1].isActive = true;

		const { user } = renderComponent(newMockDefences);
		const radioButton = screen.getByRole('radio', {
			name: 'xml tagging',
		});
		await user.click(radioButton);

		expect(mockToggleDefence).toHaveBeenCalledWith(newMockDefences[1]);
		expect(mockToggleDefence).toHaveBeenCalledWith(newMockDefences[0]);
	});

	test('when rse radio button is selected, it is toggled on and others are toggled off', async () => {
		const newMockDefences = [...mockDefences];
		newMockDefences[0].isActive = true;

		const { user } = renderComponent(newMockDefences);

		const radioButton = screen.getByRole('radio', {
			name: 'random sequence enclosure',
		});
		await user.click(radioButton);

		expect(mockToggleDefence).toHaveBeenCalledWith(newMockDefences[1]);
		expect(mockToggleDefence).toHaveBeenCalledWith(newMockDefences[0]);
	});
});
