const { v4: uuidv4 } = require('uuid');
const { saveItem, findReservationsBySpaceAndTime, scanAll } = require('../../services/dynamoService');
const { createPaymentIntent } = require('../../services/stripeService');
const { success, error, created } = require('../../utils/response');

module.exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { userId, parkingId, spaceId, reservedFor, amount } = body;
    if (!userId || !parkingId || !spaceId || !reservedFor || !amount) return error('Faltan campos', 400);

    // Conflict check: same space & same reservedFor with PENDING/ACTIVE
    const conflicts = await findReservationsBySpaceAndTime(spaceId, reservedFor);
    if (conflicts && conflicts.length > 0) return error('Espacio ya reservado para ese horario', 409);

    const reservationId = uuidv4();
    const now = new Date();
    const reservation = {
      id: reservationId,
      type: 'reservation',
      userId,
      parkingId,
      spaceId,
      reservedFor,
      state: 'PENDING',
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 15 * 60000).toISOString(), // 15 min
      amount,
      paymentId: null
    };

    // create stripe payment intent with metadata to identify reservation
    const currency = 'PEN'; // use usd for test; adapt if you configure PEN
    const intent = uuidv4();//await createPaymentIntent(amount, currency, { reservationId, purpose: 'reserve' });

    reservation.paymentId = intent.id;

    // store reservation (PENDING)
    await saveItem(reservation);

    // return client_secret to frontend to complete payment
    return created({ reservationId, clientSecret: intent.client_secret, expiresAt: reservation.expiresAt });
  } catch (err) {
    console.error(err);
    return error('Error crear reserva');
  }
};
