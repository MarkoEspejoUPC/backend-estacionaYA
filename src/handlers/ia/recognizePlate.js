const { success, error } = require('../../utils/response');
const { sendMessage } = require('../../services/sqsService');

module.exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { imageUrl } = body;
    // Simula reconocimiento
    const plate = body.plate || 'ABC123';
    await sendMessage({ type: 'PLATE_RECOGNIZED', plate, source: imageUrl });
    return success({ message: 'Placa simulada', plate, source: imageUrl });
  } catch (err) {
    console.error(err);
    return error('Error recognizePlate');
  }
};
