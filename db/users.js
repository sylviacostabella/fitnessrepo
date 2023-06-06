const client = require("./client");

// database functions

// user functions
async function createUser({ username, password }) {
  try {
    const result = await client.query(
      `
    INSERT INTO users(username, password)
    VALUES ($1, $2)
    ON CONFLICT (username) DO NOTHING
    RETURNING *;
    `,
      [username, password]
    );
    return result.rows[0];
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
      `SELECT * FROM users where username=$1, password=$2;`,
      [username, password]
    );
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
      ` SELECT * FROM users WHERE users.id=$1;
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