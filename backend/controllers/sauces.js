const Sauce = require('../models/Sauces');
const fs = require('fs');

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(404).json({error}));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({error}));
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
        .catch(error => res.status(400).json({error}));
};

exports.changeSauce = (req, res, next) => {

    const validJson = (function (req) {
        try {
            return JSON.parse(req);
        } catch {
            return false;
        }
    })(req.body.sauce);

    if(!validJson) {
        Sauce.updateOne({ _id: req.params.id }, {...req.body, _id: req.params.id})
            .then(() => res.status(201).json({message: "Sauce modifiée sans changement d'image"}))
            .catch(error => res.status(404).json({ error }));
    }else {
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                const fileName = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${fileName}`, () => {
                    Sauce.updateOne({ _id : req.params.id },
                        {   ...validJson,
                            _id: req.params.id,
                            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                        })
                        .then(() => {
                            res.status(201).json({message: "Sauce modifiée avec changement d'image"});
                        })
                        .catch(error => res.status(404).json({ error }));
                })
            })
            .catch(error => res.status(404).json({ error }));
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
                    .then(() => res.status(200).json({message: 'Vous avez aimé !'}))
                    .catch(error => res.status(400).json({ error }));
            }
            if (isLike === -1) {
                Sauce.updateOne({ _id: req.params.id }, {
                    _id: req.params.id,
                    $push : {usersDisliked: req.body.userId},
                    dislikes: sauce.usersDisliked.length + 1
                })
                    .then(() => res.status(201).json({message: "Vous n'aimez pas !"}))
                    .catch(error => res.status(400).json({ error }));
            }

            if(isLike === 0) {
                if(sauce.usersLiked.includes(req.body.userId)) {
                    Sauce.updateOne({ _id: req.params.id }, {
                        _id: req.params.id,
                        $pull : {usersLiked: req.body.userId},
                        likes: sauce.usersLiked.length - 1
                    })
                        .then(() => res.status(201).json({message: "Vous n'avez plus d'avis !"}))
                        .catch(error => res.status(400).json({ error }));
                }
                if(sauce.usersDisliked.includes(req.body.userId)) {
                    Sauce.updateOne({ _id: req.params.id }, {
                        _id: req.params.id,
                        $pull : {usersDisliked: req.body.userId},
                        dislikes: sauce.usersDisliked.length - 1
                    })
                        .then(() => res.status(201).json({message: "Vous n'avez plus d'avis !"}))
                        .catch(error => res.status(400).json({ error }));
                }
            }
        })
        .catch(error => res.status(404).json({ error }));
}

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const fileName = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${fileName}`, () => {
                Sauce.deleteOne({ _id: sauce.id })
                    .then(() => res.status(200).json({message: 'Sauce supprimée'}))
                    .catch(error => res.status(404).json({ error }));
            })
        })
        .catch(error => res.status(404).json({ error }));
};
