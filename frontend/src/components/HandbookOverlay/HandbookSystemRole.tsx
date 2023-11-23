import { LEVEL_NAMES } from '@src/models/level';

function HandbookSystemRole({
	level,
	systemRole,
}: {
	level: LEVEL_NAMES;
	systemRole: string;
}) {
	return (
		<div className="system-role-layout">
			<h1> System Role for Level {level.valueOf()}</h1>
			<p> {systemRole} </p>
		</div>
	);
}

export default HandbookSystemRole;
