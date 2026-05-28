const pool = require('../config/db')
const bcrypt = require('bcryptjs')

exports.list = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id_usuario, nombre, usuario, rol, estado FROM usuarios ORDER BY id_usuario')
    res.json({ ok: true, users: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener usuarios' })
  }
}

exports.getById = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id_usuario, nombre, usuario, rol, estado FROM usuarios WHERE id_usuario = $1 LIMIT 1', [req.params.id])
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json({ ok: true, user: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener usuario' })
  }
}

exports.create = async (req, res) => {
  const { nombre, usuario, contrasena, rol, estado } = req.body
  if (!usuario || !contrasena) return res.status(400).json({ error: 'usuario y contrasena requeridos' })
  try {
    const hashed = bcrypt.hashSync(contrasena, 8)
    const { rows } = await pool.query(
      'INSERT INTO usuarios (nombre, usuario, contrasena, rol, estado) VALUES ($1,$2,$3,$4,$5) RETURNING id_usuario, nombre, usuario, rol, estado',
      [nombre || '', usuario, hashed, rol || 'empleado', estado || 1]
    )
    res.status(201).json({ ok: true, user: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al crear usuario: ' + err.message })
  }
}

exports.update = async (req, res) => {
  const id = req.params.id
  const { nombre, usuario, contrasena, rol, estado } = req.body
  try {
    if (contrasena) {
      const hashed = bcrypt.hashSync(contrasena, 8)
      await pool.query(
        'UPDATE usuarios SET nombre = $1, usuario = $2, contrasena = $3, rol = $4, estado = $5 WHERE id_usuario = $6',
        [nombre || '', usuario || '', hashed, rol || 'empleado', estado || 1, id]
      )
    } else {
      await pool.query(
        'UPDATE usuarios SET nombre = $1, usuario = $2, rol = $3, estado = $4 WHERE id_usuario = $5',
        [nombre || '', usuario || '', rol || 'empleado', estado || 1, id]
      )
    }
    
    const { rows } = await pool.query('SELECT id_usuario, nombre, usuario, rol, estado FROM usuarios WHERE id_usuario = $1', [id])
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json({ ok: true, user: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al actualizar usuario' })
  }
}

exports.remove = async (req, res) => {
  const id = req.params.id
  try {
    const { rowCount } = await pool.query('DELETE FROM usuarios WHERE id_usuario = $1', [id])
    if (rowCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json({ ok: true, message: 'Usuario eliminado' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al eliminar usuario' })
  }
}