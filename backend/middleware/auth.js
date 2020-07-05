const jwtoken = require('jsonwebtoken');
const privateKey = 'DEV_KEY'; //change this for production.

module.exports = (req, res, next) => {

    const token = req.headers.authorization?.split(' ')[1];//get token without BAERER string.

    if(token === undefined) {

        res.status(401).send("Vous devez vous connecter.");

    }else {

        jwtoken.verify(token, privateKey, function (err, decoded) {
            if(err) {
                res.status(401).send("La session a expirée, veuillez vous reconnecter.");

            }else {
                const decodedToken = jwtoken.verify(token, privateKey)
                const userId = decodedToken.userId;

                if (req.body.userId && req.body.userId !== userId) {
                    throw 'Invalid user ID';
                } else {
                    next();
                }
            }
        })
    }
};
