const mongoClient = require("mongodb").MongoClient;
require("dotenv").config();
let state = {
  db: null,
};
module.exports = {
  connect: (done) => {
    let url = process.env.MONGO_URI;
    let database = "ChatsApp";
    mongoClient.connect(url, (err, data) => {
      if (!err) {
        state.db = data.db(database);
        done();
      } else {
        done(err);
      }
    });
  },
  get: () => {
    return state.db;
  },
};
