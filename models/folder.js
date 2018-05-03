const mongoose = require(`mongoose`)

const folderSchema = mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }
  },
  { timestamps: true }
)

folderSchema.set(`toObject`, {
  transform: (doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
  }
})

const Folder = mongoose.model(`folder`, folderSchema)
module.exports = { Folder }
