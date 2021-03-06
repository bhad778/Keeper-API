"use strict";
require("dotenv").config({ path: "../variables.env" });

const connectToDatabase = require("../db");
const Employer = require("../models/Employer");
const Employee = require("../models/Employee");
const axios = require("axios");

String.prototype.toObjectId = () => {
  const ObjectId = require("mongoose").Types.ObjectId;
  return new ObjectId(this.toString());
};

// start employer/employee shared functions
module.exports.getMatches = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const body = JSON.parse(event.body);

  connectToDatabase().then(() => {
    if (body.accountType == "employee") {
      Employer.find({
        "_id": {
          $in: body.matches,
        },
      })
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
    } else if (body.accountType === "employer") {
      Employee.find({
        "_id": {
          $in: body.matches,
        },
      })
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
    }
  });
};

module.exports.addCognitoUserToMongoDb = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  let newUser = {
    email: event.request.userAttributes.email,
    phoneNumber: event.request.userAttributes.phone_number,
    firstName: event.request.userAttributes.name,
    lastName: event.request.userAttributes.family_name,
    accountType: event.request.userAttributes["custom:custom:accountType"],
    companyName: event.request.userAttributes["custom:custom:companyName"],
  };

  // TODO fix error handling
  // TODO change trigger to post authentication
  if (newUser.accountType == "employer") {
    connectToDatabase().then(() => {
      Employer.create(newUser)
        .then((res) => {
          callback(null, { statusCode: 200, body: JSON.stringify(res) });
        })
        .catch((err) => callback(new Error(err)));
    });
  } else if (newUser.accountType == "employee") {
    connectToDatabase().then(() => {
      Employee.create(newUser)
        .then((res) => {
          callback(null, { statusCode: 200, body: JSON.stringify(res) });
        })
        .catch((err) => callback(new Error(err)));
    });
  }
};

// happens when two people match, takes two whole user objects which
// then it sticks the id, into the matches array of the respective participants
module.exports.match = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  var body = JSON.parse(event.body);

  var employeeId;
  var employerId;
  var savedEmployee;
  let savedEmployer;

  body.map((user) => {
    if (user.accountType === "employee") {
      employeeId = user._id;
    }
    if (user.accountType === "employer") {
      employerId = user._id;
    }
  });

  connectToDatabase().then(async () => {
    try {
      var employee = await Employee.findOne({
        id: employeeId.toObjectId,
      }).exec();
    } catch (err) {
      err.stack;
      callback(new Error(err));
    }

    try {
      var employer = await Employer.findOne({
        id: employerId.toObjectId,
      }).exec();
    } catch (err) {
      err.stack;
      callback(new Error(err));
    }

    // must markModified because if you .save() after just pushing to an array
    // .save() wont recognize that theres a difference so wont save anything
    employee._doc.matches.push(employerId);
    employee.markModified("matches");
    employer._doc.matches.push(employeeId);
    employer.markModified("matches");

    try {
      savedEmployee = await employee.save();
    } catch (err) {
      callback(new Error(err));
    }

    try {
      savedEmployer = await employer.save();
    } catch (err) {
      callback(new Error(err));
    }

    // will only make it here if there have been no errors
    callback(null, {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ savedEmployee, savedEmployer }),
    });
  });
};
//end shared functions

//employer functions
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

// the employee/employer object is going to have most data needed
// for the whole app, so this is used on app load for matches, settings, etc.
module.exports.getEmployer = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const body = JSON.parse(event.body);

  connectToDatabase().then(() => {
    Employer.find({ email: body.email })
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
};

// gets all data needs for employer for using app
module.exports.getEmployerData = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const body = JSON.parse(event.body);

  connectToDatabase().then(() => {
    var user;
    Employer.find({ email: body.email })
      .then((res) => {
        user = res[0]._doc;
        axios
          .all([
            axios.post(
              "https://mzl4y00fba.execute-api.us-east-1.amazonaws.com/dev/getMatches",
              {
                "accountType": "employer",
                "matches": res[0]._doc.matches,
              }
            ),
            axios.post(
              "https://mzl4y00fba.execute-api.us-east-1.amazonaws.com/dev/getEmployersJobs",
              {
                "email": body.email,
              }
            ),
          ])
          .then((res) => {
            var returnArray = {
              loggedInUserData: user,
              matchesData: res[0].data,
              employersJobs: res[1].data,
            };
            callback(null, {
              statusCode: 200,
              headers: {
                "Access-Control-Allow-Origin": "*",
              },
              body: JSON.stringify(returnArray),
            });
          });
      })
      .catch((err) => callback(new Error(err)));
  });
};

module.exports.getEmployeesForSwiping = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  var body = JSON.parse(event.body);

  var filters = [];

  if (body.filters) {
    body.filtersArray.map((item) => {
      var key = Object.keys(item);
      var object = {
        [key[0]]: item[key],
      };
      filters.push(object);
    });
  }

  var alreadySwipedOnIds = [];

  body.employeesAlreadySwipedOn.map((item) => {
    alreadySwipedOnIds.push(item.employeeId);
  });

  connectToDatabase().then(() => {
    Employee.find({
      $and: [
        {
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
        },
        { _id: { $nin: alreadySwipedOnIds } },
        ...filters,
      ],
    })
      // .limit(2)
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
//end employer functions

// employee functions

module.exports.addEmployee = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  var body = JSON.parse(event.body);
  var uriEncodedCity = encodeURIComponent(body.city);

  axios
    .get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${uriEncodedCity}&key=AIzaSyB0GiWadL-4lSXe7PNO9Vr47iTC4t7C94I`
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
        Employee.create(body)
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

// the employee/employer object is going to have most data needed
// for the whole app, so this is used on app load for matches, settings, etc.
module.exports.getEmployee = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const body = JSON.parse(event.body);

  connectToDatabase().then(() => {
    Employee.find({ email: body.email })
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
};
//end employee functions
