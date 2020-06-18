const jwtoken = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];//get token without BAERER string.
    const decodedToken = jwtoken.verify(token, 'PROD_KEY');
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
        throw 'Invalid user ID';
    } else {
        next();
    }
};
