
const express = require('express')
const router = express.Router()
const entriesController = require('../controllers/entriesController')
const auth = require('../middlewares/authMiddleware')

router.post('/', auth, entriesController.createEntry)
router.get('/', auth, entriesController.list)

module.exports = router