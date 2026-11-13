const info = (...params) => {
  if(!process.env.TEST_MONGODB_URI){
    console.log(...params)
  }
}

const error = (...params) => {
  if(!process.env.TEST_MONGODB_URI){
    console.error(...params)
  }
}

module.exports = { info, error }