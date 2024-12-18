import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Connection } from './config/database/connection.database';
import PagoRouter from './routers/payment.router';
import swaggerDoc from './config/doc/swagger-documentation.yml';
import swaggerUi from 'swagger-ui-express';

dotenv.config();

class Main {
  public app: express.Application;
  private PORT: number = Number(process.env.PORT) || 8000;
  private API_URL: string = process.env.API_URL || 'http://localhost';

  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.app.use(morgan('dev'));
    this.app.use(PagoRouter);
    this.app.use(
      '/documentation',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDoc)
    );

    new Connection();

    this.listen();
  }

  public listen() {
    this.app.listen(String(this.PORT), () => {
      console.log(`server running on ${this.API_URL}:${this.PORT}`);
    });
  }
}

new Main();
