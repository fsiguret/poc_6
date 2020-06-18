const User = require('../models/Users');
const bcrypt = require('bcrypt');
const jwToken = require('jsonwebtoken');

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(200).json({ message: "Utilisateur créé !"}));
        })
};

exports.login = (req, res, next) => {
    User.findOne({email: req.body.email})
        .then(user => {
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if(valid) {
                        res.status(200).json({
                            userId: user._id,
                            token: jwToken.sign(
                                { userId: user._id },
                                'PROD_KEY', //change this for production.
                                { expiresIn: '24h' }
                            )
                        });
                    }
                })
        })
};
