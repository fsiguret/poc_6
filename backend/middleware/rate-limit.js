const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
    windowMs: 15 * 60 * 1000, //15 minutes
    max: 10,
    message: "too many attempts, try again later"
});
