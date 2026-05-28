const pool = require('../config/db')

exports.createSale = async (req, res) => {

  try {

    const {
      id_producto,
      cantidad
    } = req.body

    const product = await pool.query(
      `
      SELECT * FROM productos
      WHERE id_producto = $1
      `,
      [id_producto]
    )

    if (product.rows.length === 0) {

      return res.status(404).json({
        ok: false,
        message: 'Producto no encontrado'
      })
    }

    const currentProduct = product.rows[0]

    if (
      currentProduct.stock_actual < cantidad
    ) {

      return res.status(400).json({
        ok: false,
        message: 'Stock insuficiente'
      })
    }

    await pool.query(
      `
      UPDATE productos
      SET stock_actual = stock_actual - $1
      WHERE id_producto = $2
      `,
      [cantidad, id_producto]
    )

    res.json({
      ok: true,
      message: 'Venta realizada'
    })

  } catch (error) {

    console.error(error)

    res.status(500).json({
      ok: false,
      message: 'Error registrando venta'
    })
  }
}