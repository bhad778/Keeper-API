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
    firstName: event.request.userAttributes.name,
    lastName: event.request.userAttributes.family_name,
    accountType: event.request.userAttributes['custom:custom:accountType'],
    companyName: event.request.userAttributes['custom:custom:companyName'],
  };

  // change to if(userAttribute.type = "employee")
  // TODO fix error handling
  // TODO change trigger to post authentication
  if (newUser.accountType === 'employer') {
    connectToDatabase().then(() => {
      Employer.create(newUser)
        .then((res) => {
          callback(null, { statusCode: 200, body: JSON.stringify(res) });
        })
        .catch((err) => callback(new Error(err)));
    });
  } else if (newUser.accountType === 'employee') {
    connectToDatabase().then(() => {
      Employee.create(newUser)
        .then((res) => {
          callback(null, { statusCode: 200, body: JSON.stringify(res) });
        })
        .catch((err) => callback(new Error(err)));
    });
  }
};

module.exports.addEmployer = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase().then(() => {
    Employer.create(JSON.parse(event.body))
      .then((res) => {
        callback(null, { statusCode: 200, body: JSON.stringify(res) });
      })
      .catch((err) => callback(new Error(err)));
  });
};

module.exports.addEmployee = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase().then(() => {
    Employee.create(JSON.parse(event.body))
      .then((res) => {
        callback(null, { statusCode: 200, body: JSON.stringify(res) });
      })
      .catch((err) => callback(new Error(err)));
  });
};

module.exports.addJob = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  var body = JSON.parse(event.body);
  var uriEncodedAddress = encodeURIComponent(body.address);

  axios
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
    })
    .then(() => {
      connectToDatabase().then(() => {
        Job.create(body)
          .then((res) => {
            callback(null, { statusCode: 200, body: JSON.stringify(res) });
          })
          .catch((err) => callback(new Error(err)));
      });
    });
};

module.exports.getJobs = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
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
        callback(null, { statusCode: 200, body: JSON.stringify(res) });
      })
      .catch((err) => {
        console.log(err);
        callback(new Error(err));
      });
  });
};
