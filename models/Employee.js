const mongoose = require("mongoose");
const EmployeeSchema = new mongoose.Schema({
  email: String,
  phoneNumber: String,
  firstName: String,
  lastName: String,
  accountType: String,
  city: String,
  geoLocation: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

EmployeeSchema.index({ geoLocation: "2dsphere" });

module.exports = mongoose.model("Employees", EmployeeSchema);
