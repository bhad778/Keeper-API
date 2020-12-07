const mongoose = require('mongoose');
const JobSchema = new mongoose.Schema({
  title: String,
  description: String,
});
module.exports = mongoose.model('Jobs', JobSchema);
