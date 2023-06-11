const { attachActivitiesToRoutines } = require("./activities");
const client = require("./client");

async function getRoutineById(id) {
  try {
    const {
      rows: [routine],
    } = await client.query(
      ` SELECT * FROM routines WHERE id=$1;
    `,
      [id]
    );
    if (!routine) {
      return null;
    }
    return routine;
  } catch (error) {
    console.log("Error with getRoutineById");
    throw error;
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const { rows } = await client.query(`
    SELECT * FROM routines;`);

    return rows;
  } catch (error) {
    console.log("Error with getRoutinesWithoutActivities");
    throw error;
  }
}

async function getAllRoutines() {
  try {
    const { rows: routines } = await client.query(`
    
    SELECT routines.*, users.username AS "creatorName" FROM routines JOIN users ON routines. "creatorId"=users.id;`);

    for (let routine of routines) {
      const { rows: activities } = await client.query(
        `
      SELECT activities.*, routine_activities.duration, routine_activities.count, routine_activities. "routineId",
      routine_activities.id AS "routineActivityId"
      FROM activities
      JOIN routine_activities ON "activityId"=activities.id
      WHERE routine_activities."routineId"=$1;
      `,
        [routine.id]
      );
      routine.activities = activities;
    }
    return routines;
  } catch (error) {
    console.log("Error with getAllRoutines function");
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(
      `
      
      SELECT routines.*, users.username AS "creatorName" FROM routines JOIN users ON routines. "creatorId"=users.id WHERE users.username=$1;
      `,
      [username]
    );

    for (let routine of routines) {
      const { rows: activities } = await client.query(
        ` 
        SELECT activities.*, routine_activities.duration, routine_activities.count, routine_activities."routineId",
        routine_activities.id AS "routineActivityId"
        FROM activities
        JOIN routine_activities ON activities.id=routine_activities."activityId"
        WHERE routine_activities."routineId"=$1;
        `,
        [routine.id]
      );
      routine.activities = activities;
    }
    return routines;
  } catch (error) {
    console.log("Error with getAllRoutinesByUser function");
    throw error;
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    const result = await client.query(
      `
      SELECT routines.*, users.username AS "creatorName" FROM routines
      JOIN users 
      ON routines."creatorId" = users.id
      WHERE users.username = $1 AND
      "isPublic" = true;
    `,
      [username]
    );

    const attachRoutines = await attachActivitiesToRoutines(result.rows);
    // console.log(attachRoutines);
    return attachRoutines;
  } catch (error) {
    console.log("Error with getAllRoutinesByUser function");
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
    const result = await client.query(`
    SELECT routines.*, users.username AS "creatorName" FROM routines
    JOIN users 
    ON routines."creatorId" = users.id
    WHERE "isPublic" = true;
    `);
    // return result.rows;
    const attachRoutines = await attachActivitiesToRoutines(result.rows);
    return attachRoutines;
  } catch (error) {
    console.log("Error with getAllPublicRoutines function");
    throw error;
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    let routines = await getAllPublicRoutines();
    // console.log(routines);

    let resultFilter = routines.filter((routine) => {
      const routineMap = routine.activities.map((activity) => activity.id);

      return routineMap.includes(id);
    });
    return resultFilter;
  } catch (error) {
    console.log("Error with getPublicRoutinesByActivity function");
    throw error;
  }
}

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const result = await client.query(
      `
    INSERT INTO routines ("creatorId", "isPublic", name, goal) 
    VALUES($1, $2, $3, $4)
    RETURNING *;
    `,
      [creatorId, isPublic, name, goal]
    );
    return result.rows[0];
  } catch (error) {
    console.log("Error creating routine.",error);
  }
}

async function updateRoutine({ id, ...fields }) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  // console.log(setString);
  if (setString.length > 0) {
    const update = await client.query(
      `
        UPDATE routines
        SET ${setString}
        WHERE id=${id}
        RETURNING *;
      `,
      Object.values(fields)
    );
    // console.log(update.rows[0]);
    return update.rows[0];
  }
}

async function destroyRoutine(id) {
  try {
    const deleteRoutineAct = await client.query(
      `
    DELETE FROM routine_activities
    WHERE "routineId"=$1
    RETURNING *;
    `,
      [id]
    );
    deleteRoutineAct;
    const result = await client.query(
      `
    DELETE FROM routines
    WHERE id=$1
    RETURNING *;
    `,
      [id]
    );
    // console.log(result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.log("Error with destroyRoutine function");
    throw error;
  }
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};