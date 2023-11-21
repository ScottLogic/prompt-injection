import { LEVEL_NAMES, LevelSystemRole } from "@src/models/level";

import "./HandbookSystemRole.css";

function HandbookSystemRole({
  level,
  systemRoles,
}: {
  level: LEVEL_NAMES;
  systemRoles: LevelSystemRole[];
}) {
  return (
    <div className="system-role-layout">
      <h1> System Roles </h1>
      <p>
        {" "}
        Here you can review the parameters the bot is working under for each
        level. You can only review this for levels you have already completed.{" "}
      </p>

      <div className="system-role-list">
        {systemRoles.map((systemRole) => (
          <div className="system-role" key={systemRole.level}>
            <h1> Level {systemRole.level + 1} System Role </h1>
            {systemRole.level > level ? (
              <div className="handbook-system-role-locked">
                <p>
                  You must complete level {systemRole.level + 1} to unlock the
                  system role description
                </p>
              </div>
            ) : (
              <p> {systemRole.systemRole} </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default HandbookSystemRole;
