import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Connection } from './config/database/connection.database';
import PagoRouter from './routers/payment.router';
import path from 'path';
import fs from 'fs';

dotenv.config();

const uploadsDir = path.join(__dirname, '../dist/uploads');

class Main {
  public app: express.Application;
  private PORT: number = Number(process.env.PORT) || 8000;
  private API_URL: string = process.env.API_URL || 'http://localhost';

  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.app.use(morgan('dev'));
    this.app.use(PagoRouter);

    new Connection();

    this.listen();
    this.clearUploadsFolder();
  }

  public listen() {
    this.app.listen(String(this.PORT), () => {
      console.log(`server running on ${this.API_URL}:${this.PORT}`);
    });
  }

  clearUploadsFolder = () => {
    fs.readdir(uploadsDir, (err, files) => {
      if (err) {
        console.error('Error al leer la carpeta de uploads:', err);
        return;
      }

      files.forEach((file) => {
        const filePath = path.join(uploadsDir, file);

        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error al eliminar el archivo:', file, err);
          } else {
            console.log('Archivo eliminado:', file);
          }
        });
      });
    });
  };
}

new Main();
