const pool = require('../config/db')

exports.getProducts = async (req, res) => {

  try {

    const result = await pool.query(
      'SELECT * FROM productos ORDER BY id_producto DESC'
    )

    res.json({
      ok: true,
      products: result.rows
    })

  } catch (error) {

    console.error(error)

    res.status(500).json({
      ok: false,
      message: 'Error obteniendo productos'
    })
  }
}

exports.createProduct = async (req, res) => {

  try {

    const {
      nombre,
      precio_venta,
      stock_actual
    } = req.body

    await pool.query(
      `
      INSERT INTO productos
      (
        nombre,
        precio_venta,
        stock_actual
      )
      VALUES($1,$2,$3)
      `,
      [
        nombre,
        precio_venta,
        stock_actual
      ]
    )

    res.json({
      ok: true,
      message: 'Producto creado'
    })

  } catch (error) {

    console.error(error)

    res.status(500).json({
      ok: false,
      message: 'Error creando producto'
    })
  }
}

exports.deleteProduct = async (req, res) => {

  try {

    const { id } = req.params

    await pool.query(
      'DELETE FROM productos WHERE id_producto = $1',
      [id]
    )

    res.json({
      ok: true,
      message: 'Producto eliminado'
    })

  } catch (error) {

    console.error(error)

    res.status(500).json({
      ok: false,
      message: 'Error eliminando producto'
    })
  }
}