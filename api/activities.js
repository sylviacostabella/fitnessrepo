const express = require("express");
const activityRouter = express.Router();
const {
  getAllActivities,
  createActivity,
  updateActivity,
  getActivityByName,
} = require("../db");
const { requireUser } = require("./utils");

// GET /api/activities/:activityId/routines

// GET /api/activities
activityRouter.get("/", async (req, res) => {
  try {
    const allActivities = await getAllActivities();
    const activities = allActivities.filter((activity) => {
      if (activity.active) {
        return true;
      }
      if (req.user === req.user.id) {
        return true;
      }
      return false;
    });

    res.send({
      activities,
    });
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

  try {
    // add authorId, title, content to postData object
    const activity = await createActivity(activityData);
    // this will create the post and the tags for us
    // if the post comes back, res.send({ post });
    res.send({ activity });
    // otherwise, next an appropriate error object
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
  if (check) {
    res.send(error);
  } else {
    res.send(activityToUpdate);
  }
});

module.exports = activityRouter;