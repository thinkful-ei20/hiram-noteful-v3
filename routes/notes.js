"use strict"

const express = require(`express`)
const router = express.Router()
const mongoose = require(`mongoose`)
const { Note } = require(`../models/note`)

/* ========== GET/READ ALL ITEM ========== */
router.get(`/`, (req, res, next) => {
  const { searchTerm } = req.query

  let filter = {}
  if (searchTerm) {
    const re = new RegExp(searchTerm, `i`)
    filter = { $or: [{ title: { $regex: re } }, { content: { $regex: re } }] }
  }

  Note.find(filter)
    .sort(`created`)
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

  const fields = [`title`, `content`]
  for (const field of fields) {
    if (field in req.body) newItem[field] = req.body[field]
  }

  if (!newItem.title) {
    const err = new Error(`'title' field missing`)
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

  Note.findByIdAndUpdate(id, { $set: updateObj })
    .then(note => res.status(204).end())
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
