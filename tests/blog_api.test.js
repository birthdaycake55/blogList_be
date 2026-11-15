const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')

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

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })
})

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
        username: 'root',
        name: 'Superuser',
        password: 'salainen',
        }

        const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('expected `username` to be unique'))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('creation fails with invalid username', async ()=>{
        const usersAtStart = await helper.usersInDb()
        const newUser = {
            username: 'no',
            name: 'chloe',
            password: 'longenough'
        }

        const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        console.log(result.body.error)
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('creation fails with invalid password', async ()=>{
        const usersAtStart = await helper.usersInDb()
        const newUser = {
            username: 'longenough',
            name: 'chloe',
            password: 'no'
        }

        await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

after(async () => {
  await mongoose.connection.close()
})