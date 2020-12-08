const mongoose = require('mongoose');
const EmployerSchema = new mongoose.Schema({
  email: String,
  phoneNumber: String,
});
module.exports = mongoose.model('Employers', EmployerSchema);
