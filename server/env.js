require('dotenv').config()

module.exports = {
  bucket: process.env.BUCKET,
  databaseUrl: process.env.DATABASE_URL,
  port: process.env.PORT,
}
