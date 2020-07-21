const User = require('../models/Users');
const bcrypt = require('bcrypt');
const jwToken = require('jsonwebtoken');

const privateKey = 'DEV_KEY'; //change this for production.

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({message: "Utilisateur créé !"}))
                .catch(() => res.status(400).send("L'utilisateur n'a pas pu être enregistré ou existe déjà."));
        })
        .catch(() => res.status(400).send("Une erreur c'est produite lors du hash."));
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
                                privateKey,
                                { expiresIn: '1h'  }
                            ),
                            message: "Connection réussie !"
                        });
                    } else {
                        res.status(400).send("mot de passe érroné.");
                    }
                })
                .catch(() => res.status(400).send("Une erreur c'est produite lors de la comparaison des mots de passe."));
        })
        .catch(() => res.status(404).send("L'utilisateur n'éxiste pas." ));
};
