const Sauce = require('../models/Sauces');
const fs = require('fs');

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(() => res.status(404).send("Aucunes sauces trouvées."));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(() => res.status(404).send("Sauce non trouvée."));
};

exports.addSauce = (req, res, next) => {
    if(req.body.sauce !== undefined) {

        const sauceObject = JSON.parse(req.body.sauce);

        const sauce = new Sauce ({
            ...sauceObject,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            likes: 0,
            dislikes: 0,
            usersLiked: [],
            usersDisliked: []
        });

        sauce.save()
            .then(() => res.status(201).json({message: 'Sauce créée'}))
            .catch(() => res.status(500).send("La sauce n'a pas pu être enregistrée."));
    } else {
        if(req.file){
            fs.unlink(`images/${req.file.filename}`, () => {});
        }
        res.status(400).send("La syntaxe de la requête est erronée. multiform-data attendu: image(file) et sauce(text)");
    }
};

exports.changeSauce = (req, res, next) => {
    let isJson = ((!(req.file === null || req.file === undefined)));
    let errorConnexion = true;

    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if(!isJson && req.body.userId === sauce.userId) {

                errorConnexion = false;

                Sauce.updateOne({ _id : req.params.id }, {...req.body})
                    .then(() => res.status(201).json({message: "Sauce modifiée sans changement d'image"}))
                    .catch(() => res.status(500).send("La sauce n'a pas pu être modifiée"));

            } else if(isJson){
                let bodySauce = JSON.parse(req.body.sauce);

                if(bodySauce.userId === sauce.userId) {

                    const fileName = sauce.imageUrl.split('/images/')[1];

                    errorConnexion = false;

                    fs.unlink(`images/${fileName}`, () => {
                        Sauce.updateOne({ _id : req.params.id },
                            {   ...bodySauce,
                                imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                            })
                            .then(() => {
                                res.status(201).json({message: "Sauce modifiée avec changement d'image"});
                            })
                            .catch(() => {
                                fs.unlink(`images/${req.file.filename}`, () => {});
                                res.status(500).send("La sauce n'a pas pu être modifiée");
                            });
                    });
                }
            }
            if(errorConnexion) {
                if(isJson) {
                    fs.unlink(`images/${req.file.filename}`, () => {});
                }
                res.status(403).send("Vous devez vous connectez sur le bon compte pour pouvoir modifier cette sauce.");
            }
        })
        .catch(() => {
            res.status(404).send("Sauce non trouvée.");
        });
};

exports.likeOrDislikeSauce = (req, res, next) => {

    const sauceId = req.params.id;
    const userId = req.body.userId;
    const like = parseInt(req.body.like, 10);

    Sauce.findOne({ _id: sauceId})
        .then(sauce => {
            if(like >= 1) {
                if(!sauce.usersLiked.includes(userId) && !sauce.usersDisliked.includes(userId)) {
                    Sauce.updateOne({ _id: sauceId }, {
                        $push: {usersLiked: userId},
                        $inc: {likes: 1}
                    })
                        .then(() => res.status(201).json({ message: "Vous avez aimé la sauce !" }))
                        .catch(() => res.status(500).send("Il c'est produit une erreur lors du Like de la sauce"));
                }else {
                    res.status(400).send("Vous avez déjà un avis pour cette sauce.");
                }
            } else if (like <= -1 ) {
                if(!sauce.usersLiked.includes(userId) && !sauce.usersDisliked.includes(userId)) {
                    Sauce.updateOne({ _id: sauceId }, {
                        $push: {usersDisliked: userId},
                        $inc: {dislikes: 1}
                    })
                        .then(() => res.status(201).json({ message: "Vous n'aimez pas la sauce !" }))
                        .catch(() => res.status(500).send("Il c'est produit une erreur lors du dislike de la sauce"));
                }else {
                    res.status(400).send("Vous avez déjà un avis pour cette sauce.");
                }
            } else if (Object.is(like, 0)) {
                if(sauce.usersLiked.includes(userId)) {
                    Sauce.updateOne({ _id: sauceId }, {
                        $pull: {usersLiked: userId},
                        $inc: {likes: -1}
                    })
                        .then(() => res.status(201).json({ message: "Vous n'avez plus d'avis !" }))
                        .catch(() => res.status(500).send("Il c'est produit une erreur lors du changement d'avis."));

                } else if(sauce.usersDisliked.includes(userId)) {
                    Sauce.updateOne({ _id: sauceId }, {
                        $pull: {usersDisliked: userId},
                        $inc: {dislikes: -1}
                    })
                        .then(() => res.status(201).json({ message: "Vous n'avez plus d'avis !" }))
                        .catch(() => res.status(500).send("Il c'est produit une erreur lors du changement d'avis."));
                } else {
                    res.status(400).send("Vous n'avez déjà pas d'avis.");
                }
            }
        })
        .catch(() => res.status(404).send("Cette sauce n'éxiste pas."));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (req.body.userId === sauce.userId) {

                const fileName = sauce.imageUrl.split('/images/')[1];

                fs.unlink(`images/${fileName}`, () => {
                    Sauce.deleteOne({ _id: sauce.id })
                        .then(() => res.status(200).json({ message:'Sauce supprimée' }))
                        .catch(() => res.status(500).send("La sauce n'a pas pu être supprimée."));
                });
            } else {
                res.status(403).send("Vous devez vous connectez sur le bon compte pour pouvoir supprimer cette sauce.");
            }
        })
        .catch(() => res.status(404).send("La sauce n'existe pas."));
};
