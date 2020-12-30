const mongoose = require("mongoose");
const MessageSchema = new mongoose.Schema({
  user: Object,
  text: String,
  createdAt: Date,
  conversationId: String,
});
module.exports = mongoose.model("Messages", MessageSchema);
