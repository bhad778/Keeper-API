const mongoose = require("mongoose");
const WebSocketConnectionSchema = new mongoose.Schema({
  connectionId: String,
});
module.exports = mongoose.model(
  "WebSocketConnections",
  WebSocketConnectionSchema
);
