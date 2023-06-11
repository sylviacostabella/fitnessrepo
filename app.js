require("dotenv").config();
const express = require("express");
const { router } = require("./api");
const app = express();

// Setup your Middleware and API Router here

app.use(express.json());

app.use("/api", router);

module.exports = app;
