const mongoose = require("mongoose");
const JobSchema = new mongoose.Schema({
  title: String,
  description: String,
  companyName: String,
  jobOverview: String,
  logo: String,
  compensationType: String,
  compensation: Array,
  experience: String,
  employment: String,
  education: String,
  responsibilities: Array,
  address: String,
  color: String,
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

JobSchema.index({ geoLocation: "2dsphere" });

module.exports = mongoose.model("Jobs", JobSchema);
