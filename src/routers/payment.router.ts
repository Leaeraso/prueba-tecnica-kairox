import express, { NextFunction, Request, Response } from 'express';
import MulterConfiguration from '../config/multer/multer.config';
import PagoService from '../services/affiliate-payment.service';

class PaymentRouter {
  public router: express.Router;

  constructor() {
    this.router = express.Router();
    this.createRoutes();
  }

  createRoutes(): void {
    this.router.post(
      '/affiliate/payment',
      MulterConfiguration.upload.single('file'),
      this.handleAffiliatePayment.bind(this)
    );
    this.router.get(
      '/affiliate/payments/:id',
      this.handleAffiliatePaymentsByAffiliateId.bind(this)
    );
    this.router.get(
      '/affiliate/inactives',
      this.handleInactiveAffiliates.bind(this)
    );
  }

  private handleAffiliatePayment(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    console.log('obtiendo archivo...');
    const file: Express.Multer.File | undefined = req.file;

    if (!file) {
      return next(new Error('Must load a file'));
    }

    PagoService.setAffiliatePayment(file)
      .then((result) => res.json(result))
      .catch((err) => next(err));
  }

  private handleAffiliatePaymentsByAffiliateId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    PagoService.getAffiliatePaymentsByAffiliateId(Number(req.params.id))
      .then((result) => res.json(result))
      .catch((err) => next(err));
  }

  private handleInactiveAffiliates(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    PagoService.getInactiveAffiliates()
      .then((result) => res.json(result))
      .catch((err) => next(err));
  }
}

export default new PaymentRouter().router;
