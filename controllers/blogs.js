const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const middleware = require('../utils/middleware')


blogRouter.get('/', async (request, response) => {
  const blogs = await Blog
  .find({}).populate('user')
  response.json(blogs)
  })

blogRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body
  const user = request.user

  const blog = new Blog ({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes ? body.likes : 0,
    user: user._id
  })

  const newBlog = await blog.save()
  user.blogs = user.blogs.concat(blog._id)
  await user.save()
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

blogRouter.delete('/:id', middleware.userExtractor, async (request, response)=>{
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)
  
  if (!user) {
    return response.status(400).json({ error: 'userId missing or not valid' })
  }

  await Blog.findByIdAndDelete(request.params.id)
  user.blogs = user.blogs.pull(blog._id)
  await user.save()
  response.status(204).end()
})
module.exports = blogRouter