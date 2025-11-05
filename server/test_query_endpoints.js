const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api';
let authToken = '';
let testQueryId = '';

// Test credentials - update these with actual test users
const ADMIN_CREDENTIALS = {
  email: 'admin@test.com',
  password: 'admin123'
};

const STUDENT_CREDENTIALS = {
  email: 'student@test.com',
  password: 'student123'
};

async function login(credentials) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    return null;
  }
}

async function testCreateQuery() {
  console.log('\n=== Testing Query Creation ===');
  
  try {
    const queryData = {
      subject: 'Test Query - Timetable Conflict',
      description: 'I have a conflict between two classes on Monday at 10 AM. Please review and resolve.',
      type: 'timetable-conflict',
      priority: 'high'
    };

    const response = await axios.post(`${BASE_URL}/queries`, queryData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✓ Query created successfully');
    console.log('Query ID:', response.data.data._id);
    testQueryId = response.data.data._id;
    return true;
  } catch (error) {
    console.error('✗ Failed to create query:', error.response?.data || error.message);
    return false;
  }
}

async function testGetQueries() {
  console.log('\n=== Testing Get All Queries ===');
  
  try {
    const response = await axios.get(`${BASE_URL}/queries`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✓ Fetched queries successfully');
    console.log('Total queries:', response.data.data.length);
    return true;
  } catch (error) {
    console.error('✗ Failed to fetch queries:', error.response?.data || error.message);
    return false;
  }
}

async function testGetQueryById() {
  console.log('\n=== Testing Get Query by ID ===');
  
  if (!testQueryId) {
    console.log('⚠ Skipping: No test query ID available');
    return false;
  }

  try {
    const response = await axios.get(`${BASE_URL}/queries/${testQueryId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✓ Fetched query successfully');
    console.log('Query subject:', response.data.data.subject);
    return true;
  } catch (error) {
    console.error('✗ Failed to fetch query:', error.response?.data || error.message);
    return false;
  }
}

async function testUpdateQueryStatus() {
  console.log('\n=== Testing Update Query Status ===');
  
  if (!testQueryId) {
    console.log('⚠ Skipping: No test query ID available');
    return false;
  }

  try {
    const response = await axios.patch(
      `${BASE_URL}/queries/${testQueryId}/status`,
      { status: 'approved' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    console.log('✓ Query status updated successfully');
    console.log('New status:', response.data.data.status);
    return true;
  } catch (error) {
    console.error('✗ Failed to update query status:', error.response?.data || error.message);
    return false;
  }
}

async function testRespondToQuery() {
  console.log('\n=== Testing Respond to Query ===');
  
  if (!testQueryId) {
    console.log('⚠ Skipping: No test query ID available');
    return false;
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/queries/${testQueryId}/respond`,
      { response: 'We have reviewed your query and are working on resolving the conflict. You will be notified once the issue is fixed.' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    console.log('✓ Response sent successfully');
    console.log('Query status:', response.data.data.status);
    return true;
  } catch (error) {
    console.error('✗ Failed to respond to query:', error.response?.data || error.message);
    return false;
  }
}

async function testAddComment() {
  console.log('\n=== Testing Add Comment ===');
  
  if (!testQueryId) {
    console.log('⚠ Skipping: No test query ID available');
    return false;
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/queries/${testQueryId}/comments`,
      { text: 'This is a test comment on the query.' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    console.log('✓ Comment added successfully');
    console.log('Total comments:', response.data.data.comments.length);
    return true;
  } catch (error) {
    console.error('✗ Failed to add comment:', error.response?.data || error.message);
    return false;
  }
}

async function testFilterQueries() {
  console.log('\n=== Testing Filter Queries ===');
  
  try {
    const response = await axios.get(`${BASE_URL}/queries?status=resolved&type=timetable-conflict`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✓ Filtered queries successfully');
    console.log('Filtered results:', response.data.data.length);
    return true;
  } catch (error) {
    console.error('✗ Failed to filter queries:', error.response?.data || error.message);
    return false;
  }
}

async function testGetStatistics() {
  console.log('\n=== Testing Get Query Statistics ===');
  
  try {
    const response = await axios.get(`${BASE_URL}/queries/statistics/overview`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✓ Fetched statistics successfully');
    console.log('Total queries:', response.data.data.total);
    console.log('Pending:', response.data.data.pending);
    console.log('Resolved:', response.data.data.resolved);
    return true;
  } catch (error) {
    console.error('✗ Failed to fetch statistics:', error.response?.data || error.message);
    return false;
  }
}

async function testDeleteQuery() {
  console.log('\n=== Testing Delete Query ===');
  
  if (!testQueryId) {
    console.log('⚠ Skipping: No test query ID available');
    return false;
  }

  try {
    await axios.delete(`${BASE_URL}/queries/${testQueryId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✓ Query deleted successfully');
    return true;
  } catch (error) {
    console.error('✗ Failed to delete query:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('QUERY RESOLUTION SYSTEM - API TESTS');
  console.log('='.repeat(60));

  // Login as admin
  console.log('\n=== Logging in as Admin ===');
  authToken = await login(ADMIN_CREDENTIALS);
  
  if (!authToken) {
    console.error('\n✗ Failed to login. Please check credentials and ensure server is running.');
    console.log('\nTo create test users, run:');
    console.log('  node server/create_admin.js');
    return;
  }
  
  console.log('✓ Logged in successfully');

  // Run all tests
  const tests = [
    testCreateQuery,
    testGetQueries,
    testGetQueryById,
    testUpdateQueryStatus,
    testRespondToQuery,
    testAddComment,
    testFilterQueries,
    testGetStatistics,
    testDeleteQuery
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test();
    if (result) passed++;
    else failed++;
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${tests.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('='.repeat(60));
}

// Run tests
runTests().catch(error => {
  console.error('\n✗ Test suite failed:', error.message);
  process.exit(1);
});
