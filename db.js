const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
let isConnected;

const connectToDatabase = () => {
  if (isConnected) {
    console.log("=> using existing database connection");
    return Promise.resolve();
  }

  console.log("=> using new database connection");
  return mongoose
    .connect(
      "mongodb+srv://pare-mongodb-admin:Ululavit1@cluster0.p9k7w.mongodb.net/Pare?retryWrites=true&w=majority"
    )
    .then((db) => {
      isConnected = db.connections[0].readyState;
    });
};

module.exports = connectToDatabase;
