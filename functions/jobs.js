"use strict";
require("dotenv").config({ path: "./variables.env" });
require("./patch.js");

const connectToDatabase = require("./db");
const Job = require("./models/Job");

const axios = require("axios");

String.prototype.toObjectId = () => {
  const ObjectId = require("mongoose").Types.ObjectId;
  return new ObjectId(this.toString());
};

// TODO must take in how many jobs have already been created, then
// determine from that what color should be added to the job
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
        type: "Point",
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
            callback(null, {
              statusCode: 200,
              headers: {
                "Access-Control-Allow-Origin": "*",
              },
              body: JSON.stringify(res),
            });
          })
          .catch((err) => callback(new Error(err)));
      });
    });
};

module.exports.editJob = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  var body = JSON.parse(event.body);
  var id = body._id;
  delete body._id;
  var uriEncodedAddress = encodeURIComponent(body.address);

  // TODO could change it so it doesnt get coordinates from address unless address is different
  axios
    .get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${uriEncodedAddress}&key=AIzaSyDoUt-NQKYX-8sZU87ISTxNIg7DQijLZ7A`
    )
    .then((response) => {
      body.geoLocation = {
        type: "Point",
        coordinates: [
          response.data.results[0].geometry.location.lng,
          response.data.results[0].geometry.location.lat,
        ],
      };
    })
    .then(() => {
      connectToDatabase().then(() => {
        Job.updateOne(
          { id: id.toObjectId },
          body,
          { multi: false },
          function (err) {
            if (err) {
              callback(new Error(err));
            }
          }
        )
          .then((res) => {
            callback(null, {
              statusCode: 200,
              headers: {
                "Access-Control-Allow-Origin": "*",
              },
              body: JSON.stringify(res),
            });
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
            type: "Point",
            coordinates: [body.lng, body.lat],
          },
          $maxDistance: body.distance,
          $minDistance: 1,
        },
      },
    })
      .then((res) => {
        callback(null, {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*", // Required for CORS support to work
          },
          body: JSON.stringify(res),
        });
      })
      .catch((err) => {
        console.log(err);
        callback(new Error(err));
      });
  });
};

module.exports.getEmployersJobs = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  var body = JSON.parse(event.body);

  connectToDatabase().then(() => {
    Job.find({ email: body.email })
      .then((res) => {
        callback(null, {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*", // Required for CORS support to work
          },
          body: JSON.stringify(res),
        });
      })
      .catch((err) => {
        console.log(err);
        callback(new Error(err));
      });
  });
};
