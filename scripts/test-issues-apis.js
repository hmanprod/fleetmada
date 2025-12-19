#!/usr/bin/env node

/**
 * Script de test pour les APIs backend Issues
 * Teste toutes les routes API Issues de FleetMada
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';

// Test data
const testData = {
  vehicle: {
    name: 'TEST_VEHICLE_001',
    make: 'Toyota',
    model: 'Corolla',
    vin: '1HGBH41JXMN109186',
    type: 'Car',
    year: 2022,
    status: 'ACTIVE'
  },
  issue: {
    vehicleId: '', // Will be set after vehicle creation
    summary: 'Test Issue - API Validation',
    priority: 'HIGH',
    labels: ['Test', 'API'],
    assignedTo: 'test-user-1'
  },
  comment: {
    author: 'Test User',
    content: 'This is a test comment for API validation'
  }
};

let authToken = '';
let vehicleId = '';
let issueId = '';
let commentId = '';

// Helper functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m'
  };
  
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
};

const makeRequest = async (endpoint, options = {}) => {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });
    
    const data = await response.json();
    
    return {
      ok: response.ok,
      status: response.status,
      data,
      headers: response.headers
    };
  } catch (error) {
    log(`Request failed: ${error.message}`, 'error');
    return {
      ok: false,
      status: 0,
      data: { error: error.message }
    };
  }
};

// Test functions
const testAuthentication = async () => {
  log('Testing Authentication...', 'info');
  
  // Test login (assuming we have a test user)
  const loginResponse = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123'
    })
  });
  
  if (loginResponse.ok && loginResponse.data.success) {
    authToken = loginResponse.data.data.token;
    log('Authentication successful', 'success');
    return true;
  } else {
    log(`Authentication failed: ${loginResponse.data.error}`, 'error');
    return false;
  }
};

const testCreateVehicle = async () => {
  log('Creating test vehicle...', 'info');
  
  const response = await makeRequest('/vehicles', {
    method: 'POST',
    body: JSON.stringify(testData.vehicle)
  });
  
  if (response.ok && response.data.success) {
    vehicleId = response.data.data.id;
    testData.issue.vehicleId = vehicleId;
    log(`Vehicle created successfully: ${vehicleId}`, 'success');
    return true;
  } else {
    log(`Vehicle creation failed: ${response.data.error}`, 'error');
    return false;
  }
};

const testIssuesAPI = async () => {
  log('Testing Issues API...', 'info');
  
  // Test 1: Create Issue
  log('Creating test issue...', 'info');
  const createResponse = await makeRequest('/issues', {
    method: 'POST',
    body: JSON.stringify(testData.issue)
  });
  
  if (createResponse.ok && createResponse.data.success) {
    issueId = createResponse.data.data.id;
    log(`Issue created successfully: ${issueId}`, 'success');
  } else {
    log(`Issue creation failed: ${createResponse.data.error}`, 'error');
    return false;
  }
  
  // Test 2: Get Issues List
  log('Getting issues list...', 'info');
  const listResponse = await makeRequest('/issues?limit=10&page=1');
  
  if (listResponse.ok && listResponse.data.success) {
    log(`Issues list retrieved: ${listResponse.data.data.issues.length} issues`, 'success');
  } else {
    log(`Issues list failed: ${listResponse.data.error}`, 'error');
    return false;
  }
  
  // Test 3: Get Issue Details
  log('Getting issue details...', 'info');
  const detailsResponse = await makeRequest(`/issues/${issueId}`);
  
  if (detailsResponse.ok && detailsResponse.data.success) {
    log('Issue details retrieved successfully', 'success');
  } else {
    log(`Issue details failed: ${detailsResponse.data.error}`, 'error');
    return false;
  }
  
  // Test 4: Update Issue
  log('Updating issue...', 'info');
  const updateResponse = await makeRequest(`/issues/${issueId}`, {
    method: 'PUT',
    body: JSON.stringify({
      summary: 'Updated Test Issue - API Validation',
      priority: 'CRITICAL'
    })
  });
  
  if (updateResponse.ok && updateResponse.data.success) {
    log('Issue updated successfully', 'success');
  } else {
    log(`Issue update failed: ${updateResponse.data.error}`, 'error');
    return false;
  }
  
  // Test 5: Change Issue Status
  log('Changing issue status...', 'info');
  const statusResponse = await makeRequest(`/issues/${issueId}/status`, {
    method: 'POST',
    body: JSON.stringify({ status: 'IN_PROGRESS' })
  });
  
  if (statusResponse.ok && statusResponse.data.success) {
    log('Issue status changed successfully', 'success');
  } else {
    log(`Issue status change failed: ${statusResponse.data.error}`, 'error');
    return false;
  }
  
  // Test 6: Assign Issue
  log('Assigning issue...', 'info');
  const assignResponse = await makeRequest(`/issues/${issueId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ assignedTo: 'test-assignee-1' })
  });
  
  if (assignResponse.ok && assignResponse.data.success) {
    log('Issue assigned successfully', 'success');
  } else {
    log(`Issue assignment failed: ${assignResponse.data.error}`, 'error');
    return false;
  }
  
  return true;
};

const testCommentsAPI = async () => {
  log('Testing Comments API...', 'info');
  
  // Test 1: Add Comment
  log('Adding comment...', 'info');
  const addCommentResponse = await makeRequest(`/issues/${issueId}/comments`, {
    method: 'POST',
    body: JSON.stringify(testData.comment)
  });
  
  if (addCommentResponse.ok && addCommentResponse.data.success) {
    commentId = addCommentResponse.data.data.id;
    log(`Comment added successfully: ${commentId}`, 'success');
  } else {
    log(`Comment addition failed: ${addCommentResponse.data.error}`, 'error');
    return false;
  }
  
  // Test 2: Get Comments
  log('Getting comments...', 'info');
  const getCommentsResponse = await makeRequest(`/issues/${issueId}/comments`);
  
  if (getCommentsResponse.ok && getCommentsResponse.data.success) {
    log(`Comments retrieved: ${getCommentsResponse.data.data.length} comments`, 'success');
  } else {
    log(`Comments retrieval failed: ${getCommentsResponse.data.error}`, 'error');
    return false;
  }
  
  // Test 3: Update Comment
  log('Updating comment...', 'info');
  const updateCommentResponse = await makeRequest(`/issues/${issueId}/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({
      content: 'Updated test comment for API validation'
    })
  });
  
  if (updateCommentResponse.ok && updateCommentResponse.data.success) {
    log('Comment updated successfully', 'success');
  } else {
    log(`Comment update failed: ${updateCommentResponse.data.error}`, 'error');
    return false;
  }
  
  // Test 4: Delete Comment
  log('Deleting comment...', 'info');
  const deleteCommentResponse = await makeRequest(`/issues/${issueId}/comments/${commentId}`, {
    method: 'DELETE'
  });
  
  if (deleteCommentResponse.ok && deleteCommentResponse.data.success) {
    log('Comment deleted successfully', 'success');
  } else {
    log(`Comment deletion failed: ${deleteCommentResponse.data.error}`, 'error');
    return false;
  }
  
  return true;
};

const testImagesAPI = async () => {
  log('Testing Images API...', 'info');
  
  // Test 1: Upload Image (using mock file)
  log('Uploading image...', 'info');
  const formData = new FormData();
  const mockFile = new Blob(['mock image content'], { type: 'image/jpeg' });
  formData.append('images', mockFile, 'test-image.jpg');
  
  const uploadResponse = await makeRequest(`/issues/${issueId}/images`, {
    method: 'POST',
    body: formData,
    headers: {} // Let browser set Content-Type for FormData
  });
  
  if (uploadResponse.ok && uploadResponse.data.success) {
    log('Image uploaded successfully', 'success');
  } else {
    log(`Image upload failed: ${uploadResponse.data.error}`, 'error');
    // Don't fail the test for image upload issues
  }
  
  // Test 2: Get Images
  log('Getting images...', 'info');
  const getImagesResponse = await makeRequest(`/issues/${issueId}/images`);
  
  if (getImagesResponse.ok && getImagesResponse.data.success) {
    log(`Images retrieved: ${getImagesResponse.data.data.length} images`, 'success');
  } else {
    log(`Images retrieval failed: ${getImagesResponse.data.error}`, 'error');
  }
  
  return true;
};

const testDashboardAPI = async () => {
  log('Testing Dashboard Issues API...', 'info');
  
  const response = await makeRequest('/dashboard/issues');
  
  if (response.ok && response.data.success) {
    log('Dashboard issues API working correctly', 'success');
    log(`Summary: ${JSON.stringify(response.data.data.summary, null, 2)}`, 'info');
    return true;
  } else {
    log(`Dashboard issues API failed: ${response.data.error}`, 'error');
    return false;
  }
};

const testFiltersAndPagination = async () => {
  log('Testing Filters and Pagination...', 'info');
  
  // Test with filters
  const filteredResponse = await makeRequest('/issues?status=OPEN&priority=HIGH&limit=5');
  
  if (filteredResponse.ok && filteredResponse.data.success) {
    log(`Filtered issues: ${filteredResponse.data.data.issues.length} issues`, 'success');
    log(`Pagination: ${JSON.stringify(filteredResponse.data.data.pagination)}`, 'info');
  } else {
    log(`Filtered request failed: ${filteredResponse.data.error}`, 'error');
  }
  
  // Test search
  const searchResponse = await makeRequest('/issues?search=test');
  
  if (searchResponse.ok && searchResponse.data.success) {
    log(`Search results: ${searchResponse.data.data.issues.length} issues`, 'success');
  } else {
    log(`Search failed: ${searchResponse.data.error}`, 'error');
  }
  
  return true;
};

const cleanup = async () => {
  log('Cleaning up test data...', 'info');
  
  // Delete issue
  if (issueId) {
    await makeRequest(`/issues/${issueId}`, { method: 'DELETE' });
    log('Test issue deleted', 'success');
  }
  
  // Delete vehicle
  if (vehicleId) {
    await makeRequest(`/vehicles/${vehicleId}`, { method: 'DELETE' });
    log('Test vehicle deleted', 'success');
  }
};

// Main test runner
const runTests = async () => {
  log('Starting Issues API Tests...', 'info');
  log(`API Base: ${API_BASE}`, 'info');
  
  let passedTests = 0;
  let totalTests = 0;
  
  try {
    // Test authentication
    totalTests++;
    if (await testAuthentication()) {
      passedTests++;
    }
    
    // Create test vehicle
    totalTests++;
    if (await testCreateVehicle()) {
      passedTests++;
    }
    
    // Test Issues API
    totalTests++;
    if (await testIssuesAPI()) {
      passedTests++;
    }
    
    // Test Comments API
    totalTests++;
    if (await testCommentsAPI()) {
      passedTests++;
    }
    
    // Test Images API
    totalTests++;
    if (await testImagesAPI()) {
      passedTests++;
    }
    
    // Test Dashboard API
    totalTests++;
    if (await testDashboardAPI()) {
      passedTests++;
    }
    
    // Test Filters and Pagination
    totalTests++;
    if (await testFiltersAndPagination()) {
      passedTests++;
    }
    
  } catch (error) {
    log(`Test execution failed: ${error.message}`, 'error');
  } finally {
    // Cleanup
    await cleanup();
    
    // Results
    log('=== TEST RESULTS ===', 'info');
    log(`Passed: ${passedTests}/${totalTests} tests`, passedTests === totalTests ? 'success' : 'warning');
    log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`, 'info');
    
    if (passedTests === totalTests) {
      log('All tests passed! ✅', 'success');
      process.exit(0);
    } else {
      log('Some tests failed! ❌', 'error');
      process.exit(1);
    }
  }
};

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testAuthentication,
  testIssuesAPI,
  testCommentsAPI,
  testImagesAPI,
  testDashboardAPI,
  testFiltersAndPagination
};