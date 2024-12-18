# Prueba técnica Kairox

<p><b>Consigna:</b> Desafio donde debía trabajar con Node.js y TypeScript para crear una API que gestione el procesamiento de archivos de afiliados. Demostrando habilidades en el manejo de rutas, servicios, modelos de datos, y buenas prácticas de desarrollo y comprensión del problema.</p>

------------


### Tecnologias utilizadas

- Express
- Mongoose
- TypeScript
- Multer
- NodeMailer
- Moment
- Morgan
- Concurrently
- Nodemon
- Swagger UI Express
- Dotenv

------------


## Instalación y utilización

#### 1. Clonar el repositorio
```
git clone https://github.com/Leaeraso/prueba-tecnica-kairox

```
#### 2. Instalar dependencias
```
npm install

```
#### 3. Configurar .env
**Explicación mas abajo**

#### 4. Iniciar el servidor
```
npm run start:dev

```
------------


## Configuración de variables de entorno
### Variables de Entorno
| Variable             | Descripción                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| `PORT`          | Puerto donde se ejecutará la API (por defecto, 8000).                      |
| `API_URL`         | URL de la API.                                  |
| `MONGO_DB_URI`       | URI para conectarse a la base de datos de MongoDB, debe finalizar con /db_name.               |
| `EMAIL_USER`         | Dirección de correo para enviar mails.                                              |
| `EMAIL_PASS`         | Contraseña de aplicación asociada al correo.                                         |

### Obtención de variables
#### 1. EMAIL_PASS(Contraseña de aplicación):
- Ir a la configuración de tu proveedor de email
- Activar la autenticación en dos pasos
- Generar una contraseña de aplicación
------------


## Documentación
<p>
Para utilizar la documentación de la API y probar los endpoints, iniciar el servidor y entrar al siguiente endpoint:

```
http://localhost:8000/documentation/

```
</p>



