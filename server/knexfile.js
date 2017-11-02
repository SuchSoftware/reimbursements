const dotenv = require('dotenv').config()

// const envFromRealEnvironment = process.env.NODE_ENV || 'development'
// const path = `.env.${envFromRealEnvironment}`

// dotenv.config({ path, silent: envFromRealEnvironment === 'production' })

module.exports = process.env.DATABASE_URL
