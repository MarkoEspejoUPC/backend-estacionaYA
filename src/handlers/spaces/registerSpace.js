const { v4: uuidv4 } = require('uuid');
const { saveItem } = require('../../services/dynamoService');
const { success, error, created } = require('../../utils/response');

module.exports.handler = async (event) => {
  try {
    const parkingId = event.pathParameters && event.pathParameters.id;
    const body = JSON.parse(event.body || '{}');
    const { label, status } = body;
    if (!parkingId || !label) return error('parkingId y label requeridos', 400);

    const space = {
      id: uuidv4(),
      type: 'space',
      parkingId,
      label,
      status: status || 'FREE',
      createdAt: new Date().toISOString()
    };

    await saveItem(space);
    return created({ message: 'Espacio registrado', space });
  } catch (err) {
    console.error(err);
    return error('Error registrar espacio');
  }
};
