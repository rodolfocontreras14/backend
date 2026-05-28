require('dotenv').config()

const express = require('express')
const cors = require('cors')

const app = express()

// IMPORTAR RUTAS
const productRoutes = require('./Routes/products');
const salesRoutes = require('./Routes/sales');

// MIDDLEWARES
app.use(cors())

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

// RUTA PRINCIPAL
app.get('/', (req, res) => {

  res.json({
    ok: true,
    message: 'API Viveros funcionando'
  })
})

// RUTAS API

// PRODUCTOS
app.use('/api/productos', productRoutes)

// VENTAS
app.use('/api/ventas', salesRoutes)

// PUERTO
const PORT = process.env.PORT || 4000

app.listen(PORT, () => {

  console.log(
    `✅ Servidor corriendo en puerto ${PORT}`
  )
})