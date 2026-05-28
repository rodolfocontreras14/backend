const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'No token provided' })
  const parts = authHeader.split(' ')
  if (parts.length !== 2) return res.status(401).json({ error: 'Token error' })
  const [scheme, token] = parts
  if (!/^Bearer$/i.test(scheme)) return res.status(401).json({ error: 'Token malformado' })
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Token inválido' })
    req.user = decoded
    return next()
  })
}

module.exports = authMiddleware