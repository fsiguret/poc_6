const mongoose = require('mongoose');
const arrayValidator = require('mongoose-unique-array');

const sauceSchema = mongoose.Schema({
   userId: { type: String, required: true},
   name: {type: String, required: true},
   manufacturer: {type: String, required: true},
   description: {type: String, required: true},
   mainPepper: {type: String, required: true},
   imageUrl: {type: String, required:true},
   heat: {type: Number, required: true},
   likes: {type: Number, required: true},
   dislikes: {type: Number, required: true},
   usersLiked: [{type: String, required: true, unique: true}],
   usersDisliked: [{type: String, required: true, unique: true}]
});

sauceSchema.plugin(arrayValidator);

module.exports = mongoose.model('Sauce', sauceSchema);
