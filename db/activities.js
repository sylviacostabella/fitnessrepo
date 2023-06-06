const client = require("./client");

// database functions
async function getAllActivities() {
  const { rows } = await client.query(`
  SELECT * FROM activities; 
 `);
  return rows;
}

async function getActivityById(id) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
      SELECT *
      FROM activities
      WHERE id=$1;
    `,
      [id]
    );
    return activity;
  } catch (error) {
    console.log("Error occured while creating activities");
    throw error;
  }
}

async function getActivityByName(name) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
      SELECT *
      FROM activities
      WHERE name=$1;
    `,
      [name]
    );

    return activity;
  } catch (error) {
    console.log("Error occured while creating activities");
    throw error;
  }
}

// select and return an array of all activities
async function attachActivitiesToRoutines(routines) {
  const routineMap = routines.map(async (routine) => {
    const { rows } = await client.query(
      `
    SELECT activities.*, routine_activities.duration, routine_activities.count,
    routine_activities.id AS "routineActivityId", routine_activities."routineId" FROM routine_activities 
    JOIN activities
    ON activities.id = routine_activities."activityId"
    AND routine_activities."routineId" =$1;`,
      [routine.id]
    );
    routine.activities = rows;
    return routine;
  });
  const newRoutines = await Promise.all(routineMap);
  return newRoutines;
}

// return the new activity
async function createActivity({ name, description }) {
  try {
    const result = await client.query(
      `
    INSERT INTO activities(name, description) 
    VALUES($1, $2,) 
    ON CONFLICT (activity) DO NOTHING 
    RETURNING *;
  `,
      [name, description]
    );

    return result.rows[0];
  } catch (error) {
    console.log("Error occured while creating activities");
    throw error;
  }
}

// don't try to update the id
// do update the name and description
// return the updated activity
async function updateActivity({ id, ...fields }) {
  // read off the tags & remove that field
  console.log(fields);
  try {
    for (let key in fields) {
      await client.query(`
      UPDATE activities SET ${key} = '${fields[key]}' WHERE id = ${id};
      `);
    }

    const {
      rows: [response],
    } = await client.query(` SELECT * FROM activities WHERE id = ${id};`);
    return response;
  } catch (error) {
    console.log("Error with updateActivity function");
    throw error;
  }
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};