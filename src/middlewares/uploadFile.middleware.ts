import path from "path";
import multer from "multer";

const uploadFile = (): multer.Multer => {
  const checkFileType = (file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const fileTypes = /jpg|jpeg|png|svg/;

    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Images Only"));
    }
  };

  const storage = multer.diskStorage({});
  return multer({
    storage,
    fileFilter: (req, file, cb) => {
      checkFileType(file, cb);
    },
  });
};
export default uploadFile;
