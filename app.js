require("dotenv").config();
const express = require("express");
const app = express();

// Setup your Middleware and API Router here

app.patch("/api/routine_activities/:routineActivityId", (req, res) => {
  // const routineActivity = req.isPaused;
  //  const bodyData = req.body;

  res.status(200).json(req.body);
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "health ok!" });
});

app.get("/api/unknown", (req, res) => {
  res.status(404).json({ message: "not found!" });
});

module.exports = app;
