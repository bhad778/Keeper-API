const mongoose = require("mongoose");
const MessageSchema = new mongoose.Schema({
  sender: String,
  content: String,
  timeCreated: String,
  conversationId: String,
});
module.exports = mongoose.model("Messages", MessageSchema);
