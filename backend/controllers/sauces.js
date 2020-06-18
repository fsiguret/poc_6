const Sauce = require('../models/Sauces');
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
    //TODO
};

exports.changeSauce = (req, res, next) => {
    //TODO
};

exports.deleteSauce = (req, res, next) => {
    //TODO
};
