const assert = require('node:assert')
const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlog)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, helper.initialBlog.length)
})

test('blog post identifier is named id, not _id', async () => {
    const response = await api.get('/api/blogs')
    const blogs = response.body
    assert(blogs.every(blog=>Object.hasOwn(blog, 'id')))
})

test('blog is created successfully', async () => {
    const newBlog = {
        title: "check if new blog is created",
        author: "chloe",
        url: "url",
        likes: 2
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const allBlogs = await helper.blogsInDb()
    const blogTitles = allBlogs.map((b)=>b.title)
    assert.strictEqual(allBlogs.length, helper.initialBlog.length+1)
    assert(blogTitles.includes('check if new blog is created'))
})

test('0 likes is not included in request', async () => {
    const newBlog = {
        title: "check if 0 likes",
        author: "chloe",
        url: "url",
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const allBlogs = await helper.blogsInDb()
    const blogTitles = allBlogs.map((b)=>b.title)
    const blogLikes = allBlogs.map(b=>b.likes)
    assert.strictEqual(allBlogs.length, helper.initialBlog.length+1)
    assert(blogTitles.includes('check if 0 likes'))
    assert(blogLikes.includes(0))
})

test('bad request if no title with code 400', async () => {
    const newBlog = {
        author: "chloe",
        url: "url",
        likes: 50
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('bad request if no url with code 400', async () => {
    const newBlog = {
        title: "no url",
        author: "chloe",
        likes: 50
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('deleted a specific note', async ()=> {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    
    const ids = blogsAtEnd.map(n=>n.id)
    
    assert(!ids.includes(blogToDelete.id))
    assert.strictEqual(blogsAtEnd.length, helper.initialBlog.length-1)
})

test('updating a blog', async () =>{
    const allBlogs = await helper.blogsInDb()
    const blogToUpdate = allBlogs[0]

    const updatedBlog = {
        title: 'blog title is updated',
        url: 'updatedUrl',
        author: 'updatedAuthor',
        likes: 100
    }

    blogToUpdate.title = updatedBlog.title
    blogToUpdate.author = updatedBlog.author
    blogToUpdate.url= updatedBlog.url
    blogToUpdate.likes = updatedBlog.likes

    await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(blogToUpdate)

    const currBlogs = await helper.blogsInDb()
    const blogLikes = currBlogs.map(b=>b.likes)
    assert(blogLikes.includes(100))

})

after(async () => {
  await mongoose.connection.close()
})