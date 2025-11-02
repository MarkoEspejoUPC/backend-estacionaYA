const { scanAll } = require('../../services/dynamoService');
const { success, error } = require('../../utils/response');

module.exports.handler = async (event) => {
  try {
    const parkingId = event.pathParameters && event.pathParameters.id;
    if (!parkingId) return error('parkingId requerido', 400);
    const items = await scanAll();
    const spaces = items.filter(i => i.type === 'space' && i.parkingId === parkingId);
    return success(spaces);
  } catch (err) {
    console.error(err);
    return error('Error listando espacios');
  }
};
