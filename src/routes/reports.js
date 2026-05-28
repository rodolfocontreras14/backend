const express = require('express')
const router = express.Router()
const reportsController = require('../controllers/reportsController')
const auth = require('../middlewares/authMiddleware')

router.get('/stats', auth, reportsController.stats)
router.get('/dashboard', reportsController.dashboard)
router.get('/inventory-summary', reportsController.inventorySummary)
router.get('/top-products', reportsController.topProducts)
router.get('/monthly-revenue', reportsController.monthlyRevenue)
router.get('/financial-summary', reportsController.financialSummary)

module.exports = router