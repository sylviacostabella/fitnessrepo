const express = require("express");
const activityRouter = express.Router();
const {
  getAllActivities,
  createActivity,
  updateActivity,
  getActivityByName,
  getActivityById,
  getPublicRoutinesByActivity,
} = require("../db");
const { requireUser } = require("./utils");

// GET /api/activities/:activityId/routines
activityRouter.get("/:activityId/routines", async (req, res) => {
  try {
    const activity = await getActivityById(req.params.activityId);
    if (activity) {
      const routines = await getPublicRoutinesByActivity(activity);
      res.send(routines);
    } else {
      res.status(404).send({
        name: "ActivityNotFoundError",
        error: "ActivityNotFoundError",
        message: `Activity ${req.params.activityId} not found`,
      });
    }
  } catch (error) {
    console.log("Error with getting activities");
    res.status(500).send({
      name: "InternalServerError",
      error: "InternalServerError",
      message: error.message,
    });
  }
});

// GET /api/activities
activityRouter.get("/", async (req, res) => {
  try {
    const allActivities = await getAllActivities();
    res.send(allActivities);
  } catch (error) {
    console.log("Error with getting activities");
    throw error;
  }
});

// POST /api/activities
activityRouter.post("/", requireUser, async (req, res, next) => {
  const { name, description } = req.body;
  console.log(req.user);

  const activityData = {
    authorId: req.user.id,
    name: name,
    description: description,
  };

  let error = {
    error: "error",
    message: `An activity with name ${name} already exists`,
    name: "error name",
  };

  try {
    const check = await getActivityByName(name);
    if (check) {
      res.send(error);
    } else {
      // add authorId, title, content to postData object
      const activity = await createActivity(activityData);
      // this will create the post and the tags for us
      // if the post comes back, res.send({ post });
      res.send(activity);
      // otherwise, next an appropriate error object
    }
  } catch ({ name, description }) {
    next({ name, description });
  }
});

// PATCH /api/activities/:activityId
activityRouter.patch("/:activityId", requireUser, async (req, res) => {
  const id = req.params.activityId;
  const fields = req.body;
  let error = {
    error: "error",
    message: `An activity with name ${fields.name} already exists`,
    name: "error name",
  };
  const check = await getActivityByName(fields.name);
  if (check) {
    res.send(error);
  } else {
    const activityToUpdate = await updateActivity({ id, ...fields });
    if (!activityToUpdate) {
      res.status(500);
      res.send({
        error: "an error has occurred",
        message: `Activity ${id} not found`,
        name: "noExistingActivityId",
      });
      return;
    }
    res.send(activityToUpdate);
  }
});

module.exports = activityRouter;
