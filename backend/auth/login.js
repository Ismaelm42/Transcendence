// import { comparePassword } from '../db/users/PassUtils.cjs';
// import { getUserByName } from '../db/crud.cjs';
import pkg from '../database/users/PassUtils.cjs';
const { comparePassword } = pkg;
import pkg2 from '../database/crud.cjs';
const { getUserByEmail } = pkg2;
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export const checkUser = async (email, password, reply) => {

	const user = await getUserByEmail(email);
	console.log('Buscando user:', email);
	if (!user) {
		return reply.status(401).send({ message: 'Nombre de usuario incorrecto' });
	}
	console.log(password);
	console.log(user.password);
	const isMatch = await comparePassword(password, user.password);
	if (!isMatch) {
	return reply.status(401).send({ message: 'Contraseña incorrecta' });
	}
	const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });

	// Establecer el token como una cookie HTTP-only y secure
	reply.setCookie('token', token, {
		httpOnly: true,
		secure: true, // Asegúrate de que tu servidor esté configurado para HTTPS
		sameSite: 'strict', // Opcional: evita que la cookie sea enviada en solicitudes de terceros
		path: '/', // La cookie estará disponible en toda la aplicación
		maxAge: 3600 // Tiempo de expiración en segundos (1 hora)
	});
	
	// return reply.status(200).send({ 
	// 	message: 'Inicio de sesión exitoso', 
	// 	username: user.username, avatar: 
	// 	user.avatarPath, token: token });
		return reply.status(200).send({ 
			user: user});
	

};
