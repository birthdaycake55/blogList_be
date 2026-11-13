const Blog = require('../models/blog')

const initialBlog = [
  {
    title: "Welcome to my blog",
    author: "Chloe",
    url: "urlLink",
    likes: 10
  },
  {
    title: "Cyberpunk S2 discourse",
    author: "Chloe",
    url: "urlLink",
    likes: 440
  }
]

const nonExistingId = async () => {
  const blog = new Blog({ content: 'willremovethissoon' })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlog, blogsInDb
}