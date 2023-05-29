import multer, { memoryStorage } from "multer";

const FILESIZE = 10 * 1024 * 1024; // 5MB
const FILE_LIMIT = 4;

const storage = memoryStorage();

const uploadStoryValidator = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/gif" ||
      file.mimetype === "video/mp4" ||
      file.mimetype === "video/mpeg" ||
      file.mimetype === "video/ogg"
    ) {
      cb(null, true);
    } else {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"));
    }
  },
  limits: {
    fileSize: FILESIZE,
    files: FILE_LIMIT,
  },
}).array("media", FILE_LIMIT);

export default uploadStoryValidator;
