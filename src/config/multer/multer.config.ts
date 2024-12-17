import multer from 'multer';
import path from 'path';

class MulterConfiguration {
  public storage: multer.StorageEngine;
  public upload: multer.Multer;

  constructor() {
    this.storage = multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
      },
      filename: (_req, file, cb) => {
        cb(null, `${file.originalname}`);
      },
    });
    this.upload = multer({
      storage: this.storage,
      fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'text/plain') {
          cb(null, true);
        } else {
          cb(new Error('Solo se permite archivos .txt'));
        }
      },
    });
  }
}

export default new MulterConfiguration();
