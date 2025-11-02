const AWS = require('aws-sdk');

const sqs = new AWS.SQS({ endpoint: 'http://127.0.0.1:4566', region: 'us-east-1' });
const QUEUE_URL = process.env.QUEUE_URL;

module.exports = {
  async sendMessage(message) {
    const params = {
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(message)
    };
    await sqs.sendMessage(params).promise();
  }
};
