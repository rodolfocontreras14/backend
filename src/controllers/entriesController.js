const pool = require('../config/db')

// Espera body: { proveedor_id, items: [{ id_producto, cantidad, precio_unitario }] }
exports.createEntry = async (req, res) => {
  const { proveedor_id, items } = req.body
  if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Items requeridos' })
  
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    
    const { rows: entryRows } = await client.query('INSERT INTO entradas (id_proveedor) VALUES ($1) RETURNING id', [proveedor_id || null])
    const entryId = entryRows[0].id
    
    for (const it of items) {
      const { id_producto, cantidad, precio_unitario } = it
      await client.query('INSERT INTO detalle_entrada (id_entrada, id_producto, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)', [entryId, id_producto, cantidad, precio_unitario || 0])
      // actualizar stock
      await client.query('UPDATE productos SET stock = COALESCE(stock,0) + $1 WHERE id = $2', [cantidad, id_producto])
    }
    
    await client.query('COMMIT')
    res.status(201).json({ ok: true, entrada_id: entryId })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.status(500).json({ error: 'Error al crear entrada: ' + err.message })
  } finally {
    client.release()
  }
}

exports.list = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM entradas ORDER BY fecha DESC LIMIT 100')
    res.json({ ok: true, entries: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener entradas' })
  }
}

exports.getById = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM entradas WHERE id = $1', [req.params.id])
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Entrada no encontrada' })
    }
    
    const { rows: details } = await pool.query('SELECT * FROM detalle_entrada WHERE id_entrada = $1', [req.params.id])
    res.json({ ok: true, entrada: rows[0], detalles: details })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener entrada' })
  }
}