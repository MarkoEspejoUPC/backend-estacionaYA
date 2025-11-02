const AWS = require('aws-sdk');

const options = {
  region: 'us-east-1',
  endpoint: process.env.LOCALSTACK_ENDPOINT || 'http://127.0.0.1:4566'
};

AWS.config.update({ region: options.region });

const dynamo = new AWS.DynamoDB.DocumentClient({ endpoint: options.endpoint });

const TABLE = process.env.DYNAMO_TABLE;

module.exports = {
  async getAll() {
  const params = { TableName: TABLE };
  const data = await dynamo.scan(params).promise();
  return data.Items || [];
  },

  async saveItem(item) {
    console.log("Saving item in table:", TABLE);
    const params = { TableName: TABLE, Item: item };
    await dynamo.put(params).promise();
    return item;
  },

  async getById(id) {
    const params = { TableName: TABLE, Key: { id } };
    const res = await dynamo.get(params).promise();
    return res.Item;
  },

  async queryByAttribute(attrName, attrValue) {
    const params = {
      TableName: TABLE,
      FilterExpression: '#k = :v',
      ExpressionAttributeNames: { '#k': attrName },
      ExpressionAttributeValues: { ':v': attrValue }
    };
    const res = await dynamo.scan(params).promise();
    return res.Items || [];
  },

  async scanAll() {
    const res = await dynamo.scan({ TableName: TABLE }).promise();
    return res.Items || [];
  },

  async updateItem(id, updates) {
    const expr = [];
    const names = {};
    const values = {};
    let idx = 0;
    for (const k of Object.keys(updates)) {
      idx++;
      expr.push(`#k${idx} = :v${idx}`);
      names[`#k${idx}`] = k;
      values[`:v${idx}`] = updates[k];
    }
    const params = {
      TableName: TABLE,
      Key: { id },
      UpdateExpression: 'SET ' + expr.join(', '),
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: 'ALL_NEW'
    };
    const res = await dynamo.update(params).promise();
    return res.Attributes;
  },

  async findReservationsBySpaceAndTime(spaceId, reservedForIso) {
    // simple scan that returns any reservation with same spaceId and state PENDING or ACTIVE and same reservedFor
    const params = {
      TableName: TABLE,
      FilterExpression: 'spaceId = :s AND (state = :p OR state = :a) AND reservedFor = :r',
      ExpressionAttributeValues: {
        ':s': spaceId,
        ':p': 'PENDING',
        ':a': 'ACTIVE',
        ':r': reservedForIso
      }
    };
    const res = await dynamo.scan(params).promise();
    return res.Items || [];
  },

  async findActiveReservationById(id) {
    const item = await module.exports.getById(id);
    if (!item) return null;
    if (item.type && (item.type === 'reservation')) return item;
    return null;
  }
  
};
