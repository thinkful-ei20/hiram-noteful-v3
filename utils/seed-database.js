const mongoose = require(`mongoose`)

const { MONGODB_URI } = require(`../config`)
const { Note } = require(`../models/note`)
const { Folder } = require(`../models/folder`)
const { Tag } = require(`../models/tag`)

const seedNotes = require(`../db/seed/notes`)
const seedFolders = require(`../db/seed/folders`)
const seedTags = require(`../db/seed/tags.json`)

mongoose
  .connect(MONGODB_URI)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      Note.insertMany(seedNotes),
      Folder.insertMany(seedFolders),
      Tag.insertMany(seedTags),
      Folder.createIndexes(),
      Tag.createIndexes()
    ])
  })
  .then(([noteResult, folderResult, tagResult]) => {
    console.info(`Inserted ${noteResult.length} Notes`)
    console.info(`Inserted ${folderResult.length} Folders`)
    console.info(`Inserted ${tagResult.length} Tags`)
  })
  .then(() => mongoose.disconnect())
  .catch(console.error)
