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

if (require.main === module) {
  app
    .listen(PORT, () => {
      console.info(`Listening on ${PORT}`)
    })
    .on(`error`, err => {
      console.error(err)
    })
}

module.exports = { app }
