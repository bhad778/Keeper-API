'use strict';
require('dotenv').config({ path: './variables.env' });

const connectToDatabase = require('./db');
const Employer = require('./models/Employer');
const Employee = require('./models/Employee');
const Job = require('./models/Job');

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
        .then(context.done(null, event))
        .catch((err) =>
          callback(null, {
            statusCode: err.statusCode || 500,
            headers: { 'Content-Type': 'text/plain' },
            body: 'Could not add the job.',
          })
        );
    });
  } else if (event.request.userAttributes.email === 'bhad7778@gmail.com') {
    connectToDatabase().then(() => {
      Employee.create(newUser)
        .then(context.done(null, event))
        .catch((err) =>
          callback(null, {
            statusCode: err.statusCode || 500,
            headers: { 'Content-Type': 'text/plain' },
            body: 'Could not create the employee.',
          })
        );
    });
  }
};

module.exports.addEmployer = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase().then(() => {
    Employer.create(JSON.parse(event.body))
      .then((employer) =>
        callback(null, {
          statusCode: 200,
          body: JSON.stringify(employer),
        })
      )
      .catch((err) =>
        callback(null, {
          statusCode: err.statusCode || 500,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Could not add the job.',
        })
      );
  });
};

module.exports.addEmployee = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase().then(() => {
    Employee.create(JSON.parse(event.body))
      .then((employee) =>
        callback(null, {
          statusCode: 200,
          body: JSON.stringify(employee),
        })
      )
      .catch((err) =>
        callback(null, {
          statusCode: err.statusCode || 500,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Could not create the employee.',
        })
      );
  });
};

module.exports.addJob = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase().then(() => {
    Job.create(JSON.parse(event.body))
      .then((job) =>
        callback(null, {
          statusCode: 200,
          body: JSON.stringify(job),
        })
      )
      .catch((err) =>
        callback(null, {
          statusCode: err.statusCode || 500,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Could not create the job.',
        })
      );
  });
};
