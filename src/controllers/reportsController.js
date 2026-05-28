const pool = require('../config/db')

// Dashboard completo: estadísticas + ventas recientes + datos de gráfica semanal
exports.dashboard = async (req, res) => {
  try {
    // Estadísticas generales
    const { rows: productsCount } = await pool.query('SELECT COUNT(*) as total_productos FROM productos')
    const { rows: salesCount } = await pool.query('SELECT COUNT(*) as total_ventas FROM ventas WHERE fecha::date = CURRENT_DATE')
    const { rows: revenue } = await pool.query('SELECT COALESCE(SUM(total),0) as total_ganancias FROM ventas')
    const { rows: lowStock } = await pool.query('SELECT COUNT(*) as stock_bajo FROM productos WHERE stock <= 10')

    // Ventas recientes (últimas 5)
    const { rows: recentSales } = await pool.query(`
      SELECT v.id as id_venta, v.cliente, v.fecha, v.total,
             STRING_AGG(p.nombre, ', ') as productos,
             SUM(dv.cantidad) as cantidad_total
      FROM ventas v
      LEFT JOIN detalle_venta dv ON v.id = dv.id_venta
      LEFT JOIN productos p ON dv.id_producto = p.id
      GROUP BY v.id, v.cliente, v.fecha, v.total
      ORDER BY v.fecha DESC
      LIMIT 5
    `)

    // Datos de gráfica semanal (últimos 7 días)
    const { rows: weeklyData } = await pool.query(`
      SELECT 
        TO_CHAR(fecha, 'Dy') as day,
        fecha::date as date,
        COUNT(*) as sales,
        COALESCE(SUM(total), 0) as revenue
      FROM ventas
      WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY fecha::date
      ORDER BY fecha::date ASC
    `)

    res.json({
      ok: true,
      stats: {
        total_productos: parseInt(productsCount[0].total_productos),
        total_ventas: parseInt(salesCount[0].total_ventas),
        total_ganancias: parseFloat(revenue[0].total_ganancias),
        stock_bajo: parseInt(lowStock[0].stock_bajo)
      },
      recentSales,
      weeklyData
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al generar dashboard' })
  }
}

// Resumen de inventario
exports.inventorySummary = async (req, res) => {
  try {
    const { rows: prodCount } = await pool.query('SELECT COUNT(*) as total_productos FROM productos')
    const { rows: lowStockCount } = await pool.query('SELECT COUNT(*) as stock_bajo FROM productos WHERE stock > 0 AND stock <= 20')
    const { rows: outOfStock } = await pool.query('SELECT COUNT(*) as agotados FROM productos WHERE stock = 0')
    const { rows: optimalStock } = await pool.query('SELECT COUNT(*) as stock_optimo FROM productos WHERE stock > 20')

    // Lista de productos con stock
    const { rows: productos } = await pool.query(`
      SELECT 
        p.id as id_producto,
        p.nombre as product,
        COALESCE(c.nombre, 'Sin categoría') as category,
        p.stock,
        20 as minStock,
        CASE 
          WHEN p.stock = 0 THEN 'Agotado'
          WHEN p.stock <= 20 THEN 'Bajo'
          ELSE 'Bien'
        END as status
      FROM productos p
      LEFT JOIN categorias c ON p.id_categoria = c.id
      ORDER BY p.stock ASC
    `)

    res.json({
      ok: true,
      summary: {
        total_productos: parseInt(prodCount[0].total_productos),
        stock_bajo: parseInt(lowStockCount[0].stock_bajo),
        agotados: parseInt(outOfStock[0].agotados),
        stock_optimo: parseInt(optimalStock[0].stock_optimo)
      },
      productos
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener resumen de inventario' })
  }
}

// Productos más vendidos
exports.topProducts = async (req, res) => {
  try {
    const { rows: topProducts } = await pool.query(`
      SELECT 
        p.nombre as name,
        SUM(dv.cantidad) as value,
        ROUND((SUM(dv.cantidad)::numeric / (SELECT SUM(cantidad) FROM detalle_venta)) * 100, 0) as percentage
      FROM detalle_venta dv
      INNER JOIN productos p ON dv.id_producto = p.id
      GROUP BY dv.id_producto, p.nombre
      ORDER BY value DESC
      LIMIT 10
    `)

    res.json({
      ok: true,
      topProducts
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener productos más vendidos' })
  }
}

// Ingresos mensuales (últimos 3 meses)
exports.monthlyRevenue = async (req, res) => {
  try {
    const { rows: monthlyData } = await pool.query(`
      SELECT 
        TO_CHAR(fecha, 'Month') as month,
        COALESCE(SUM(total), 0) as revenue,
        ROUND(COALESCE(SUM(total), 0) * 0.30, 2) as profit
      FROM ventas
      WHERE fecha >= CURRENT_DATE - INTERVAL '3 months'
      GROUP BY DATE_TRUNC('month', fecha)
      ORDER BY DATE_TRUNC('month', fecha) ASC
    `)

    res.json({
      ok: true,
      monthlyData
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener ingresos mensuales' })
  }
}

// Resumen financiero
exports.financialSummary = async (req, res) => {
  try {
    const { rows: totalRevenue } = await pool.query('SELECT COALESCE(SUM(total), 0) as ingresos_totales FROM ventas')
    const ingresos_totales = parseFloat(totalRevenue[0].ingresos_totales)
    const gastos_operativos = ingresos_totales * 0.30 // 30% estimado
    const ganancia_neta = ingresos_totales - gastos_operativos
    const margen_ganancia = ingresos_totales > 0 ? Math.round((ganancia_neta / ingresos_totales) * 100) : 0

    res.json({
      ok: true,
      financial: {
        ingresos_totales: Math.round(ingresos_totales),
        gastos_operativos: Math.round(gastos_operativos),
        ganancia_neta: Math.round(ganancia_neta),
        margen_ganancia
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener resumen financiero' })
  }
}

// Endpoint legacy (mantener para compatibilidad)
exports.stats = async (req, res) => {
  try {
    const { rows: prodCount } = await pool.query('SELECT COUNT(*) as products FROM productos')
    const { rows: salesCount } = await pool.query('SELECT COUNT(*) as ventas FROM ventas')
    const { rows: totalRev } = await pool.query('SELECT COALESCE(SUM(total),0) as total_revenue FROM ventas')
    const { rows: lowStockCount } = await pool.query('SELECT COUNT(*) as low_stock FROM productos WHERE stock <= 5')
    
    res.json({ 
      ok: true, 
      stats: { 
        products: parseInt(prodCount[0].products),
        ventas: parseInt(salesCount[0].ventas),
        total_revenue: parseFloat(totalRev[0].total_revenue),
        low_stock: parseInt(lowStockCount[0].low_stock)
      } 
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al generar estadísticas' })
  }
}