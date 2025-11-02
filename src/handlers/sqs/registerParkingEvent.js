const { saveItem } = require('../../services/dynamoService');

module.exports.handler = async (event) => {
  try {
    for (const record of event.Records) {
      const body = JSON.parse(record.body);
      // We store events as generic items
      const item = {
        id: body.id || `evt-${Date.now()}`,
        type: 'event',
        eventType: body.type,
        data: body.payload || body,
        timestamp: new Date().toISOString()
      };
      await saveItem(item);
      console.log('Evento SQS almacenado', item.id, body.type);
    }
  } catch (err) {
    console.error('Error en registerParkingEvent', err);
    throw err;
  }
};
