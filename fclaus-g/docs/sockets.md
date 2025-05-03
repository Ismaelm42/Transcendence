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
