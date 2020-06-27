const Joi = require('joi');

const middleware = (req, res, next) => {
    const schema = Joi.object().keys({
        email: Joi.string().email({minDomainSegments: 2}).required(),
        password: Joi.string().regex(/^[a-zA-Z0-9]{4,30}$/).required()
    });
    Joi.validate(req.body, schema,(err, value) => {
        if(err) {
            res.status(422).json({err});
        } else {
            next();
        }
    });
};

module.exports = middleware;
