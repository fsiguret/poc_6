const multer = require('multer');

const mimeTypes = {
    'image/png': 'png',
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg'
};

const storage = multer.diskStorage({
   destination: (req, file, callback) => {
       callback(null, 'images');
   },
   filename: (req, file, callback) => {
        const nameFile = file.originalname.split(' ').join('_');
        const extension = mimeTypes[file.mimetype];
        callback(null, nameFile + Date.now() + '.' + extension);
   }
});

module.exports = multer({storage:storage}).single('image');
