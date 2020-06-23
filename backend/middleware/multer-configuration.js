const multer = require('multer');

const storage = multer.diskStorage({
   destination: (req, file, callback) => {
       callback(null, 'images');
   },
   filename: (req, file, callback) => {
        const nameFile = file.originalname.split(' ').join('_');
        callback(null, Date.now() + nameFile);
   }
});

module.exports = multer({storage:storage}).single('image');
