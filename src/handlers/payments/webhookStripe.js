const rawBody = require('raw-body');
const { updateItem, getById, saveItem } = require('../../services/dynamoService');
const { success, error } = require('../../utils/response');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET || 'sk_test_xxx');

module.exports.handler = async (event) => {
  try {
    // serverless-offline gives body as string; signature header in event.headers['stripe-signature']
    const sig = (event.headers && (event.headers['stripe-signature'] || event.headers['Stripe-Signature'])) || null;
    const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET || null;

    let stripeEvent;
    if (endpointSecret && sig) {
      // verify signature -- event.body must be raw; serverless may parse it; for local dev you can skip verification
      try {
        stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
      } catch (err) {
        console.error('Firma webhook inválida', err.message);
        return error('Firma webhook inválida', 400);
      }
    } else {
      // No verification; parse body
      stripeEvent = JSON.parse(event.body);
    }

    // handle event types
    if (stripeEvent.type === 'payment_intent.succeeded') {
      const intent = stripeEvent.data.object;
      const metadata = intent.metadata || {};
      const reservationId = metadata.reservationId;
      const purpose = metadata.purpose || 'unknown';

      if (purpose === 'reserve' && reservationId) {
        // mark reservation as RESERVED (paid)
        await updateItem(reservationId, { state: 'RESERVED', paymentId: intent.id });
        console.log('Reserva pagada y confirmada:', reservationId);
      } else if (purpose === 'exit' && reservationId) {
        // complete reservation
        await updateItem(reservationId, { state: 'COMPLETED' });
        console.log('Pago de salida completado para:', reservationId);
      } else {
        console.log('PaymentIntent succeeded, sin metadata manejable', metadata);
      }
    }

    // return 200
    return success({ received: true });
  } catch (err) {
    console.error('Error webhook', err);
    return error('Error webhook', 500);
  }
};
