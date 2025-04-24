import fs from 'fs';
import path from 'path';
import { crud } from '../crud/crud.js';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { extractUserFromToken } from '../auth/authToken.js';

const pump = promisify(pipeline);

export function configureImageRoutes(fastify, sequelize) {

	fastify.post('/upload_image', async (request, reply) => {
		const parts = request.parts();
		for await (const part of parts) {
			if (part.file) {
				const user = await extractUserFromToken(request.cookies.token);
				if (!user)
					return reply.code(401).send({ error: 'Unauthenticated user' });
				const imageId = user.id + '.png';
				if (part.mimetype !== 'image/png')
					return reply.code(400).send({ error: 'Only .png files are allowed' });
				const filePath = path.join('/app/images', imageId);
				await pump(part.file, fs.createWriteStream(filePath));
				const avatarPath = "https://localhost:8443/back/images/" + imageId;
				await crud.user.updateUserbyId(user.id, null, null, null, null, null, avatarPath);
				return reply.send({ status: 'ok', url: avatarPath });
			}
		}
		return reply.code(400).send({ error: 'No file received' });
	});

	fastify.post('/delete_image', async (request, reply) => {
		const user = await extractUserFromToken(request.cookies.token);
		if (!user)
			return reply.code(401).send({ error: 'Unauthenticated user' });
		const imageId = user.id + '.png';
		const filePath = path.join('/app/images', imageId);
		if (filePath !== '/app/images/default-avatar.png' && fs.existsSync(filePath)) {
			fs.unlink(filePath, (err) => {
				if (err)
					return reply.code(500).send({ error: 'Error deleting the image' });
			});
			const avatarPath = "https://localhost:8443/back/images/" + imageId;
			await crud.user.updateUserbyId(user.id, null, null, null, null, null, avatarPath);
			return reply.send({ status: 'ok', message: 'Image deleted successfully' });
		}
	});
}
