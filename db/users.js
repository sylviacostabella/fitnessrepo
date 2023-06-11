const client = require("./client");
const bcrypt = require('bcrypt');

// database functions

// user functions
async function createUser({ username, password }) {
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await client.query(
      `
    INSERT INTO users(username, password)
    VALUES ($1, $2)
    ON CONFLICT (username) DO NOTHING
    RETURNING *;
    `,
      [username, hashedPassword]
    );

    return { id: result.rows[0].id, username: result.rows[0].username };
  } catch (error) {
    console.log("Error occured while creating user");
    throw error;
  }
}

async function getUser({ username, password }) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `SELECT * FROM users where username=$1;`,
      [username]
    );

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return null;
    }

    delete user.password;

    return user;
  } catch (error) {
    console.log("Error with getUser");
    throw error;
  }
}

async function getUserById(userId) {
  try {
    const {
      rows: [user],
    } = await client.query(
      ` SELECT * FROM users WHERE users.id=$1;
    `,
      [userId]
    );
    if (!user) {
      return null;
    }
    delete user.password;
    return user;
  } catch (error) {
    console.log("Error with getUserById");
    throw error;
  }
}

async function getUserByUsername(userName) {
  try {
    const {
      rows: [user],
    } = await client.query(
      ` SELECT * FROM users WHERE username=$1;
    `,
      [userName]
    );
    if (!user) {
      return null;
    }
    return user;
  } catch (error) {
    console.log("Error with getUserByUsername");
    throw error;
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
};