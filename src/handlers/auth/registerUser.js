const { v4: uuidv4 } = require('uuid');
const { success, error, created } = require('../../utils/response');
const { hash } = require('../../utils/hash');
const { saveItem } = require('../../services/dynamoService');

module.exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { name, email, password, plate } = body;
    if (!email || !password) return error('Email y contraseña requeridos', 400);

    const user = {
      id: uuidv4(),
      type: 'user',
      name: name || null,
      email,
      passwordHash: await hash(password),
      plate: plate || null,
      createdAt: new Date().toISOString()
    };

    await saveItem(user);
    return created({ message: 'Usuario registrado', userId: user.id });
  } catch (err) {
    console.error(err);
    return error('Error en registro');
  }
};
