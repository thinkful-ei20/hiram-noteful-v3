"use strict"

const express = require(`express`)
const router = express.Router()
const mongoose = require(`mongoose`)
const { Tag } = require(`../models/tag`)
const { Note } = require(`../models/note`)

/* ========== GET/READ ALL ITEM ========== */
router.get(`/`, (req, res, next) => {
  Tag.find()
    .sort(`name`)
    .then(results => {
      res.json(results)
    })
    .catch(next)
})

/* ========== GET/READ A SINGLE ITEM ========== */
router.get(`/:id`, (req, res, next) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error(`id is invalid`)
    err.status = 400
    return next(err)
  }

  Tag.findById(id)
    .then(result => {
      if (result) res.json(result)
      else next()
    })
    .catch(next)
})

/* ========== POST/CREATE AN ITEM ========== */
router.post(`/`, (req, res, next) => {
  if (!req.body.name) {
    const err = new Error(`Missing \`name\` in request body`)
    err.status = 400
    return next(err)
  }

  Tag.create({ name: req.body.name })
    .then(item => {
      res
        .location(`${req.originalUrl}/${item.id}`)
        .status(201)
        .json(item)
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error(`The tag name already exists`)
        err.status = 400
      }
      next(err)
    })
})

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put(`/:id`, (req, res, next) => {
  const { id } = req.params

  if (!req.body.name) {
    const err = new Error(`Missing \`name\` in request body`)
    err.status = 400
    return next(err)
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error(`id is invalid`)
    err.status = 400
    return next(err)
  }

  Tag.findByIdAndUpdate(id, { $set: { name: req.body.name } }, { new: true })
    .then(item => {
      if (item) res.json(item)
      else next()
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error(`The tag name already exists`)
        err.status = 400
      }
      next(err)
    })
})

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete(`/:id`, (req, res, next) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error(`id is invalid`)
    err.status = 400
    return next(err)
  }

  Note.updateMany({}, { $pull: { tags: id } })
    .then(() => {
      return Tag.findByIdAndRemove(id)
    })
    .then(() => {
      res.status(204).end()
    })
})

module.exports = router
