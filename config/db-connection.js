const mongoose = require("mongoose");
const debug = require('debug')('hamburguesas-ibeth-rest:server');

function handleDbConnectionError(error) {
  throw error;
}

(async function connect() {
  try {
    mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    mongoose.set('useCreateIndex', true);
    debug("Database connected");
  } catch (error) {
    handleDbConnectionError(error);
  }
})();
