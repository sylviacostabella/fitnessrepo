const jwt = require("jsonwebtoken");

function requireUser(req, res, next) {

    const bearer = req.headers.authorization;
    if (!bearer) {
        next();
    }

    const [, token] = bearer.split(" ");
    if (!token) {
        next();
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || "neverTell");
        req.user = payload;
        next();
        return;
    } catch (e) {
        console.error(e);
        next();
        return;
    }
}

module.exports = {
    requireUser
};
