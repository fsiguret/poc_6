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

    const isLike = parseInt(req.body.like, 10);
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if(isLike === 1) {
                Sauce.updateOne({ _id: req.params.id }, {
                    _id: req.params.id,
                    $push : {usersLiked: req.body.userId},
                    likes: sauce.usersLiked.length + 1
                })
                    .then(() => res.status(200).json({message: 'Vous avez aimé !'}));
            }
            if (isLike === -1) {
                Sauce.updateOne({ _id: req.params.id }, {
                    _id: req.params.id,
                    $push : {usersDisliked: req.body.userId},
                    dislikes: sauce.usersDisliked.length + 1
                })
                    .then(() => res.status(200).json({message: "Vous n'aimez pas !"}));
            }

            if(isLike === 0) {
                if(sauce.usersLiked.includes(req.body.userId)) {
                    Sauce.updateOne({ _id: req.params.id }, {
                        _id: req.params.id,
                        $pull : {usersLiked: req.body.userId},
                        likes: sauce.usersLiked.length - 1
                    })
                        .then(() => res.status(200).json({message: "Vous n'avez plus d'avis !"}));
                }
                if(sauce.usersDisliked.includes(req.body.userId)) {
                    Sauce.updateOne({ _id: req.params.id }, {
                        _id: req.params.id,
                        $pull : {usersDisliked: req.body.userId},
                        dislikes: sauce.usersDisliked.length - 1
                    })
                        .then(() => res.status(200).json({message: "Vous n'avez plus d'avis !"}));
                }
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
