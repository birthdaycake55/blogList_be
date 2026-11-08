const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
})

blogSchema.set('toJSON', { //removing certain properties
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString() //better to change to string
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.export = mongoose.model('Blog', blogSchema)