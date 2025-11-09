const { v4: uuidv4 } = require('uuid');
const { saveItem } = require('../../services/dynamoService');
const { success, error, created } = require('../../utils/response');

module.exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { name, address, totalSpaces, lat, lng, imgURL } = body;
    if (!name) return error('name requerido', 400);

    const parking = {
      id: uuidv4(),
      type: 'parking',
      name,
      address: address || null,
      totalSpaces: totalSpaces || 0,
      imgURL: imgURL || null,
      lat: lat || null,
      lng: lng || null,
      createdAt: new Date().toISOString()
    };

    await saveItem(parking);
    return created({ message: 'Estacionamiento registrado', parking });
  } catch (err) {
    console.error(err);
    return error('Error registrar estacionamiento');
  }
};
