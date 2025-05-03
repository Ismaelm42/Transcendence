# Proyecto Transcendence

## **1. Estructura del Proyecto**
El proyecto está dividido en tres partes principales:
- **Frontend**: Contiene la interfaz de usuario y la lógica del cliente.
- **Backend**: Contiene la lógica del servidor, la API y la base de datos.
- **Nginx**: Configuración del servidor proxy para manejar las solicitudes.

---

### **Frontend**
Ubicación: `/frontend`

El frontend está construido con **HTML**, **CSS** (Tailwind y estilos personalizados) y **JavaScript/TypeScript**. Utiliza un enfoque de **SPA (Single Page Application)**, lo que significa que la navegación entre las diferentes vistas no recarga la página completa, sino que actualiza dinámicamente el contenido.

#### **Estructura del Frontend**
- **HTML**: Plantillas HTML para las diferentes vistas (por ejemplo, `profile.html`, `login.html`).
- **CSS**: Estilos personalizados en `custom.css` y estilos generados por Tailwind en `output.css`.
- **JavaScript/TypeScript**:
  - **SPA.js**: Controla la navegación entre las vistas y carga los módulos correspondientes.
  - **Renderizadores**: Cada vista tiene su propio archivo de renderizado, como `homeRender.js`, `loginRender.js`, etc.
  - **Componentes reutilizables**: Por ejemplo, `stepRender.js` define una clase base `Step` que es extendida por los renderizadores de cada vista.
  - **Manejo de formularios**: Archivos como `handleLoginSubmit.js` y `handleRegisterSubmit.js` manejan eventos de formularios.

#### **Flujo del Frontend**
1. **Inicio**: Al cargar la página, el archivo principal (`main.js`) inicializa la clase `SPA`.
2. **Navegación**: La clase `SPA` detecta el hash en la URL (por ejemplo, `#home`, `#login`) y carga el módulo correspondiente.
3. **Renderizado**: Cada módulo extiende la clase `Step` y define métodos como `render` para mostrar el contenido en el contenedor principal (`#app-container`).
4. **Autenticación**: Se verifica si el usuario está autenticado mediante el método `checkAuth`, que realiza una solicitud al backend.

---

### **Backend**
Ubicación: `/backend`

El backend está construido con **Node.js** y utiliza **Fastify** como framework para manejar las solicitudes HTTP. También utiliza **Sequelize** como ORM para interactuar con la base de datos.

#### **Estructura del Backend**
- **Rutas**: 
  - `authRoutes.js`: Maneja la autenticación (login, logout, verificación de tokens).
  - `crudRoutes.js`: Maneja operaciones CRUD (crear, leer, actualizar, eliminar).
  - `imagesRoutes.js`: Maneja la carga y el acceso a imágenes.
- **Modelos**: 
  - `User`: Representa a los usuarios en la base de datos.
  - `Gamelog`: Registra las partidas jugadas.
- **Configuración**:
  - `config.js`: Configura CORS, autenticación de Google y archivos estáticos.
  - `pino.js`: Configura el logger para registrar eventos.
- **Base de Datos**:
  - Migraciones: Scripts para crear y modificar tablas.
  - Seeders: Scripts para insertar datos iniciales (usuarios, partidas).

#### **Flujo del Backend**
1. **Inicio del Servidor**: El archivo principal (`index.js`) configura Fastify, registra las rutas y sincroniza la base de datos.
2. **Autenticación**: Utiliza JWT para autenticar a los usuarios. Los tokens se almacenan en cookies.
3. **API**: Proporciona endpoints para que el frontend interactúe con la base de datos (por ejemplo, `/auth/login`, `/auth/verify-token`).

---

### **Nginx**
Ubicación: `/nginx`

Nginx actúa como un servidor proxy inverso para manejar las solicitudes entrantes. Redirige las solicitudes al frontend o al backend según la ruta.

#### **Configuración**
- `default.conf`: Define las reglas de redirección.
- `ssl_certs/`: Contiene los certificados SSL para habilitar HTTPS.

---

## **2. Flujo General de la Aplicación**
1. **Inicio**:
   - El usuario accede a la aplicación en el navegador.
   - Nginx redirige la solicitud al frontend.
2. **Navegación**:
   - El frontend carga la vista correspondiente según la URL.
   - Si la vista requiere autenticación, se verifica el token con el backend.
3. **Interacción**:
   - El usuario interactúa con la interfaz (por ejemplo, inicia sesión, edita su perfil).
   - El frontend envía solicitudes al backend para realizar acciones (por ejemplo, actualizar datos del usuario).
4. **Respuesta**:
   - El backend procesa la solicitud, interactúa con la base de datos y devuelve una respuesta al frontend.
   - El frontend actualiza la interfaz según la respuesta.

---

## **3. Archivos Clave**
### **Frontend**
- [`spa.js`](frontend/src/js/spa.js): Controla la navegación y carga de vistas.
- [`stepRender.js`](frontend/src/js/stepRender.js): Clase base para los renderizadores.
- [`handleLoginSubmit.js`](frontend/src/js/handleLoginSubmit.js): Maneja el envío del formulario de login.
- [`custom.css`](frontend/src/css/custom.css): Estilos personalizados.

### **Backend**
- [`index.js`](backend/index.js): Punto de entrada del servidor.
- [`authRoutes.js`](backend/routes/authRoutes.js): Rutas de autenticación.
- [`models`](backend/database/models): Define las tablas de la base de datos.
- [`config.js`](backend/config/config.js): Configuración del servidor.

---

## **4. Cómo Contribuir**
1. **Entiende el flujo**: Familiarízate con cómo el frontend y el backend interactúan.
2. **Prueba la aplicación**: Navega por las vistas y realiza acciones para entender su comportamiento.
3. **Lee el código**: Revisa los archivos clave mencionados anteriormente.
4. **Añade funcionalidades**:
   - Si trabajas en el frontend, crea o modifica módulos en `src/js` o `src/ts`.
   - Si trabajas en el backend, añade rutas o modelos según sea necesario.
5. **Pruebas**: Asegúrate de probar tus cambios antes de subirlos.
