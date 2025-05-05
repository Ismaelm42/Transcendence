# Sockets

## Fundamentos
### WebSocket

Protocolo de red que permite una conexión persistente entre el cliente y el servidor, donde ambos pueden enviarse mensajes en tiempo real por ejemplo, sin tener que esperar una petición HTTP tradicional.

### Socket.io

Librería que abstrae los WebSockets y los hace más facil de usar. No es lo mismo que el protocolo WebSocket puro. Usa su propio protocolo encima de WebSocket o HHTP long polling.
- Compatibilidad con navegadores antiguos.
- Reconexión automática.
- Soporte para eventos personalizados.
- Manejo de rooms y namespaces(como canales),
- Middleware(para auth, logging, etc.)

### Conexión

1. El cliente(navegador) se conecta al servidor via socket.io-client.
2. Se establece una conexion persistente (idealmente Websocket).
3. Una vez conectado ambos pueden enviar eventos personalizados.

Ejemplo:

```js

//Cliente
import { io } from 'socket.io-client';
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Conectado con ID:', socket.id);
});

socket.emit('mensaje', 'Hola servidor');

//Servidor
import { Server } from 'socket.io';
const io = new Server(3000);

io.on('connection', (socket) => {
  console.log('Nuevo cliente:', socket.id);

  socket.on('mensaje', (msg) => {
    console.log('Mensaje recibido:', msg);
  });
});

```

## Conexión cliente-servidor

### Backend

```js
// backend/src/index.ts
import Fastify from 'fastify';
import fastifySocketIO from 'fastify-socket.io';

const app = Fastify();//crea una instancia de fastify

app.register(fastifySocketIO);//habilita el uso de socket.io en fastify

app.ready().then(() => {
  app.io.on('connection', (socket) => {
    console.log(`Nuevo cliente conectado: ${socket.id}`);

    socket.on('mensaje', (data) => {
      console.log(`Mensaje recibido: ${data}`);
      socket.emit('respuesta', `Hola, recibí tu mensaje: ${data}`);
    });

    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  });
});

app.listen({ port: 3000 }, (err) => {
  if (err) throw err;
  console.log('Servidor corriendo en http://localhost:3000');
});
```

### Frontend

```js
// frontend/src/socket.ts
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Conectado al servidor:', socket.id);

  // Enviar un mensaje
  socket.emit('mensaje', '¡Hola desde el frontend!');

  // Escuchar respuesta
  socket.on('respuesta', (msg) => {
    console.log('Respuesta del servidor:', msg);
  });
});

export default socket;
```

## Preguntas a resolver

1. **¿Que pasa si el cliente cierra la pestaña?**
  - Cuando un user cierra la pestaña o la recarga, el navegador envia una señal de desconexion al servidor. El servidor puede manejar esto y ejecutar la lógica necesaria para limpiar recursos o notificar a otros usuarios.
  ```js
  socket.on('disconnect', () => {
	console.log(`Cliente desconectado: ${socket.id}`);
  });
  ```
2. **¿Se puede enviar un evento al servidor sin que el cliente lo pida?**
  - No, el cliente siempre tiene que iniciar la comunicación. El servidor no puede enviar eventos al cliente sin que este lo pida primero. Sin embargo, el servidor puede enviar eventos a todos los clientes conectados.
  ```js
  io.emit('evento', 'Mensaje para todos los clientes');
  ```
3. **Se puede tener un canal general y mensajes privados?**
  - Si, puedes tener un canal general y mensajes privados. Para esto puedes usar rooms o namespaces. Un room es un grupo de sockets que pueden comunicarse entre ellos. Un namespace es una forma de dividir la comunicación en diferentes canales.
  ```js
  socket.join('room1');
  socket.to('room1').emit('mensaje', 'Hola room1');
  ```
  - Para mensajes privados puedes usar el id del socket.
  ```js
  socket.to('socketId').emit('mensaje', 'Hola socketId');
  // o unirse a un room privado por username u otro identificador
  socket.join('room-username');
  socket.to('room-username').emit('mensaje', 'Hola room-username');
  ```

