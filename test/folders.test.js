const mongoose = require(`mongoose`)
const chai = require(`chai`)
const chaiHttp = require(`chai-http`)

const { Folder } = require(`../models/folder`)
const seedFolders = require(`../db/seed/folders.json`)

const { app } = require(`../server`)
const { TEST_DATABASE_URI } = require(`../config`)

const expect = chai.expect
chai.use(chaiHttp)

const seedDatabase = () => {
  return Folder.insertMany(seedFolders).then(() => Folder.createIndexes())
}

const dropDatabase = () => {
  return mongoose.connection.db.dropDatabase()
}

describe(`Folders endpoints`, () => {
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

  describe(`GET /api/folders`, () => {
    it(`should return all folders`, () => {
      let count
      return Folder.count()
        .then(_count => {
          count = _count
          return chai.request(app).get(`/api/folders`)
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
        .get(`/api/folders`)
        .then(res => {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.be.a(`array`)
          res.body.forEach(function(item) {
            expect(item).to.be.a(`object`)
            expect(item).to.include.keys(`id`, `name`, `createdAt`, `updatedAt`)
          })
        })
    })
  })

  describe(`GET /api/folders/:id`, () => {
    it(`should return correct folder`, () => {
      const id = `111111111111111111111100`
      let res
      return chai
        .request(app)
        .get(`/api/folders/${id}`)
        .then(_res => {
          res = _res
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.be.an(`object`)
          expect(res.body).to.include.keys(
            `id`,
            `name`,
            `createdAt`,
            `updatedAt`
          )
          return Folder.findById(id)
        })
        .then(item => {
          expect(res.body.id).to.eq(item.id)
          expect(res.body.name).to.eq(item.name)
        })
    })

    it(`should respond with a 400 for an invalid id`, () => {
      return chai
        .request(app)
        .get(`/DOES/NOT/EXIST`)
        .then(res => {
          expect(res).to.have.status(400)
        })
    })
  })

  describe(`POST /api/folders`, () => {
    it(`should create and return a new item when provided valid data`, () => {
      const newItem = {
        name: `Junk`
      }
      let body
      return chai
        .request(app)
        .post(`/api/folders`)
        .send(newItem)
        .then(res => {
          body = res.body
          expect(res).to.have.status(201)
          expect(res).to.be.json
          expect(res.body).to.be.a(`object`)
          expect(res.body).to.include.keys(
            `id`,
            `name`,
            `createdAt`,
            `updatedAt`
          )
          expect(res).to.have.header(`location`)
          return Folder.findById(body.id)
        })
        .then(data => {
          expect(body.name).to.eq(data.name)
        })
    })

    it(`should return an error when missing "name" field`, () => {
      const newItem = {
        foo: `bar`
      }
      return chai
        .request(app)
        .post(`/api/folders`)
        .send(newItem)
        .then(res => {
          expect(res).to.have.status(400)
          expect(res).to.be.json
          expect(res.body).to.be.a(`object`)
          expect(res.body.message).to.eq(`Missing \`name\` in request body`)
        })
    })

    it(`should return an error when "name" already exists`, () => {
      const newItem = {
        name: `Work`
      }
      return chai
        .request(app)
        .post(`/api/folders`)
        .send(newItem)
        .then(res => {
          expect(res).to.have.status(400)
          expect(res).to.be.json
          expect(res.body).to.be.a(`object`)
          expect(res.body.message).to.eq(`The folder name already exists`)
        })
    })
  })

  describe(`PUT /api/folders/:id`, () => {
    it(`should update the folder`, () => {
      const updateItem = {
        name: `Trash`
      }
      let id = `111111111111111111111100`
      let body
      return chai
        .request(app)
        .put(`/api/folders/${id}`)
        .send(updateItem)
        .then(res => {
          body = res.body
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.be.a(`object`)
          expect(res.body).to.include.keys(
            `id`,
            `name`,
            `createdAt`,
            `updatedAt`
          )
          return Folder.findById(id)
        })
        .then(item => {
          expect(body.name).to.eq(item.name)
        })
    })

    it(`should respond with a 400 for an invalid id`, () => {
      const updateItem = {
        name: `Who cares`
      }
      return chai
        .request(app)
        .put(`/DOES/NOT/EXIST`)
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(400)
        })
    })

    it(`should return an error when "name" already exists`, () => {
      const newItem = {
        name: `Work`
      }
      return chai
        .request(app)
        .post(`/api/folders/111111111111111111111100`)
        .send(newItem)
        .then(res => {
          expect(res).to.have.status(400)
          expect(res).to.be.json
          expect(res.body).to.be.a(`object`)
          expect(res.body.message).to.eq(`The folder name already exists`)
        })
    })
  })

  describe(`DELETE /api/folders/:id`, () => {
    it(`should delete an item by id`, () => {
      const id = `111111111111111111111102`
      return chai
        .request(app)
        .delete(`/api/folders/${id}`)
        .then(res => {
          expect(res).to.have.status(204)
          return Folder.findById(id)
        })
        .then(item => {
          expect(item).to.eq(null)
        })
    })
  })
})
