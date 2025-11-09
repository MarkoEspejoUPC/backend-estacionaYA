const { success, error } = require('../../utils/response');
const path = require('path');
const { sendMessage } = require('../../services/sqsService');

let callCount = 0; // persistente mientras viva el proceso

module.exports.handler = async (event) => {
  try {
    // incrementar contador por invocación
    callCount++;
    // si es la quinta llamada, reiniciar a 1 (la quinta usará dummyData.json)
    if (callCount === 5) callCount = 1;

    const which = Math.min(callCount, 3); // 1, 2 o 3 (4 -> 3)
    const fileName = which === 1 ? 'dummyData.json' : `dummyData${which}.json`;
    const filePath = path.resolve(__dirname, '..', '..', 'data', fileName);

    // eliminar cache para recargar JSON en caliente si existe
    try {
      const resolved = require.resolve(filePath);
      delete require.cache[resolved];
    } catch (e) {
      // ignore
    }

    const dummy = require(filePath);

    // Expecting body to possibly contain image metadata. We'll simulate detection.
    const body = JSON.parse(event.body || '{}');
    const detectedSpaces = dummy.spaces; // dummy data

    // send to queue for processing/registration
    await sendMessage({ type: 'DETECTION', payload: detectedSpaces, meta: body.meta || {} });

    return success({ message: 'Detección simulada enviada a cola', detectedSpaces, fileUsed: fileName, callCount });
  } catch (err) {
    console.error(err);
    return error('Error en detectSpaces');
  }
};
