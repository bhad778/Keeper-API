const mongoose = require("mongoose");
const EmployeeSchema = new mongoose.Schema({
  email: String,
  phoneNumber: String,
  firstName: String,
  lastName: String,
  accountType: String,
});
module.exports = mongoose.model("Employees", EmployeeSchema);