4. **¿Como diferenciar entre un evento y un mensaje?**
  - Un evento es una acción que ocurre en el servidor o en el cliente. Un mensaje es un dato que se envía entre el servidor y el cliente. En socket.io, los eventos son los nombres de los mensajes.
  ```js
  socket.emit('evento', 'Mensaje');
  // o
  socket.on('evento', (data) => {
	console.log(data);
  });
  ```
5. **¿Cómo diferenciar mensajes entrantes y salientes de un cilente?¿Se pueden asignar colores por user?**
- En el cliente podemos distinguir entre mensajes entrantes y salientes usando el id del socket. Podemos asignar un color diferente a cada usuario usando su id o username.
```js
socket.on('mensaje', (data) => {
  if (data.socketId === socket.id) {
	// Mensaje saliente
	console.log('%cMensaje saliente:', 'color: green;', data.mensaje);
  } else {
	// Mensaje entrante
	console.log('%cMensaje entrante:', 'color: red;', data.mensaje);
  }
});
```
- Para asignar colores por user podemos usar un objeto que contenga el id del socket y el color.
```js
const colores = {
  socketId1: 'red',
  socketId2: 'blue',
  socketId3: 'green',
};
socket.on('mensaje', (data) => {
  const color = colores[data.socketId] || 'black';
  console.log(`%cMensaje de ${data.socketId}:`, `color: ${color};`, data.mensaje);
});
```
- O usando una librería de colores como [randomcolor](https://www.npmjs.com/package/randomcolor) para generar un color aleatorio por user.
```js
import randomColor from 'randomcolor';
const colores = {};
socket.on('connect', () => {
  const color = randomColor();
  colores[socket.id] = color;
  console.log(`%cConectado con color: ${color}`, `color: ${color};`);
});
socket.on('mensaje', (data) => {
  const color = colores[data.socketId] || 'black';
  console.log(`%cMensaje de ${data.socketId}:`, `color: ${color};`, data.mensaje);
});
```
- O creando un método para asignar colores aleatorios a cada user.
```js
function getColorFromUsername(username: string): string {
  const hash = [...username].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = ['#f87171', '#60a5fa', '#34d399', '#facc15', '#c084fc'];
  return colors[hash % colors.length];
}
```

### Implementar socket.io con fastify y nodejs
```js
// backend/src/index.ts
import Fastify from "fastify";
import { Server } from "socket.io";
import { createServer } from "http";

const fastify = Fastify();
const httpServer = createServer(fastify.server); // clave aquí
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

// Fastify routes (ejemplo)
fastify.get("/", async () => {
  return { hello: "world" };
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  socket.on("mensaje", (msg) => {
    console.log("Mensaje recibido:", msg);
    io.emit("mensaje", msg); // reenvía a todos
  });
});

// Lanzar el servidor
httpServer.listen(3000, () => {
  console.log("Fastify + Socket.IO escuchando en http://localhost:3000");
});



// // frontend/src/socket.ts
// import { io } from "socket.io-client";
// const socket = io("http://localhost:3000", {
//   transports: ["websocket"], // Solo WebSocket
// });
// socket.on("connect", () => {
//   console.log("Conectado al servidor:", socket.id);
// });
// socket.on("mensaje", (msg) => {
//   console.log("Mensaje recibido:", msg);
// });
// socket.emit("mensaje", "Hola desde el cliente");
// socket.on("disconnect", () => {
//   console.log("Desconectado del servidor");
// });
// export default socket;


// Cliente socket.io-client
import { io } from "socket.io-client";
const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Conectado como", socket.id);
  socket.emit("mensaje", "Hola desde el cliente!");
});

socket.on("mensaje", (msg) => {
  console.log("Mensaje recibido:", msg);
});

```
