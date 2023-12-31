import ScottLogicLogo from '@src/assets/images/ScottLogicLogo';

import './MainFooter.css';

function MainFooter() {
	interface link {
		text: string;
		url: string;
	}

	const links: link[] = [
		{
			text: 'License',
			url: 'https://github.com/ScottLogic/prompt-injection/blob/main/LICENSE',
		},
		{
			text: 'GitHub',
			url: 'https://github.com/ScottLogic/prompt-injection',
		},
	];

	return (
		<footer className="main-footer">
			<a
				href="https://www.scottlogic.com/"
				aria-label="Scott Logic"
				rel="external"
			>
				<ScottLogicLogo />
			</a>
			<div className="links">
				{links.map((link) => (
					<a key={link.text} href={link.url} rel="external">
						{`[${link.text}]`}
					</a>
				))}
			</div>
		</footer>
	);
}

export default MainFooter;
