"use strict";
require("dotenv").config({ path: "../variables.env" });

const connectToDatabase = require("../db");
const Job = require("../models/Job");

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
    .all([
      axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${uriEncodedAddress}&key=AIzaSyB0GiWadL-4lSXe7PNO9Vr47iTC4t7C94I`
      ),
      axios.post("http://localhost:3000/dev/imageUpload", {
        "mime": "image/jpeg",
        "image":
          "data:image/jpeg;base64,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",
      }),
    ])
    .then((res) => {
      var geoLocation = res[0].data;
      var jobImageUrl = res[1].data.jobImageURL;

      body.geoLocation = {
        type: "Point",
        coordinates: [
          geoLocation.results[0].geometry.location.lng,
          geoLocation.results[0].geometry.location.lat,
        ],
      };

      body.jobImageUrl = jobImageUrl;

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
