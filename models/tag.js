const mongoose = require(`mongoose`)

const tagSchema = mongoose.Schema(
  {
    name: { type: String, unique: true }
  },
  { timestamps: true }
)

tagSchema.set(`toObject`, {
  transform: (doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
  }
})

const Tag = mongoose.model(`Tag`, tagSchema)
module.exports = { Tag }
