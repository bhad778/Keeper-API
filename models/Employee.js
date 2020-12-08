const mongoose = require('mongoose');
const EmployeeSchema = new mongoose.Schema({
  email: String,
  phoneNumber: String,
});
module.exports = mongoose.model('Employees', EmployeeSchema);
