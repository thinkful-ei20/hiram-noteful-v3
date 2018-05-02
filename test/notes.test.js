const chai = require(`chai`)
const chaiHttp = require(`chai-http`)
const mongoose = require(`mongoose`)

const { Note } = require(`../models/note`)
const seedNotes = require(`../db/seed/notes`)

const { app } = require(`../server`)
const { TEST_DATABASE_URI } = require(`../config`)

const expect = chai.expect
chai.use(chaiHttp)

const seedDatabase = () => {
  return Note.insertMany(seedNotes).then(() => Note.createIndexes())
}

const dropDatabase = () => {
  return mongoose.connection.db.dropDatabase()
}

describe(`Notes endpoints`, () => {
  before(() => {
    return mongoose.connect(TEST_DATABASE_URI)
  })

  beforeEach(() => {
    return seedDatabase()
  })

  afterEach(() => {
    return dropDatabase()
  })

  after(() => {
    return mongoose.disconnect()
  })

  describe(`GET /api/notes`, () => {
    it(`should return all notes`, () => {
      let count
      return Note.count()
        .then(_count => {
          count = _count
          return chai.request(app).get(`/api/notes`)
        })
        .then(res => {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.be.a(`array`)
          expect(res.body).to.have.length(count)
        })
    })

    it(`should return a list with the correct fields`, () => {
      return chai
        .request(app)
        .get(`/api/notes`)
        .then(res => {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.be.a(`array`)
          res.body.forEach(function(item) {
            expect(item).to.be.a(`object`)
            expect(item).to.include.keys(
              `id`,
              `title`,
              `content`,
              `createdAt`,
              `updatedAt`
            )
          })
        })
    })

    it(`should return correct search results for a valid query`, () => {
      let res
      return chai
        .request(app)
        .get(`/api/notes?searchTerm=car`)
        .then(function(_res) {
          res = _res
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.be.a(`array`)
          expect(res.body).to.have.length(1)
          expect(res.body[0]).to.be.an(`object`)
          return Note.find({ title: /(car)/i })
        })
        .then(data => {
          expect(res.body[0].id).to.eq(data[0].id)
        })
    })

    it(`should return an empty array for an incorrect query`, () => {
      return chai
        .request(app)
        .get(`/api/notes?searchTerm=Not%20a%20Valid%20Search`)
        .then(res => {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.be.a(`array`)
          expect(res.body).to.have.length(0)
        })
    })
  })

  describe(`GET /api/notes/:id`, () => {
    it(`should return correct notes`, () => {
      const id = `000000000000000000000003`
      let res
      return chai
        .request(app)
        .get(`/api/notes/${id}`)
        .then(_res => {
          res = _res
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.be.an(`object`)
          expect(res.body).to.include.keys(
            `id`,
            `title`,
            `content`,
            `createdAt`,
            `updatedAt`
          )
          return Note.findById(id)
        })
        .then(note => {
          expect(res.body.id).to.eq(note.id)
          expect(res.body.title).to.eq(note.title)
        })
    })

    it(`should respond with a 404 for an invalid id`, () => {
      return chai
        .request(app)
        .get(`/DOES/NOT/EXIST`)
        .then(res => {
          expect(res).to.have.status(404)
        })
    })
  })

  describe(`POST /api/notes`, () => {
    it(`should create and return a new item when provided valid data`, () => {
      const newItem = {
        title: `The best article about cats ever!`,
        content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...`
      }
      let body
      return chai
        .request(app)
        .post(`/api/notes`)
        .send(newItem)
        .then(res => {
          body = res.body
          expect(res).to.have.status(201)
          expect(res).to.be.json
          expect(res.body).to.be.a(`object`)
          expect(res.body).to.include.keys(
            `id`,
            `title`,
            `content`,
            `createdAt`,
            `updatedAt`
          )
          expect(res).to.have.header(`location`)
          return Note.findById(body.id)
        })
        .then(data => {
          expect(body.title).to.eq(data.title)
          expect(body.content).to.eq(data.content)
        })
    })

    it(`should return an error when missing "title" field`, () => {
      const newItem = {
        foo: `bar`
      }
      return chai
        .request(app)
        .post(`/api/notes`)
        .send(newItem)
        .then(res => {
          expect(res).to.have.status(400)
          expect(res).to.be.json
          expect(res.body).to.be.a(`object`)
          expect(res.body.message).to.eq(`Missing \`title\` in request body`)
        })
    })
  })

  describe(`PUT /api/notes/:id`, () => {
    it(`should update the note`, () => {
      const updateItem = {
        title: `What about dogs?!`,
        content: `woof woof`
      }
      let id = `000000000000000000000003`
      let body
      return chai
        .request(app)
        .put(`/api/notes/${id}`)
        .send(updateItem)
        .then(res => {
          body = res.body
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.be.a(`object`)
          expect(res.body).to.include.keys(`title`, `content`)
          return Note.findById(id)
        })
        .then(note => {
          expect(body.title).to.eq(note.title)
          expect(body.content).to.eq(note.content)
        })
    })

    it(`should respond with a 404 for an invalid id`, () => {
      const updateItem = {
        title: `What about dogs?!`,
        content: `woof woof`
      }
      return chai
        .request(app)
        .put(`/DOES/NOT/EXIST`)
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(404)
        })
    })
  })

  describe(`DELETE /api/notes/:id`, () => {
    it(`should delete an item by id`, () => {
      const id = `000000000000000000000003`
      return chai
        .request(app)
        .delete(`/api/notes/${id}`)
        .then(res => {
          expect(res).to.have.status(204)
          return Note.findById(id)
        })
        .then(note => {
          expect(note).to.eq(null)
        })
    })
  })
})
