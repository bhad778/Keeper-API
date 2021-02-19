"use strict";
require("dotenv").config({ path: "./variables.env" });
require("./patch.js");

const connectToDatabase = require("./db");
const Conversation = require("./models/Conversation");
const Message = require("./models/Message");
const WebSocketConnection = require("./models/WebSocketConnection");
const AWS = require("aws-sdk");

String.prototype.toObjectId = () => {
  const ObjectId = require("mongoose").Types.ObjectId;
  return new ObjectId(this.toString());
};

module.exports.addConversation = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase().then(() => {
    Conversation.create(JSON.parse(event.body))
      .then((res) => {
        callback(null, { statusCode: 200, body: JSON.stringify(res) });
      })
      .catch((err) => callback(new Error(err)));
  });
};

//TODO: make default websocket handler

// you do this call to get the connectionId of the other person in the conversation,
// it takes a conversationId to find that conversation and TODO: will then have to
// take in an email of the current user to grab the other connectionId, as to not grab their own
module.exports.getConversation = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const body = JSON.parse(event.body);

  connectToDatabase().then(() => {
    Conversation.find({ id: body.conversationId.toObjectId })
      .then((res) => {
        callback(null, {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify(res),
        });
      })
      .catch((err) => callback(new Error(err)));
  });
};

// takes a conversationId and finds all messages with that conversationId
module.exports.getConversationMessages = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const body = JSON.parse(event.body);

  connectToDatabase().then(() => {
    Message.find({ id: body.conversationId.toObjectId })
      .then((res) => {
        callback(null, {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify(res),
        });
      })
      .catch((err) => {
        console.log(err);
        callback(new Error(err));
      });
  });
};

module.exports.addMessage = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase().then(() => {
    Message.create(JSON.parse(event.body))
      .then((res) => {
        callback(null, {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify(res),
        });
      })
      .catch((err) => callback(new Error(err)));
  });
};

// is called anytime a user lands on the messages page
// this call will have to add the connectionId to that participant in the conversation
// so that the other user can grab it to send messages to them
module.exports.wsConnectHandler = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase().then(() => {
    WebSocketConnection.create({
      connectionId: event.requestContext.connectionId,
    })
      .then((res) => {
        callback(null, { statusCode: 200, body: JSON.stringify(res) });
      })
      .catch((err) => callback(new Error(err)));
  });
};

// this is called after a connection has been idol for a certain amount of time
module.exports.wsDisconnectHandler = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const body = JSON.parse(event.body);

  connectToDatabase().then(() => {
    WebSocketConnection.find({ connectionId: body.connectionId })
      .deleteOne()
      .then((res) => {
        callback(null, { statusCode: 200, body: JSON.stringify(res) });
      })
      .catch((err) => callback(new Error(err)));
  });
};

// this is called when the frontend calls webSocket.send
// right now websocketConnect is putting that connectionId
// into the websocketConnection table, and then this function is
// taking in just a message and sending that message to every connectionId
// that is currently alive, i.e. every connectionId in the WebSocketConnection table
// but this is incorrect, we will eventuall have websocketConnect funtion put
// the connectionId on the participant of that converstaion in the conversation table,
// and then pass that connectionId into this function to then only send it to that connectionId,
// i.e only the other participant in that conversation, instead of every connectionId
module.exports.webSocketOnMessageHandler = (event, context, callback) => {
  let send = undefined;
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint:
      event.requestContext.domainName + "/" + event.requestContext.stage,
  });
  send = async (connectionId, data) => {
    await apigwManagementApi
      .postToConnection({ ConnectionId: connectionId, Data: data })
      .promise();
  };
  let message = JSON.parse(event.body).message;
  connectToDatabase().then(() => {
    WebSocketConnection.find()
      .then((data) => {
        data.forEach((connection) => {
          send(connection.connectionId, message);
        });
      })
      .then(() => {
        callback(null, { statusCode: 200 });
      })
      .catch((err) => callback(new Error(err)));
  });
};
