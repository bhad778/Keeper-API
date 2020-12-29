const mongoose = require("mongoose");
const ConversationSchema = new mongoose.Schema({
  participants: Array,
});
module.exports = mongoose.model("Conversations", ConversationSchema);
