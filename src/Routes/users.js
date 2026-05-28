const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')
const auth = require('../middlewares/authMiddleware')

router.get('/', auth, usersController.list)
router.get('/:id', auth, usersController.getById)
router.post('/', auth, usersController.create)
router.put('/:id', auth, usersController.update)
router.delete('/:id', auth, usersController.remove)

module.exports = router