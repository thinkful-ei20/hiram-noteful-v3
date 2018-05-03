"use strict"

const express = require(`express`)
const router = express.Router()
const mongoose = require(`mongoose`)
const { Note } = require(`../models/note`)

/* ========== GET/READ ALL ITEM ========== */
router.get(`/`, (req, res, next) => {
  const { searchTerm, folderId } = req.query

  let filter = {}
  if (searchTerm) {
    const re = new RegExp(searchTerm, `i`)
    filter = { $or: [{ title: { $regex: re } }, { content: { $regex: re } }] }
  }
  if (folderId) filter.folderId = folderId

  Note.find(filter)
    .sort(`createdAt`)
    .then(results => {
      res.json(results)
    })
    .catch(next)
})

/* ========== GET/READ A SINGLE ITEM ========== */
router.get(`/:id`, (req, res, next) => {
  const { id } = req.params

  Note.findById(id)
    .then(result => {
      if (result) res.json(result)
      else next()
    })
    .catch(next)
})

/* ========== POST/CREATE AN ITEM ========== */
router.post(`/`, (req, res, next) => {
  let newItem = {}

  const fields = [`title`, `content`, `folderId`]
  for (const field of fields) {
    if (field in req.body) newItem[field] = req.body[field]
  }

  if (!newItem.title) {
    const err = new Error(`Missing \`title\` in request body`)
    err.status = 400
    return next(err)
  }

  if (newItem.folderId && !mongoose.Types.ObjectId(newItem.folderId)) {
    const err = new Error(`Invalid \`folderId\` in request body`)
    err.status = 400
    return next(err)
  }

  Note.create(newItem)
    .then(note => {
      res
        .location(`${req.originalUrl}/${note.id}`)
        .status(201)
        .json(note)
    })
    .catch(next)
})

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put(`/:id`, (req, res, next) => {
  const { id } = req.params

  const updateObj = {}
  const updatableFields = [`title`, `content`]

  for (const field of updatableFields) {
    if (field in req.body) updateObj[field] = req.body[field]
  }

  if (newItem.folderId && !mongoose.Types.ObjectId(newItem.folderId)) {
    const err = new Error(`Invalid \`folderId\` in request body`)
    err.status = 400
    return next(err)
  }

  Note.findByIdAndUpdate(id, { $set: updateObj }, { new: true })
    .then(note => {
      res.json(note)
    })
    .catch(next)
})

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete(`/:id`, (req, res, next) => {
  const { id } = req.params

  Note.findByIdAndRemove(id)
    .then(note => res.status(204).end())
    .catch(next)
})

module.exports = router
