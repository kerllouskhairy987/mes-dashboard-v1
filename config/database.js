const mongoose = require("mongoose");

/**
 * @desc    connect to database
 * @params  none
 * @return  none
 * @access  public
 */
const dbConnection = async () => {
  const conn = await mongoose.connect(process.env.DB_URI);
  console.log(
    `MongoDB connected: ${conn.connection.host} ${conn.connection.name}`,
  );
};

module.exports = dbConnection;
