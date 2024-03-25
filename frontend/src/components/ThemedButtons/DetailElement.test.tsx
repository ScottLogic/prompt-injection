import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { describe, expect, test } from 'vitest';

import DetailElement from './DetailElement';

function renderComponent(content: ReactNode, buttonText?: string) {
	const user = userEvent.setup();
	render(
		<DetailElement useIcon={true} buttonText={buttonText}>
			{content}
		</DetailElement>
	);

	return { user };
}

function detailButton(name = 'Details') {
	return screen.getByRole('button', { name });
}

describe('DetailElement component tests', () => {
	test('Renders collapsed initially with Details button by default', () => {
		const textContent = 'Well hello there';
		renderComponent(<>{textContent}</>);

		const button = detailButton();
		expect(button).toBeInTheDocument();
		expect(button).toHaveAttribute('aria-expanded', 'false');
		expect(screen.getByText(textContent)).not.toBeVisible();
	});

	test('Expands on clicking Details button', async () => {
		const textContent = 'Well hello there';
		const { user } = renderComponent(<>{textContent}</>);

		const button = detailButton();
		await user.click(button);

		expect(button).toHaveAttribute('aria-expanded', 'true');
		expect(screen.getByText(textContent)).toBeVisible();
	});

	test('Button can have a custom name', () => {
		const buttonText =
			'This is my button, there are many others like it but this one is mine';
		renderComponent(<>without my button i am nothing</>, buttonText);

		expect(detailButton(buttonText)).toBeInTheDocument();
	});
});
