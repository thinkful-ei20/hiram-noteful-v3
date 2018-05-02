"use strict"

const express = require(`express`)
const morgan = require(`morgan`)
const mongoose = require(`mongoose`)

const { PORT, MONGODB_URI } = require(`./config`)

const notesRouter = require(`./routes/notes`)

// Create an Express application
const app = express()

// Log all requests. Skip logging during
app.use(
  morgan(process.env.NODE_ENV === `development` ? `dev` : `common`, {
    skip: () => process.env.NODE_ENV === `test`
  })
)

// Create a static webserver
app.use(express.static(`public`))

// Parse request body
app.use(express.json())

// Mount routers
app.use(`/api/notes`, notesRouter)

// Catch-all 404
app.use(function(req, res, next) {
  const err = new Error(`Not Found`)
  err.status = 404
  next(err)
})

// Catch-all Error handler
// Add NODE_ENV check to prevent stacktrace leak
app.use(function(err, req, res, next) {
  res.status(err.status || 500)
  res.json({
    message: err.message,
    error: app.get(`env`) === `development` ? err : {}
  })
})

let server

const runServer = (databaseURI, port = PORT) => {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseURI, err => {
      if (err) return reject(err)

      server = app
        .listen(port, () => {
          console.log(`Listening on port ${port}`)
          resolve()
        })
        .on(`error`, err => {
          mongoose.disconnect()
          reject(err)
        })
    })
  })
}

const closeServer = () => {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log(`Closing server`)
      server.close(err => {
        if (err) return reject(err)
        resolve()
      })
    })
  })
}

if (require.main === module) {
  runServer(MONGODB_URI).catch(err => console.error(err))
}

module.exports = { app, runServer, closeServer }
