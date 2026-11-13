const blogRouter = require('express').Router()
const note = require('../../notes_backend/models/note')
const Blog = require('../models/blog')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
  })

blogRouter.post('/', async (request, response) => {
  const body = request.body

  const blog = new Blog ({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes ? body.likes : 0
  })

  const newBlog = await blog.save()
  response.status(201).json(newBlog)
  })

blogRouter.put('/:id', async(request, response)=>{
  const {title, author, url, likes} = request.body

  const blog = await Blog.findById(request.params.id)
  if(!blog){
    return response.status(404).end()
  }

  blog.title = title
  blog.author = author
  blog.url = url
  blog.likes = likes

  const updatedBlog = await blog.save()
  response.json(updatedBlog)
})

blogRouter.delete('/:id', async (request, response)=>{
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})
module.exports = blogRouter