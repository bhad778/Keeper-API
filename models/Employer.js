const mongoose = require('mongoose');
const EmployerSchema = new mongoose.Schema({
  email: String,
  phoneNumber: String,
  accountType: String,
  companyName: String,
  firstName: String,
  lastName: String,
});
module.exports = mongoose.model('Employers', EmployerSchema);
