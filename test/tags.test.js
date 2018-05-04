const mongoose = require(`mongoose`)
const chai = require(`chai`)
const chaiHttp = require(`chai-http`)

const Item = require(`../models/tag`).Tag
const seedItems = require(`../db/seed/tags.json`)

const { app } = require(`../server`)
const { TEST_DATABASE_URI } = require(`../config`)

const expect = chai.expect
chai.use(chaiHttp)

const seedDatabase = () => {
  return Item.insertMany(seedItems).then(() => Item.createIndexes())
}

const dropDatabase = () => {
  return mongoose.connection.db.dropDatabase()
}

const itemType = `tag`
const baseUrl = `/api/tags`
const correctFields = [`id`, `name`, `createdAt`, `updatedAt`]
const testId = `222222222222222222222201`
const validNewItem = { name: `Horse` }
const validUpdateItem = validNewItem
const invalidNewItem = { name: `foo` }
const invalidUpdateItem = invalidNewItem
const uniqueField = `name`
const requiredField = uniqueField
const missingFieldItem = { foo: `bar` }

describe(`${itemType}s endpoints`, () => {
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

  describe(`GET ${baseUrl}`, () => {
    it(`should return all ${itemType}s`, () => {
      let count
      return Item.count()
        .then(_count => {
          count = _count
          return chai.request(app).get(`${baseUrl}`)
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
        .get(`${baseUrl}`)
        .then(res => {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.be.a(`array`)
          res.body.forEach(function(item) {
            expect(item).to.be.a(`object`)
            expect(item).to.include.keys(...correctFields)
          })
        })
    })
  })

  describe(`GET ${baseUrl}/:id`, () => {
    it(`should return correct ${itemType}`, () => {
      let res
      return chai
        .request(app)
        .get(`${baseUrl}/${testId}`)
        .then(_res => {
          res = _res
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.be.an(`object`)
          expect(res.body).to.include.keys(...correctFields)
          return Item.findById(testId)
        })
        .then(item => {
          expect(res.body.id).to.eq(item.id)
          expect(res.body[requiredField]).to.eq(item[requiredField])
        })
    })

    it(`should respond with a 400 for an invalid id`, () => {
      return chai
        .request(app)
        .get(`${baseUrl}/200`)
        .then(res => {
          expect(res).to.have.status(400)
        })
    })
  })

  describe(`POST ${baseUrl}`, () => {
    it(`should create and return a new ${itemType} when provided valid data`, () => {
      let body
      return chai
        .request(app)
        .post(`${baseUrl}`)
        .send(validNewItem)
        .then(res => {
          body = res.body
          expect(res).to.have.status(201)
          expect(res).to.be.json
          expect(res.body).to.be.a(`object`)
          expect(res.body).to.include.keys(...correctFields)
          expect(res).to.have.header(`location`)
          return Item.findById(body.id)
        })
        .then(data => {
          expect(body[requiredField]).to.eq(data[requiredField])
        })
    })

    it(`should return an error when missing "${requiredField}" field`, () => {
      return chai
        .request(app)
        .post(`${baseUrl}`)
        .send(missingFieldItem)
        .then(res => {
          expect(res).to.have.status(400)
          expect(res).to.be.json
          expect(res.body).to.be.a(`object`)
          expect(res.body.message).to.eq(
            `Missing \`${requiredField}\` in request body`
          )
        })
    })

    it(`should return an error when "${uniqueField}" already exists`, () => {
      return chai
        .request(app)
        .post(`${baseUrl}`)
        .send(invalidNewItem)
        .then(res => {
          expect(res).to.have.status(400)
          expect(res).to.be.json
          expect(res.body).to.be.a(`object`)
          expect(res.body.message).to.eq(
            `The ${itemType} ${uniqueField} already exists`
          )
        })
    })
  })

  describe(`PUT ${baseUrl}/:id`, () => {
    it(`should update the Item`, () => {
      let body
      return chai
        .request(app)
        .put(`${baseUrl}/${testId}`)
        .send(validUpdateItem)
        .then(res => {
          body = res.body
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.be.a(`object`)
          expect(res.body).to.include.keys(...correctFields)
          return Item.findById(testId)
        })
        .then(item => {
          expect(body[requiredField]).to.eq(item[requiredField])
        })
    })

    it(`should respond with a 400 for an invalid id`, () => {
      return chai
        .request(app)
        .put(`${baseUrl}/200`)
        .send(validUpdateItem)
        .then(res => {
          expect(res).to.have.status(400)
        })
    })

    it(`should return an error when "${uniqueField}" already exists`, () => {
      return chai
        .request(app)
        .put(`${baseUrl}/${testId}`)
        .send(invalidUpdateItem)
        .then(res => {
          expect(res).to.have.status(400)
          expect(res).to.be.json
          expect(res.body).to.be.a(`object`)
          expect(res.body.message).to.eq(
            `The ${itemType} ${uniqueField} already exists`
          )
        })
    })
  })

  describe(`DELETE ${baseUrl}/:id`, () => {
    it(`should delete an item by id`, () => {
      return chai
        .request(app)
        .delete(`${baseUrl}/${testId}`)
        .then(res => {
          expect(res).to.have.status(204)
          return Item.findById(testId)
        })
        .then(item => {
          expect(item).to.eq(null)
        })
    })
  })
})
