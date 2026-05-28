const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

pool.connect()
  .then(() => {
    console.log('✅ PostgreSQL Render conectado')
  })
  .catch((err) => {
    console.log('❌ Error PostgreSQL:', err)
  })

module.exports = pool