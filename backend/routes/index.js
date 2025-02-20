import { createUser, getUsers, deleteUserById, getUserByName } from '../DB/crud.js';

export default async function routes(fastify, options) {
  fastify.post('/create_user', async (request, reply) => {
    const { username, password } = request.body;
    try {
      const newUser = await createUser(username, password);
      reply.send({ message: `User ${username} created successfully`, user: newUser });
    } catch (err) {
      fastify.log.error(err);
      reply.send({ error: `Error creating user : ${err.message}` });
    }
  });

  fastify.get('/get_users', async (request, reply) => {
    try {
      const users = await getUsers();
      reply.send(users);
    } catch (err) {
      fastify.log.error('Cannot list users', err);
      reply.send({ error: 'Error fetching users' });
    }
  });

  fastify.get('/get_user_by_username/', async (request, reply) => {
    try {
      const user = await getUserByName(request.query.username);
      reply.send(user);
    } catch (err) {
      fastify.log.error('User not found', err);
      reply.send({ error: 'User not found'});
    }
  });

  fastify.delete('/delete_user_by_id', async (request, reply) => {
    const { userId } = request.body;
    try {
      const result = await deleteUserById(userId);
      reply.send(result);
    } catch (err) {
      fastify.log.error(err);
      reply.send({ error: 'Error deleting user' });
    }
  });

  // Puedes agregar más rutas aquí
}