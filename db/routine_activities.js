const client = require("./client");

async function getRoutineActivityById(id) {
  try {
    const result = await client.query(
      `
    SELECT * FROM routine_activities WHERE id = $1; `,
      [id]
    );
    // console.log(result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.log("Error with getRoutineActivityById");
    throw error;
  }
}

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const result = await client.query(
      `
  INSERT INTO routine_activities ("routineId", "activityId", duration, count)
  VALUES($1, $2, $3, $4)
  RETURNING *; `,
      [routineId, activityId, duration, count]
    );
    // console.log(result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.log("error with addactivitytoroutine");
    throw error;
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const result = await client.query(
      `
    SELECT * FROM routine_activities
    WHERE "routineId" = $1;`,
      [id]
    );
    // console.log(routineByRoutine.rows);
    // console.log(result.rows);
    return result.rows;
  } catch (error) {
    console.log("error with getRoutineActivitiesByRoutine");
    throw error;
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  // console.log(setString);
  if (setString.length > 0) {
    const update = await client.query(
      `
      UPDATE routine_activities
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

async function destroyRoutineActivity(id) {
  try {
    const result = await client.query(
      `
    DELETE FROM routine_activities
    WHERE id=$1
    RETURNING *;`,
      [id]
    );
    // console.log(result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.log("error with destroyRoutineActivity");
    throw error;
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    const result = await client.query(
      `
  SELECT "routineId" FROM routine_activities
  WHERE "activityId" = $1;`,
      [routineActivityId]
    );
    // console.log(result.rows[0].routineId);
    // this will give u straight number of routine id from ^^ code

    const check = await client.query(
      `
  SELECT "creatorId" FROM routines
  WHERE id = $1;`,
      [result.rows[0].routineId]
    );
    // console.log(check.rows[0].creatorId);

    if (check.rows[0].creatorId === userId) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("error with canEditRoutineActivity");
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};