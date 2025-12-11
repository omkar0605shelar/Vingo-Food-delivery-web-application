import multer from "multer";
import path from "path";
import fs from "fs";

// Store files temporarily in a /uploads folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g., 173092949.png
  },
});

export const upload = multer({ storage });
