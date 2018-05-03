"use strict"

const express = require(`express`)
const router = express.Router()
const mongoose = require(`mongoose`)
const { Folder } = require(`../models/folder`)
const { Note } = require(`../models/note`)

/* ========== GET/READ ALL ITEM ========== */
router.get(`/`, (req, res, next) => {
  Folder.find()
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

  Folder.findById(id)
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

  Folder.create({ name: req.body.name })
    .then(item => {
      res
        .location(`${req.originalUrl}/${item.id}`)
        .status(201)
        .json(item)
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error(`The folder name already exists`)
        err.status = 400
      }
      next(err)
    })
})

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put(`/:id`, (req, res, next) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error(`id is invalid`)
    err.status = 400
    return next(err)
  }

  Folder.findByIdAndUpdate(id, { $set: { name: req.body.name } }, { new: true })
    .then(item => {
      res.json(item)
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error(`The folder name already exists`)
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

  Note.updateMany({ folderId: id }, { $unset: { folderId: `` } })
    .then(() => Folder.findByIdAndRemove(id))
    .then(() => res.status(204).end())
    .catch(next)
})

module.exports = router
