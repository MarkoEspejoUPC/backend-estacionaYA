const { getById, updateItem, saveItem } = require('../../services/dynamoService');
const { createPaymentIntent } = require('../../services/stripeService');
const { success, error } = require('../../utils/response');

module.exports.handler = async (event) => {
  try {
    const { reservationId } = JSON.parse(event.body || '{}');
    if (!reservationId) return error('reservationId requerido', 400);

    // fetch reservation
    const reservation = await getById(reservationId);
    if (!reservation || reservation.type !== 'reservation') return error('Reserva no encontrada', 404);

    if (!reservation.arrivalTime) return error('Reserva no activada (no se detectó llegada)', 400);

    // calculate elapsed minutes
    const arrival = new Date(reservation.arrivalTime);
    const now = new Date();
    const ms = now - arrival;
    const minutes = Math.max(1, Math.ceil(ms / 60000)); // at least 1 minute
    const ratePerMinute = 0.05; // USD per minute - adapt to real pricing
    const amount = +(minutes * ratePerMinute).toFixed(2);

    // create payment intent for exit
    const intent = await createPaymentIntent(amount, 'usd', { reservationId, purpose: 'exit', minutes });

    // save a payment record item (optional)
    const paymentRecord = {
      id: `pay-${Date.now()}`,
      type: 'payment',
      reservationId,
      amount,
      minutes,
      paymentId: intent.id,
      createdAt: new Date().toISOString()
    };
    await saveItem(paymentRecord);

    return success({ clientSecret: intent.client_secret, amount, minutes });
  } catch (err) {
    console.error(err);
    return error('Error procesando pago de salida');
  }
};
