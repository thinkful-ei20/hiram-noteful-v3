"use strict"

exports.PORT = process.env.PORT || 8080
exports.MONGODB_URI = process.env.MONGODB_URI || `mongodb://localhost/noteful`
exports.TEST_DATABASE_URI =
  process.env.TEST_DATABASE_URI || `mongodb://localhost/noteful-test`
