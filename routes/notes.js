"use strict"

const express = require(`express`)
const router = express.Router()
const mongoose = require(`mongoose`)
const { Note } = require(`../models/note`)

/* ========== GET/READ ALL ITEM ========== */
router.get(`/`, (req, res, next) => {
  const { searchTerm } = req.query

  let filter = {}
  if (searchTerm) filter.title = { $regex: new RegExp(searchTerm, `i`) }

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
  console.log(`Update a Note`)
  res.json({ id: 1, title: `Updated Temp 1` })
})

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete(`/:id`, (req, res, next) => {
  console.log(`Delete a Note`)
  res.status(204).end()
})

module.exports = router
