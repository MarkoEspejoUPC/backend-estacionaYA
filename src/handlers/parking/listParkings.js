const { scanAll } = require('../../services/dynamoService');
const { success, error } = require('../../utils/response');

module.exports.handler = async () => {
  try {
    const items = await scanAll();
    const parkings = items.filter(i => i.type === 'parking');
    return success(parkings);
  } catch (err) {
    console.error(err);
    return error('Error listando estacionamientos');
  }
};
