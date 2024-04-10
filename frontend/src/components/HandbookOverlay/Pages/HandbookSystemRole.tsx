import { LevelSystemRole } from '@src/models/level';

import './HandbookPage.css';

function HandbookSystemRole({
	numCompletedLevels,
	systemRoles,
}: {
	numCompletedLevels: number;
	systemRoles: LevelSystemRole[];
}) {
	return (
		<article className="handbook-page">
			<div>
				<h2> System Roles </h2>
				<p>
					Here you can review the parameters the bot is working under for each
					level. You can only review this for levels you have already completed.
				</p>
			</div>

			<dl className="handbook-terms">
				{systemRoles.length !== 0 ? (
					systemRoles.map(({ level, systemRole }) => (
						<div className="term" key={level}>
							<dt>{`Level ${level + 1} System Role`}</dt>
							{level >= numCompletedLevels ? (
								<dd className="role-locked">
									{`You must complete level ${
										level + 1
									} to unlock the system role
                  description`}
								</dd>
							) : (
								<dd> {systemRole} </dd>
							)}
						</div>
					))
				) : (
					<div className="system-role-error-message">
						Unable to fetch system role information. Try again in a few minutes.
					</div>
				)}
			</dl>
		</article>
	);
}

export default HandbookSystemRole;
