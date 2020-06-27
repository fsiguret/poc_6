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
        .catch(error => res.status(500).json({error}));
};

exports.changeSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            if(req.file?.filename === undefined) {

                Sauce.updateOne({ _id : req.params.id }, {...req.body, _id: req.params.id})
                    .then(() => res.status(201).json({message: "Sauce modifiée sans changement d'image"}))
                    .catch(error => res.status(500).json({ error }));

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
                        .catch(error => {
                            res.status(500).json({ error });
                        });
                });
            }
        })
        .catch(error => res.status(404).json({ error }));
}

exports.likeOrDislikeSauce = (req, res, next) => {

    const isLike = parseInt(req.body.like, 10);
    const userId = req.body.userId;

    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            switch(isLike) {
                case 1 :
                    if(!sauce.usersLiked.includes(userId)){
                        Sauce.updateOne({ _id: req.params.id }, {
                            _id: req.params.id,
                            $push : {usersLiked: userId},
                            likes: sauce.usersLiked.length + 1
                        })
                            .then(() => res.status(200).json({message: 'Vous avez aimé !'}))
                            .catch(error => res.status(500).json({ error }));
                    }
                    break;
                case -1 :
                    if(!sauce.usersDisliked.includes(userId)) {
                        Sauce.updateOne({ _id: req.params.id }, {
                            _id: req.params.id,
                            $push : {usersDisliked: userId},
                            dislikes: sauce.usersDisliked.length + 1
                        })
                            .then(() => res.status(201).json({message: "Vous n'aimez pas !"}))
                            .catch(error => res.status(500).json({ error }));
                    }
                    break;
                case 0 :
                    if(sauce.usersLiked.includes(userId)) {
                        Sauce.updateOne({ _id: req.params.id }, {
                            _id: req.params.id,
                            $pull : {usersLiked: userId},
                            likes: sauce.usersLiked.length - 1
                        })
                            .then(() => res.status(201).json({message: "Vous n'avez plus d'avis !"}))
                            .catch(error => res.status(500).json({ error }));
                    }else if(sauce.usersDisliked.includes(userId)) {
                        Sauce.updateOne({ _id: req.params.id }, {
                            _id: req.params.id,
                            $pull : {usersDisliked: userId},
                            dislikes: sauce.usersDisliked.length - 1
                        })
                            .then(() => res.status(201).json({message: "Vous n'avez plus d'avis !"}))
                            .catch(error => res.status(500).json({ error }));
                    }
                    break;
                default :
                    new Error("You cannot like or dislike");
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
                    .catch(error => res.status(500).json({ error }));
            })
        })
        .catch(error => res.status(404).json({ error }));
};
