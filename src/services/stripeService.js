const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET || 'sk_test_XXXXXXXXXXXX');

module.exports = {
  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    // amount expected in decimal, we convert to cents
    const cents = Math.round(amount * 100);
    const intent = await stripe.paymentIntents.create({
      amount: cents,
      currency,
      payment_method_types: ['card'],
      metadata
    });
    return intent;
  },

  // For verifying webhook signature, if you have endpoint secret:
  getEventFromWebhook(body, sigHeader, endpointSecret) {
    try {
      return stripe.webhooks.constructEvent(body, sigHeader, endpointSecret);
    } catch (err) {
      throw err;
    }
  }
};
