import multer, { memoryStorage } from "multer";

const FILESIZE = 5 * 1024 * 1024; // 5MB
const FILE_LIMIT = 4;

const storage = memoryStorage();

const uploadMw = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/gif"
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
}).array("images", FILE_LIMIT);

export default uploadMw;
