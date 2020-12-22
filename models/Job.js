const mongoose = require('mongoose');
const JobSchema = new mongoose.Schema({
  title: String,
  description: String,
  address: String,
  color: String,
  geoLocation: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

JobSchema.index({ geoLocation: '2dsphere' });

module.exports = mongoose.model('Jobs', JobSchema);
