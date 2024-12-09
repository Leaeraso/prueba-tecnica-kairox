import express, { NextFunction, Request, Response } from 'express';
import MulterConfiguration from '../config/docs/multer.docs';
import PagoService from '../services/pago.service';

class PagoRouter {
  public router: express.Router;

  constructor() {
    this.router = express.Router();
    this.createRoutes();
  }

  createRoutes(): void {
    this.router.post(
      '/pago',
      MulterConfiguration.upload.single('file'),
      this.handlePagoAfiliado.bind(this)
    );
  }

  private async handlePagoAfiliado(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    console.log('obtiendo archivo...');
    const file: Express.Multer.File | undefined = req.file;

    if (file === undefined) {
      return next(new Error('Debe cargar un archivo'));
    }

    try {
      console.log('llamando al servicio');
      await PagoService.setPagoAfiliado(file);

      res
        .status(200)
        .json({ message: 'Solicitud de pago procesada correctamente' });
    } catch (error) {
      next(error);
    }
  }
}

export default new PagoRouter().router;
