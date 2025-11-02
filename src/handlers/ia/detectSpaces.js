const { success, error } = require('../../utils/response');
const dummy = require('../../data/dummyData.json');
const { sendMessage } = require('../../services/sqsService');

module.exports.handler = async (event) => {
  try {
    // Expecting body to possibly contain image metadata. We'll simulate detection.
    const body = JSON.parse(event.body || '{}');
    const detectedSpaces = dummy.spaces; // dummy data
    // send to queue for processing/registration
    await sendMessage({ type: 'DETECTION', payload: detectedSpaces, meta: body.meta || {} });
    return success({ message: 'Detección simulada enviada a cola', detectedSpaces });
  } catch (err) {
    console.error(err);
    return error('Error en detectSpaces');
  }
};
