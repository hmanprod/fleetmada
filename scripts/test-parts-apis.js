/**
 * Tests complets pour les APIs Parts
 * Sprint 7 - Parts (Pièces Détachées) Complet
 */

const API_BASE_URL = 'http://localhost:3000/api'
const TEST_TOKEN = 'test-jwt-token' // À remplacer par un vrai token

// Helper pour faire des requêtes API
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TEST_TOKEN}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    })

    const data = await response.json()
    return {
      success: response.ok,
      status: response.status,
      data
    }
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

// Tests pour les APIs CRUD
async function testPartsCRUD() {
  console.log('\n=== TESTS API PARTS CRUD ===')
  
  let testPartId = null
  
  try {
    // 1. Test GET /api/parts - Liste des pièces
    console.log('\n1. Testing GET /api/parts')
    const listResponse = await apiRequest('/parts?limit=10&page=1')
    
    if (listResponse.success && listResponse.data.success) {
      console.log('✅ GET /api/parts - SUCCESS')
      console.log(`   Total parts: ${listResponse.data.data.pagination.total}`)
      console.log(`   Parts in response: ${listResponse.data.data.parts.length}`)
    } else {
      console.log('❌ GET /api/parts - FAILED')
      console.log('   Error:', listResponse.data?.error || listResponse.error)
    }

    // 2. Test POST /api/parts - Création d'une pièce
    console.log('\n2. Testing POST /api/parts')
    const createData = {
      number: 'TEST-PART-001',
      description: 'Pièce de test pour validation API',
      category: 'Test',
      manufacturer: 'Test Manufacturer',
      cost: 150.50,
      quantity: 25,
      minimumStock: 5
    }
    
    const createResponse = await apiRequest('/parts', {
      method: 'POST',
      body: JSON.stringify(createData)
    })
    
    if (createResponse.success && createResponse.data.success) {
      console.log('✅ POST /api/parts - SUCCESS')
      testPartId = createResponse.data.data.id
      console.log(`   Created part ID: ${testPartId}`)
      console.log(`   Part number: ${createResponse.data.data.number}`)
    } else {
      console.log('❌ POST /api/parts - FAILED')
      console.log('   Error:', createResponse.data?.error || createResponse.error)
    }

    // 3. Test GET /api/parts/[id] - Détails d'une pièce
    if (testPartId) {
      console.log('\n3. Testing GET /api/parts/[id]')
      const detailResponse = await apiRequest(`/parts/${testPartId}`)
      
      if (detailResponse.success && detailResponse.data.success) {
        console.log('✅ GET /api/parts/[id] - SUCCESS')
        console.log(`   Part: ${detailResponse.data.data.description}`)
        console.log(`   Stock: ${detailResponse.data.data.quantity}`)
        console.log(`   Usage stats: ${detailResponse.data.data.usageStats?.usageCount || 0} uses`)
      } else {
        console.log('❌ GET /api/parts/[id] - FAILED')
        console.log('   Error:', detailResponse.data?.error || detailResponse.error)
      }

      // 4. Test PUT /api/parts/[id] - Modification d'une pièce
      console.log('\n4. Testing PUT /api/parts/[id]')
      const updateData = {
        number: 'TEST-PART-001',
        description: 'Pièce de test MODIFIÉE',
        category: 'Test Updated',
        manufacturer: 'Updated Manufacturer',
        cost: 175.00,
        quantity: 30,
        minimumStock: 8
      }
      
      const updateResponse = await apiRequest(`/parts/${testPartId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      })
      
      if (updateResponse.success && updateResponse.data.success) {
        console.log('✅ PUT /api/parts/[id] - SUCCESS')
        console.log(`   Updated description: ${updateResponse.data.data.description}`)
        console.log(`   Updated cost: ${updateResponse.data.data.cost}`)
      } else {
        console.log('❌ PUT /api/parts/[id] - FAILED')
        console.log('   Error:', updateResponse.data?.error || updateResponse.error)
      }
    }

  } catch (error) {
    console.error('❌ CRUD Tests Error:', error.message)
  }
  
  return testPartId
}

// Tests pour les APIs de gestion de stock
async function testStockManagement(testPartId) {
  console.log('\n=== TESTS API STOCK MANAGEMENT ===')
  
  if (!testPartId) {
    console.log('⚠️  No test part ID available, skipping stock tests')
    return
  }
  
  try {
    // 1. Test POST /api/parts/[id]/adjust-stock - Ajustement de stock
    console.log('\n1. Testing POST /api/parts/[id]/adjust-stock')
    const adjustData = {
      quantity: 10,
      reason: 'Réapprovisionnement test',
      type: 'PURCHASE',
      cost: 150.50,
      notes: 'Test d\'ajustement de stock'
    }
    
    const adjustResponse = await apiRequest(`/parts/${testPartId}/adjust-stock`, {
      method: 'POST',
      body: JSON.stringify(adjustData)
    })
    
    if (adjustResponse.success && adjustResponse.data.success) {
      console.log('✅ POST /api/parts/[id]/adjust-stock - SUCCESS')
      console.log(`   Previous stock: ${adjustResponse.data.data.adjustment.previousStock}`)
      console.log(`   New stock: ${adjustResponse.data.data.adjustment.newStock}`)
      console.log(`   Movement ID: ${adjustResponse.data.data.stockMovement.id}`)
    } else {
      console.log('❌ POST /api/parts/[id]/adjust-stock - FAILED')
      console.log('   Error:', adjustResponse.data?.error || adjustResponse.error)
    }

    // 2. Test GET /api/parts/[id]/stock-history - Historique des mouvements
    console.log('\n2. Testing GET /api/parts/[id]/stock-history')
    const historyResponse = await apiRequest(`/parts/${testPartId}/stock-history?limit=10`)
    
    if (historyResponse.success && historyResponse.data.success) {
      console.log('✅ GET /api/parts/[id]/stock-history - SUCCESS')
      console.log(`   Total movements: ${historyResponse.data.data.statistics.totalMovements}`)
      console.log(`   Total added: ${historyResponse.data.data.statistics.totalAdded}`)
      console.log(`   Total removed: ${historyResponse.data.data.statistics.totalRemoved}`)
    } else {
      console.log('❌ GET /api/parts/[id]/stock-history - FAILED')
      console.log('   Error:', historyResponse.data?.error || historyResponse.error)
    }

    // 3. Test POST /api/parts/[id]/reorder - Commande de réapprovisionnement
    console.log('\n3. Testing POST /api/parts/[id]/reorder')
    const reorderData = {
      quantity: 20,
      vendor: 'Test Vendor',
      urgency: 'MEDIUM',
      notes: 'Commande de test',
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
    
    const reorderResponse = await apiRequest(`/parts/${testPartId}/reorder`, {
      method: 'POST',
      body: JSON.stringify(reorderData)
    })
    
    if (reorderResponse.success && reorderResponse.data.success) {
      console.log('✅ POST /api/parts/[id]/reorder - SUCCESS')
      console.log(`   Reorder number: ${reorderResponse.data.data.reorder.reorderNumber}`)
      console.log(`   Priority: ${reorderResponse.data.data.reorder.urgency}`)
      console.log(`   Estimated cost: ${reorderResponse.data.data.reorder.estimatedCost}`)
    } else {
      console.log('❌ POST /api/parts/[id]/reorder - FAILED')
      console.log('   Error:', reorderResponse.data?.error || reorderResponse.error)
    }

  } catch (error) {
    console.error('❌ Stock Management Tests Error:', error.message)
  }
}

// Tests pour les APIs de statistiques
async function testStatsAPIs() {
  console.log('\n=== TESTS API STATISTICS ===')
  
  try {
    // 1. Test GET /api/parts/stats - Statistiques générales
    console.log('\n1. Testing GET /api/parts/stats')
    const statsResponse = await apiRequest('/parts/stats')
    
    if (statsResponse.success && statsResponse.data.success) {
      console.log('✅ GET /api/parts/stats - SUCCESS')
      console.log(`   Total parts: ${statsResponse.data.data.overview.totalParts}`)
      console.log(`   Total stock value: ${statsResponse.data.data.overview.totalStockValue}`)
      console.log(`   Out of stock: ${statsResponse.data.data.overview.outOfStock}`)
      console.log(`   Low stock: ${statsResponse.data.data.overview.lowStock}`)
      console.log(`   Categories: ${Object.keys(statsResponse.data.data.categories).length}`)
    } else {
      console.log('❌ GET /api/parts/stats - FAILED')
      console.log('   Error:', statsResponse.data?.error || statsResponse.error)
    }

    // 2. Test GET /api/parts/low-stock - Pièces en stock faible
    console.log('\n2. Testing GET /api/parts/low-stock')
    const lowStockResponse = await apiRequest('/parts/low-stock?limit=10&severity=all')
    
    if (lowStockResponse.success && lowStockResponse.data.success) {
      console.log('✅ GET /api/parts/low-stock - SUCCESS')
      console.log(`   Total low stock items: ${lowStockResponse.data.data.summary.total}`)
      console.log(`   Critical: ${lowStockResponse.data.data.summary.critical}`)
      console.log(`   Warning: ${lowStockResponse.data.data.summary.lowStock}`)
    } else {
      console.log('❌ GET /api/parts/low-stock - FAILED')
      console.log('   Error:', lowStockResponse.data?.error || lowStockResponse.error)
    }

    // 3. Test GET /api/parts/usage-analytics - Analyse d'utilisation
    console.log('\n3. Testing GET /api/parts/usage-analytics')
    const usageResponse = await apiRequest('/parts/usage-analytics?period=6months&limit=10')
    
    if (usageResponse.success && usageResponse.data.success) {
      console.log('✅ GET /api/parts/usage-analytics - SUCCESS')
      console.log(`   Period: ${usageResponse.data.data.overview.period}`)
      console.log(`   Parts analyzed: ${usageResponse.data.data.overview.totalParts}`)
      console.log(`   Total usage count: ${usageResponse.data.data.overview.totalUsageCount}`)
      console.log(`   Total value used: ${usageResponse.data.data.overview.totalValueUsed}`)
    } else {
      console.log('❌ GET /api/parts/usage-analytics - FAILED')
      console.log('   Error:', usageResponse.data?.error || usageResponse.error)
    }

    // 4. Test GET /api/parts/categories - Répartition par catégories
    console.log('\n4. Testing GET /api/parts/categories')
    const categoriesResponse = await apiRequest('/parts/categories?includeStats=true&limit=10')
    
    if (categoriesResponse.success && categoriesResponse.data.success) {
      console.log('✅ GET /api/parts/categories - SUCCESS')
      console.log(`   Total categories: ${categoriesResponse.data.data.overview.totalCategories}`)
      console.log(`   Total parts: ${categoriesResponse.data.data.overview.totalParts}`)
      console.log(`   Healthy categories: ${categoriesResponse.data.data.overview.healthyCategories}`)
    } else {
      console.log('❌ GET /api/parts/categories - FAILED')
      console.log('   Error:', categoriesResponse.data?.error || categoriesResponse.error)
    }

  } catch (error) {
    console.error('❌ Statistics Tests Error:', error.message)
  }
}

// Tests pour les APIs Dashboard
async function testDashboardAPIs() {
  console.log('\n=== TESTS API DASHBOARD ===')
  
  try {
    // 1. Test GET /api/dashboard/parts - Métriques dashboard
    console.log('\n1. Testing GET /api/dashboard/parts')
    const dashboardResponse = await apiRequest('/dashboard/parts')
    
    if (dashboardResponse.success && dashboardResponse.data.success) {
      console.log('✅ GET /api/dashboard/parts - SUCCESS')
      console.log(`   Total parts: ${dashboardResponse.data.data.overview.totalParts}`)
      console.log(`   Stock health: ${dashboardResponse.data.data.overview.stockHealth}%`)
      console.log(`   Critical parts: ${dashboardResponse.data.data.criticalParts.length}`)
      console.log(`   Recent usage: ${dashboardResponse.data.data.recentUsage.length}`)
      console.log(`   Alerts: ${dashboardResponse.data.data.alerts.length}`)
    } else {
      console.log('❌ GET /api/dashboard/parts - FAILED')
      console.log('   Error:', dashboardResponse.data?.error || dashboardResponse.error)
    }

    // 2. Test GET /api/dashboard/parts/alerts - Alertes dashboard
    console.log('\n2. Testing GET /api/dashboard/parts/alerts')
    const alertsResponse = await apiRequest('/dashboard/parts/alerts?limit=10&includeRecommendations=true')
    
    if (alertsResponse.success && alertsResponse.data.success) {
      console.log('✅ GET /api/dashboard/parts/alerts - SUCCESS')
      console.log(`   Total alerts: ${alertsResponse.data.data.statistics.total}`)
      console.log(`   Critical: ${alertsResponse.data.data.statistics.critical}`)
      console.log(`   Warning: ${alertsResponse.data.data.statistics.warning}`)
      console.log(`   Categories affected: ${alertsResponse.data.data.statistics.categoriesAffected}`)
    } else {
      console.log('❌ GET /api/dashboard/parts/alerts - FAILED')
      console.log('   Error:', alertsResponse.data?.error || alertsResponse.error)
    }

    // 3. Test GET /api/dashboard/parts/usage - Utilisation dashboard
    console.log('\n3. Testing GET /api/dashboard/parts/usage')
    const usageResponse = await apiRequest('/dashboard/parts/usage?period=30days&limit=10')
    
    if (usageResponse.success && usageResponse.data.success) {
      console.log('✅ GET /api/dashboard/parts/usage - SUCCESS')
      console.log(`   Period: ${usageResponse.data.data.globalStats.period}`)
      console.log(`   Parts used: ${usageResponse.data.data.globalStats.totalPartsUsed}`)
      console.log(`   Total cost: ${usageResponse.data.data.globalStats.totalCost}`)
      console.log(`   Recent usage items: ${usageResponse.data.data.recentUsage.length}`)
      console.log(`   Alerts: ${usageResponse.data.data.alerts.length}`)
    } else {
      console.log('❌ GET /api/dashboard/parts/usage - FAILED')
      console.log('   Error:', usageResponse.data?.error || usageResponse.error)
    }

  } catch (error) {
    console.error('❌ Dashboard Tests Error:', error.message)
  }
}

// Test de suppression (à exécuter en dernier)
async function testDeletePart(testPartId) {
  console.log('\n=== TEST DELETE PART ===')
  
  if (!testPartId) {
    console.log('⚠️  No test part ID available, skipping delete test')
    return
  }
  
  try {
    console.log('\nTesting DELETE /api/parts/[id]')
    const deleteResponse = await apiRequest(`/parts/${testPartId}`, {
      method: 'DELETE'
    })
    
    if (deleteResponse.success && deleteResponse.data.success) {
      console.log('✅ DELETE /api/parts/[id] - SUCCESS')
      console.log('   Part deleted successfully')
    } else {
      console.log('❌ DELETE /api/parts/[id] - FAILED')
      console.log('   Error:', deleteResponse.data?.error || deleteResponse.error)
    }
  } catch (error) {
    console.error('❌ Delete Test Error:', error.message)
  }
}

// Fonction principale de test
async function runAllTests() {
  console.log('🚀 Starting Parts APIs Test Suite')
  console.log('=====================================')
  console.log(`API Base URL: ${API_BASE_URL}`)
  console.log(`Test Token: ${TEST_TOKEN ? 'SET' : 'MISSING'}`)
  
  const startTime = Date.now()
  
  try {
    // 1. Tests CRUD
    const testPartId = await testPartsCRUD()
    
    // 2. Tests de gestion de stock
    await testStockManagement(testPartId)
    
    // 3. Tests de statistiques
    await testStatsAPIs()
    
    // 4. Tests Dashboard
    await testDashboardAPIs()
    
    // 5. Test de suppression (en dernier)
    await testDeletePart(testPartId)
    
  } catch (error) {
    console.error('❌ Test Suite Error:', error.message)
  }
  
  const endTime = Date.now()
  const duration = endTime - startTime
  
  console.log('\n=====================================')
  console.log(`🏁 Tests completed in ${duration}ms`)
  console.log('=====================================')
}

// Exécution des tests
if (require.main === module) {
  runAllTests().catch(console.error)
}

module.exports = {
  runAllTests,
  testPartsCRUD,
  testStockManagement,
  testStatsAPIs,
  testDashboardAPIs,
  testDeletePart
}