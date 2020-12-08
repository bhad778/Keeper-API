const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
let isConnected;

module.exports = connectToDatabase = () => {
  if (isConnected) {
    console.log('=> using existing database connection');
    return Promise.resolve();
  }

  console.log('=> using new database connection');
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
      console.log("yay")
  });
  return mongoose.connect(process.env.DB, {useNewUrlParser: true}).then((db) => {
    isConnected = db.connections[0].readyState;
  });
};
