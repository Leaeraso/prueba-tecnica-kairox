✅1- Trabajaria con metodología de POO en lugar de funcional, es mas limpio y legible el código.

2- Los nombres de los archivos, se usa la convención kebab-case. Por ejemplo, en lugar de createCategory --> create-category. La convención de camel-case se usa nada mas para variables.

3- La forma de usar swagger no es la adecuada, si se usa asi con anotaciones el código es re contra ilegible. Lo que se hace es poner todo en un archivo .yml. Y este archivo iría dentro de /config/docs/swagger.yml

4- La carpeta db iría adentro de config al igual que la carpeta docs. Las carpeta models y dto irían adentro de una carpeta 'data' dentro de config.

5- Siempre se usa la convención de <nombre-archivo>.<carpeta o tipo>.ts Por ejemplo: product-algo.service.ts o product.service.ts

6- No se usa 'Controllers', de la route pasa al service.

7- Es muy ilegible hacer un archivo por cada service, y muy poco escalable. Suponete que hago un crud de product, no puedo tener 5 archivos por un simple crud. Estos son 5 métodos de una clase llamada 'produc.service.ts'.

8- Bloques try-catch innecesarios. Ejemplo de el 'createImge'
try {
await validateHelper(imageModel, image)

        const existingImage = await imageModel.findOne({
            where: {
                url: image.url,
            }
        })

        if(existingImage !== null) {
            throw errorHelper.conflictError(
                'La imagen ya existe',
                'IMAGE_ALREADY_EXISTS'
            )
        }

        await imageModel.create({
            url: image.url,
            productId: image.productId
        })

    } catch (error) {
        if (error instanceof customError) {
            throw error
        }

        throw errorHelper.internalServerError(
            'Error al crear la imagen',
            'CREATE_IMAGE_ERROR'
        )
    }

Es mucho mas simple hacer algo como(usando método):

async createImage() {
await validateHelper(imageModel, image)

        const existingImage = await imageModel.findOne({
            where: {
                url: image.url,
            }
        })

        if(existingImage !== null) {
            throw errorHelper.conflictError(
                'La imagen ya existe',
                'IMAGE_ALREADY_EXISTS'
            )
        }
    return imageModel.create({
            url: image.url,
            productId: image.productId
        })

}

Si hay algún error ya te va a venir en el return y es lo mismo que manejarlo con un try-catch.

9- Ejemplo de como hacer un router:

import { NextFunction, Request, Response, Router } from 'express';
import testService from '@services/test.service';

class TestRoute {
public router = Router();

constructor() {
this.createRoutes();
}

createRoutes(): void {
this.router.get('/test', this.handleTest.bind(this));
}

private handleTest(req: Request, res: Response, next: NextFunction) {
testService
.testEndpoint()
.then((response) => res.json(response))
.catch((err) => next(err));
}
}

export default new TestRoute().router;
