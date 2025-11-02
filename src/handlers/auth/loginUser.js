const { getAll } = require('../../services/dynamoService');
const { compare } = require('../../utils/hash');
const { success, error } = require('../../utils/response');
const { sign } = require('../../services/jwtService');

module.exports.handler = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body || '{}');
    if (!email || !password) return error('Email y contraseña requeridos', 400);

    const users = await getAll();
    const user = users.find(u => u.type === 'user' && u.email === email);
    if (!user) return error('Usuario no encontrado', 404);

    const ok = await compare(password, user.passwordHash || '');
    if (!ok) return error('Contraseña incorrecta', 401);

    const token = sign({ id: user.id, email: user.email });
    return success({ message: 'Login exitoso', token });
  } catch (err) {
    console.error(err);
    return error('Error en login');
  }
};
