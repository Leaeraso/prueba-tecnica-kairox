import express, { NextFunction, Request, Response } from 'express';
import MulterConfiguration from '../config/multer/multer.docs';
import PagoService from '../services/pago-afiliado.service';

class PagoRouter {
  public router: express.Router;

  constructor() {
    this.router = express.Router();
    this.createRoutes();
  }

  createRoutes(): void {
    this.router.post(
      '/afiliado/pago',
      MulterConfiguration.upload.single('file'),
      this.handlePagoAfiliado.bind(this)
    );
  }

  private handlePagoAfiliado(req: Request, _res: Response, next: NextFunction) {
    console.log('obtiendo archivo...');
    const file: Express.Multer.File | undefined = req.file;

    if (!file) {
      return next(new Error('Debe cargar un archivo'));
    }

    PagoService.setPagoAfiliado(file)
      .then((res) => res)
      .catch((err) => next(err));
  }
}

export default new PagoRouter().router;
