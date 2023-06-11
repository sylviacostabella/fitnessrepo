const express = require("express");
const routinesRouter = express.Router();
const {
  getAllPublicRoutines,
  createRoutine,
  updateRoutine,
  getRoutineById,
  destroyRoutine,
} = require("../db/routines");
const {
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
} = require("../db/routine_activities");
const { requireUser } = require("./utils");

// GET /api/routines
routinesRouter.get("/", async (req, res) => {
  try {
    const allRoutines = await getAllPublicRoutines();
    res.send(allRoutines);
  } catch (error) {
    console.log("Error with getting all public routines");
    throw error;
  }
});

// POST /api/routines
routinesRouter.post("/", requireUser, async (req, res) => {
  const fields = req.body;

  if (req.user) {
    const create = await createRoutine({ creatorId: req.user.id, ...fields });
    res.send(create);
  } else {
    res.send({
      name: 'UnauthorizedError',
      error: 'UnauthorizedError',
      message: 'You must be logged in to perform this action'
    })
  }
});

// PATCH /api/routines/:routineId
routinesRouter.patch("/:routineId", requireUser, async (req, res) => {
  const { routineId } = req.params;
  const fields = req.body;

  if (req.user) {
    const check = await getRoutineById(routineId);
    if (check.creatorId !== req.user.id) {
      res.status(403);
      res.send({
        error: "Error",
        message: `User ${req.user.username} is not allowed to update ${check.name}`,
        name: "Name error",
      });
    } else {
      const update = await updateRoutine({ id: routineId, ...fields });
      res.send(update);
    }
  }
  else {
    res.send({
      name: 'UnauthorizedError',
      error: 'UnauthorizedError',
      message: 'You must be logged in to perform this action'
    })
  }
});

// DELETE /api/routines/:routineId
routinesRouter.delete("/:routineId", requireUser, async (req, res) => {
  const { routineId } = req.params;
  const check = await getRoutineById(routineId);

  let error = {
    error: "Error",
    message: `User ${req.user.username} is not allowed to delete ${check.name}`,
    name: "name errror",
  };
  if (check.creatorId !== req.user.id) {
    res.status(403);
    res.send(error);
  } else {
    const deleteRoutine = await destroyRoutine(routineId);
    //   console.log(deleteRoutine);
    res.send(deleteRoutine);
  }
});

// POST /api/routines/:routineId/activities
routinesRouter.post("/:routineId/activities", requireUser, async (req, res) => {
  const { routineId } = req.params;
  const { activityId, count, duration } = req.body;
  //   const routine = await getRoutineById(routineId);
  //   console.log(routine);
  let error = {
    error: "error",
    message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`,
    name: "error",
  };

  const activities = await getRoutineActivitiesByRoutine({ id: routineId });
  console.log(activities);
  console.log(activities.includes(activityId));

  var duplicate = false;
  for (var key in activities) {
    var obj = activities[key];
    if (obj.id === activityId) {
      duplicate = true;
      break;
    }
  }
  if (duplicate) {
    res.send(error);
  } else {
    const addActivity = await addActivityToRoutine({
      routineId: routineId,
      activityId: activityId,
      count: count,
      duration: duration,
    });
    res.send(addActivity);
  }
});

module.exports = routinesRouter;