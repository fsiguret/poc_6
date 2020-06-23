const multer = require('multer');

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
   destination: (req, file, callback) => {
       //Verify if the mime type is valid
       const isValid = MIME_TYPE_MAP[file.mimetype];
       let error = new Error("The MIME type is invalid, please use .png, .jpg or .jpeg");

       if(isValid) {
           error = null;
       }
       callback(error, 'images');
   },
   filename: (req, file, callback) => {
        let nameFile = file.originalname.substring(0,file.originalname.lastIndexOf('.'));
        const name = nameFile.toLowerCase().split(' ').join('_');
        const ext = MIME_TYPE_MAP[file.mimetype];
        callback(null, name + "_" + Date.now() + "." + ext);
   }
});

module.exports = multer({storage:storage}).single('image');
