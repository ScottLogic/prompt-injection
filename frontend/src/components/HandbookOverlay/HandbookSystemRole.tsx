import { LEVEL_NAMES } from "../../models/level";

function HandbookSystemRole({
  level,
  systemRole,
}: {
  level: LEVEL_NAMES;
  systemRole: string;
}) {
  return (
    <div>
      <h1> System Role for Level {level.valueOf()}</h1>
      <p> {systemRole} </p>
    </div>
  );
}

export default HandbookSystemRole;
