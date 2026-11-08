const express = require('express')
const mongoose = require('mongoose')
const config = require('./utils/config')
const contactRouter = require('./controllers/contacts')

const dns = require('node:dns'); //needed or ig mongoose wont work
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express()

mongoose
  .connect(config.MONGODB_URI, { family: 4 })
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

  pp.use('/api/blog', contactRouter)

module.exports = app