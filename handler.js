'use strict';
require('dotenv').config({ path: './variables.env' });

const connectToDatabase = require('./db');
const Employer = require('./models/Employer');
const Employee = require('./models/Employee');
const Job = require('./models/Job');

module.exports.addCognitoUserToMongoDb = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.email === 'bhad778@gmail.com') {
    this.addEmployer(event, context, callback);
  } else if (event.email === 'employe@employee.com') {
    this.addEmployee(event, context, callback);
  }
  context.done(null, 'ok');
};

module.exports.addEmployer = async (event, context, callback) => {
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
          body: 'Could not create the employer.',
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
