const Sauce = require('../models/Sauces');
const fs = require('fs');

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => console.log(error));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => console.log(error));
};

exports.addSauce = (req, res, next) => {
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
};

exports.changeSauce = (req, res, next) => {
    try {
        const sauceObject = JSON.parse(req.body.sauce);

        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                const fileName = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${fileName}`, () => {
                    Sauce.updateOne({ _id : req.params.id },
                        {   ...sauceObject,
                            _id: req.params.id,
                            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                        })
                        .then(() => {
                            res.status(200).json({message: "Sauce modifiée avec changement d'image"});
                        });
                })
            })
    } catch (e) {
        Sauce.updateOne({ _id: req.params.id }, {...req.body, _id: req.params.id})
            .then(() => res.status(200).json({message: "Sauce modifiée sans changement d'image"}));
    }
};

exports.likeOrDislikeSauce = (req, res, next) => {
    console.log(req.body)
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if(req.body.like === 1) {
                Sauce.updateOne({ _id: req.params.id }, {
                    _id: req.params.id,
                    likes: sauce.usersLiked.length + 1 ,
                    $push : {usersLiked: req.body.userId}
                })
                    .then(() => res.status(200).json({message: 'Vous avez aimé !'}));
            }
            if (req.body.like === -1) {
                Sauce.updateOne({ _id: req.params.id }, {
                    _id: req.params.id,
                    dislikes: sauce.usersDisliked.length + 1,
                    $push : {usersDisliked: req.body.userId}
                })
                    .then(() => res.status(200).json({message: "Vous n'aimez pas !"}));
            }
            if(req.body.like === 0) {
                Sauce.updateOne({ _id: req.params.id }, {
                    _id: req.params.id,
                    dislikes: sauce.usersDisliked.length + 1,
                    likes: sauce.usersLiked.length + 1,
                    $pull : {usersDisliked: req.body.userId, usersLiked: req.body.userId}
                })
                    .then(() => res.status(200).json({message: "Vous n'avez plus d'avis !"}));
            }
        })
}

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const fileName = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${fileName}`, () => {
                Sauce.deleteOne({ _id: sauce.id })
                    .then(() => res.status(200).json({message: 'Sauce supprimée'}));
            })
        })
};
