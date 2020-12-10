'use strict';
require('dotenv').config({ path: './variables.env' });

const connectToDatabase = require('./db');
const Employer = require('./models/Employer');
const Employee = require('./models/Employee');
const Job = require('./models/Job');

module.exports.addCognitoUserToMongoDb = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  let newUser = {
    email: event.request.userAttributes.email,
    phoneNumber: event.request.userAttributes.phone_number,
  };

  // Send post authentication data to Cloudwatch logs
  console.log('event.body =', event.body);
  console.log('event =', event);
  console.log('event.request = ', event.request);
  console.log(
    'event.request.userAttributes.email= ',
    event.request.userAttributes.email
  );
  console.log('context= ', context);
  console.log('callback= ', callback);

  if (event.request.userAttributes.email === 'bhad778@gmail.com') {
    await this.addEmployer(event, context, callback);
    context.done(null, event);
  } else if (event.email === 'employe@employee.com') {
    this.addEmployee(event, context, callback);
  } else {
    this.addEmployee(event, context, callback);
  }
  context.done(null, event);
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
