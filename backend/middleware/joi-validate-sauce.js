const Joi = require('joi');
const fs = require('fs');

const middleware = (req, res, next) => {
    const schema = Joi.object().keys({
        userId: Joi.string().regex(/^[a-zA-Z0-9]+$/).required(),
        name: Joi.string().regex(/^[a-zéèàùüïäëöâêîôû]{3,30}(\s?[a-zéèàùüïäëöâêîôû]{3,30})*$/i).required(),
        manufacturer: Joi.string().regex(/^[a-zéèàùüïäëöâêîôû]{3,30}(\s?[a-zéèàùüïäëöâêîôû]{3,30})*$/i).required(),
        description: Joi.string().regex(/^[a-zA-Z0-9?!;:.' ]{1,255}$/).required(),
        mainPepper: Joi.string().alphanum().min(3).max(30).required(),
        heat: Joi.number().min(1).max(10).required(),
    });

    if((req?.file) === undefined) {
        Joi.validate(req.body, schema,(err, value) => {
            if(err) {
                res.status(422).send(`${err}`);
            } else {
                next();
            }
        });
    }else {
        Joi.validate(req.body.sauce, schema,(err, value) => {
            if(err) {
                fs.unlink(`images/${req.file.filename}`, () => {});
                res.status(422).send(`${err}`);
            } else {
                next();
            }
        });
    }
};

module.exports = middleware;
