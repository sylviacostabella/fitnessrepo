const express = require("express");
const {
  getUserByUsername,
  createUser,
  getUserById,
  getAllRoutinesByUser,
} = require("../db");
const usersRouter = express.Router();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

const { requireUser } = require("./utils");

// POST /api/users/login

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  // request must have both
  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }

  try {
    const user = await getUserByUsername(username);

    if (user && user.password === password) {
      // create token & return to user

      const token = jwt.sign(user, JWT_SECRET);
      res.send({
        user: {
          id: user.id,
          username: `${username}`,
        },
        token: token,
        message: "you're logged in!",
      });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) {
    next(error);
  }
});
// POST /api/users/register
usersRouter.post("/register", async (req, res, next) => {
  const { username, password } = req.body;
  try {

    const checkUsers = await getUserByUsername(username);
    if (checkUsers) {
      res.status(500).send({
        error: "error has occured",
        message: `User ${username} is already taken.`,
        name: "username already exists",
      });
    } else {
      const user = await createUser({ username, password });
      const token = jwt.sign(
        {
          id: user.id,
          username,
        },
        process.env.JWT_SECRET || "neverTell",
        {
          expiresIn: "1w",
        }
      );
      if (user) {
        res.send({ message: "user is created", token: token, user: user });
      }
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.get("/me", requireUser, async (req, res) => {
  if (req.user) {
    const result = await getUserById(req.user.id);
    res.send(result);
  } else {
    res.status(401).send({
      name: 'UnauthorizedError',
      error: 'UnauthorizedError',
      message: 'You must be logged in to perform this action'
    })
  }
});

usersRouter.get("/:username/routines", async (req, res) => {
  const { username } = req.params;
  console.log(username);

  const userRoutines = await getAllRoutinesByUser({ username });
  console.log(userRoutines);
  res.send(userRoutines);
});
module.exports = usersRouter;