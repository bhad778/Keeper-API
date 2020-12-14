'use strict';
require('dotenv').config({ path: './variables.env' });

const connectToDatabase = require('./db');
const Employer = require('./models/Employer');
const Employee = require('./models/Employee');
const Job = require('./models/Job');
const axios = require('axios');

module.exports.addCognitoUserToMongoDb = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  let newUser = {
    email: event.request.userAttributes.email,
    phoneNumber: event.request.userAttributes.phone_number,
  };

  // change to if(userAttribute.type = "employee")
  // TODO fix error handling
  // TODO change trigger to post authentication
  if (event.request.userAttributes.email === 'bhad778@gmail.com') {
    connectToDatabase().then(() => {
      Employer.create(newUser)
        .then(() => callback(null, event))
        .catch((err) => callback(Error(err)));
    });
  } else if (event.request.userAttributes.email === 'bhad7778@gmail.com') {
    connectToDatabase().then(() => {
      Employee.create(newUser)
        .then(() => callback(null, event))
        .catch((err) => callback(Error(err)));
    });
  }
};

module.exports.addEmployer = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase().then(() => {
    Employer.create(JSON.parse(event.body))
      .then(() => callback(null, event))
      .catch((err) => callback(Error(err)));
  });
};

module.exports.addEmployee = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase().then(() => {
    Employee.create(JSON.parse(event.body))
      .then(() => callback(null, event))
      .catch((err) => callback(Error(err)));
  });
};

module.exports.addJob = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  var body = JSON.parse(event.body);
  var uriEncodedAddress = encodeURIComponent(body.address);

  await axios
    .get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${uriEncodedAddress}&key=AIzaSyDoUt-NQKYX-8sZU87ISTxNIg7DQijLZ7A`
    )
    .then((response) => {
      body.geoLocation = {
        type: 'Point',
        coordinates: [
          response.data.results[0].geometry.location.lng,
          response.data.results[0].geometry.location.lat,
        ],
      };
    });

  connectToDatabase().then(() => {
    Job.create(body)
      .then(() => callback(null, event))
      .catch((err) => callback(Error(err)));
  });
};

module.exports.getJobs = async (event) => {
  var body = JSON.parse(event.body);

  connectToDatabase().then(() => {
    Job.find({
      geoLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [body.lng, body.lat],
          },
          $maxDistance: body.distance,
          $minDistance: 1,
        },
      },
    })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => Error(err));
  });
};
