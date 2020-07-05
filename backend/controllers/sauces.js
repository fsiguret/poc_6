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
    if(req.body?.sauce !== undefined) {

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
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            if(req.file?.filename === undefined) {

                Sauce.updateOne({ _id : req.params.id }, {...req.body, _id: req.params.id})
                    .then(() => res.status(201).json({message: "Sauce modifiée sans changement d'image"}))
                    .catch(() => res.status(500).send("La sauce n'a pas pu être modifiée"));

            } else {
                const fileName = sauce.imageUrl.split('/images/')[1];

                fs.unlink(`images/${fileName}`, () => {

                    Sauce.updateOne({ _id : req.params.id },
                        {   ...JSON.parse(req.body.sauce),
                            _id: req.params.id,
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
        })
        .catch(() => res.status(404).send("Sauce non trouvée."));
}

exports.likeOrDislikeSauce = (req, res, next) => {

    const isLike = parseInt(req.body.like, 10);
    const userId = req.body.userId;

    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if(req.body.userId && req.body.like){
                switch(isLike) {
                    case 1 :
                        if(!sauce.usersLiked.includes(userId)){
                            Sauce.updateOne({ _id: req.params.id }, {
                                _id: req.params.id,
                                $push : {usersLiked: userId},
                                likes: sauce.usersLiked.length + 1
                            })
                                .then(() => res.status(201).json({message:'Vous avez aimé !'}))
                                .catch(() => res.status(500).send("Une erreur c'est produite lors du like"));
                        }else {
                            res.status(403).send("vous aimez déjà cette sauce.");
                        }
                        break;
                    case -1 :
                        if(!sauce.usersDisliked.includes(userId)) {
                            Sauce.updateOne({ _id: req.params.id }, {
                                _id: req.params.id,
                                $push : {usersDisliked: userId},
                                dislikes: sauce.usersDisliked.length + 1
                            })
                                .then(() => res.status(201).json({message:"Vous n'aimez pas !"}))
                                .catch(() => res.status(500).send("Une erreur c'est produite lors du dislike"));
                        }else {
                            res.status(403).send("vous détestez déjà cette sauce.");
                        }
                        break;
                    case 0 :
                        if(sauce.usersLiked.includes(userId)) {
                            Sauce.updateOne({ _id: req.params.id }, {
                                _id: req.params.id,
                                $pull : {usersLiked: userId},
                                likes: sauce.usersLiked.length - 1
                            })
                                .then(() => res.status(201).json({message:"Vous n'avez plus d'avis !"}))
                                .catch(() => res.status(500).send("Une erreur c'est produite lors du changement d'avis"));
                        }else if(sauce.usersDisliked.includes(userId)) {
                            Sauce.updateOne({ _id: req.params.id }, {
                                _id: req.params.id,
                                $pull : {usersDisliked: userId},
                                dislikes: sauce.usersDisliked.length - 1
                            })
                                .then(() => res.status(201).json({message:"Vous n'avez plus d'avis !"}))
                                .catch(() => res.status(500).send("Une erreur c'est produite lors du changement d'avis"));
                        }
                        break;
                    default :
                        new Error("You cannot like or dislike");
                }
            } else {
                res.status(404).send("userId ou/et like inexistant");
            }
        })
        .catch(() => res.status(404).send("La sauce n'existe pas."));
}

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const fileName = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${fileName}`, () => {
                Sauce.deleteOne({ _id: sauce.id })
                    .then(() => res.status(200).json({message:'Sauce supprimée'}))
                    .catch(() => res.status(500).send("La sauce n'a pas pu être supprimée."));
            })
        })
        .catch(() => res.status(404).send("La sauce n'existe pas."));
};
