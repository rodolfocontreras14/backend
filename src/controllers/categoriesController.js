const pool = require('../config/db')

exports.list = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categorias ORDER BY id')
    res.json({ ok: true, categories: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener categorías' })
  }
}

exports.create = async (req, res) => {
  const { nombre, descripcion } = req.body
  if (!nombre) return res.status(400).json({ error: 'Nombre requerido' })
  try {
    const { rows } = await pool.query('INSERT INTO categorias (nombre, descripcion) VALUES ($1,$2) RETURNING *', [nombre, descripcion || ''])
    res.status(201).json({ ok: true, category: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al crear categoría' })
  }
}

exports.update = async (req, res) => {
  const id = req.params.id
  const { nombre, descripcion } = req.body
  try {
    const { rows } = await pool.query('UPDATE categorias SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *', [nombre || '', descripcion || '', id])
    if (rows.length === 0) return res.status(404).json({ error: 'Categoría no encontrada' })
    res.json({ ok: true, category: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al actualizar categoría' })
  }
}

exports.remove = async (req, res) => {
  const id = req.params.id
  try {
    const { rowCount } = await pool.query('DELETE FROM categorias WHERE id = $1', [id])
    if (rowCount === 0) return res.status(404).json({ error: 'Categoría no encontrada' })
    res.json({ ok: true, message: 'Categoría eliminada' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al eliminar categoría' })
  }
}