const jwt = require('jsonwebtoken')

const authenticationMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({"detail":"missing bearer"})
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_STRING)
    const { username } = decoded
    req.username = { username }
    next()
  } catch (error) {
    return res.status(403).json({"detail":"not authorized to perform this action"})
  }
}

module.exports = authenticationMiddleware