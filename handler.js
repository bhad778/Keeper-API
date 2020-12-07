'use strict';
require('dotenv').config({ path: './variables.env' });

const connectToDatabase = require('./db');
const Job = require('./models/Job');

module.exports.addJob = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  console.log('inside addjob function');

  connectToDatabase().then(() => {
    console.log('before .then');
    Job.create(JSON.parse(event.body))
      .then(
        (job) =>
          callback(null, {
            statusCode: 200,
            body: JSON.stringify(job),
          }),
        console.log('after .then')
      )
      .catch((err) =>
        callback(null, {
          statusCode: err.statusCode || 500,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Could not create the job.',
        })
      );
    console.log('after it all');
  });

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
