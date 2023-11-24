import "./HandbookPage.css";

import { LEVEL_NAMES, LevelSystemRole } from "@src/models/level";

function HandbookSystemRole({
  numCompletedLevels,
  systemRoles,
}: {
  numCompletedLevels: LEVEL_NAMES;
  systemRoles: LevelSystemRole[];
}) {
  return (
    <article className="handbook-page">
      <header>
        <h1> System Roles </h1>
        <p>
          Here you can review the parameters the bot is working under for each
          level. You can only review this for levels you have already completed.
        </p>
      </header>

      <div className="handbook-terms">
        {systemRoles.map(({ level, systemRole }) => (
          <div className="term" key={level}>
            <dt>{`Level ${level + 1} System Role`}</dt>
            {level >= numCompletedLevels ? (
              <div className="role-locked">
                <p>
                  {`You must complete level ${
                    level + 1
                  } to unlock the system role
                  description`}
                </p>
              </div>
            ) : (
              <dd> {systemRole} </dd>
            )}
          </div>
        ))}
      </div>
    </article>
  );
}

export default HandbookSystemRole;
