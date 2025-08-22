const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_BASE_URL = 'http://localhost:8000/api';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  name: 'Test User',
  role: 'admin'
};

const testTeacher = {
  id: 'T001',
  name: 'Dr. John Smith',
  email: 'john.smith@university.edu',
  department: 'Computer Science',
  designation: 'Professor',
  subjects: ['Data Structures', 'Algorithms'],
  maxHoursPerWeek: 20,
  priority: 'high',
  status: 'active'
};

const updatedTeacher = {
  name: 'Dr. John Smith Updated',
  maxHoursPerWeek: 25,
  priority: 'medium'
};

let authToken = '';

async function testEndpoint(method, url, data = null, isFormData = false) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${url}`,
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    };

    if (data) {
      if (isFormData) {
        config.data = data;
        config.headers['Content-Type'] = 'multipart/form-data';
      } else {
        config.data = data;
        config.headers['Content-Type'] = 'application/json';
      }
    }

    const response = await axios(config);
    console.log(`✅ ${method} ${url}`);
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));
    console.log('---'.repeat(30));
    return response.data;
  } catch (error) {
    console.log(`❌ ${method} ${url}`);
    console.log(`Status: ${error.response?.status || 'Network Error'}`);
    console.log(`Error:`, error.response?.data || error.message);
    console.log('---'.repeat(30));
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Teacher Endpoints Test Suite\n');

  // Step 1: Register a test user (if needed)
  console.log('📝 Step 1: Registering test user...');
  await testEndpoint('POST', '/auth/register', testUser);

  // Step 2: Login to get authentication token
  console.log('🔐 Step 2: Logging in to get auth token...');
  const loginResponse = await testEndpoint('POST', '/auth/login', {
    email: testUser.email,
    password: testUser.password
  });

  if (loginResponse && loginResponse.token) {
    authToken = loginResponse.token;
    console.log(`🎉 Authentication successful! Token: ${authToken.substring(0, 20)}...\n`);
  } else {
    console.log('❌ Authentication failed! Cannot proceed with protected endpoints.\n');
    return;
  }

  // Step 3: Test all teacher endpoints
  console.log('👩‍🏫 Step 3: Testing Teacher Endpoints...\n');

  // 3a. GET /api/data/teachers - Get teachers list
  console.log('📋 Testing GET /api/data/teachers (Get teachers list)');
  await testEndpoint('GET', '/data/teachers');

  // 3b. POST /api/data/teachers - Create teacher
  console.log('➕ Testing POST /api/data/teachers (Create teacher)');
  await testEndpoint('POST', '/data/teachers', testTeacher);

  // 3c. GET /api/data/teachers/:id - Get specific teacher
  console.log('🔍 Testing GET /api/data/teachers/:id (Get specific teacher)');
  await testEndpoint('GET', `/data/teachers/${testTeacher.id}`);

  // 3d. PUT /api/data/teachers/:id - Update teacher
  console.log('✏️ Testing PUT /api/data/teachers/:id (Update teacher)');
  await testEndpoint('PUT', `/data/teachers/${testTeacher.id}`, updatedTeacher);

  // 3e. GET updated teacher to confirm changes
  console.log('🔍 Testing GET updated teacher to confirm changes');
  await testEndpoint('GET', `/data/teachers/${testTeacher.id}`);

  // 3f. Create CSV file for bulk import test
  console.log('📄 Creating test CSV file for bulk import...');
  const csvContent = `id,name,email,department,designation,subjects,maxHoursPerWeek,priority,status
T002,Dr. Jane Doe,jane.doe@university.edu,Mathematics,Associate Professor,"Calculus,Statistics",18,medium,active
T003,Prof. Bob Wilson,bob.wilson@university.edu,Physics,Professor,"Quantum Physics,Thermodynamics",22,high,active
T004,Dr. Alice Brown,alice.brown@university.edu,Chemistry,Assistant Professor,"Organic Chemistry,Inorganic Chemistry",16,low,active`;
  
  const csvPath = './test_teachers.csv';
  fs.writeFileSync(csvPath, csvContent);

  // 3g. POST /api/data/teachers/bulk-import - Bulk import teachers
  console.log('📤 Testing POST /api/data/teachers/bulk-import (Bulk import teachers)');
  const formData = new FormData();
  formData.append('csv', fs.createReadStream(csvPath));
  await testEndpoint('POST', '/data/teachers/bulk-import', formData, true);

  // 3h. GET teachers list again to see imported teachers
  console.log('📋 Testing GET /api/data/teachers again (to see imported teachers)');
  await testEndpoint('GET', '/data/teachers');

  // 3i. DELETE /api/data/teachers/:id - Delete teacher
  console.log('🗑️ Testing DELETE /api/data/teachers/:id (Delete teacher)');
  await testEndpoint('DELETE', `/data/teachers/${testTeacher.id}`);

  // 3j. Try to GET deleted teacher (should return 404)
  console.log('🔍 Testing GET deleted teacher (should return 404)');
  await testEndpoint('GET', `/data/teachers/${testTeacher.id}`);

  // Cleanup
  console.log('🧹 Cleaning up test files...');
  if (fs.existsSync(csvPath)) {
    fs.unlinkSync(csvPath);
  }

  console.log('🎉 All tests completed!\n');
}

// Run the tests
runTests().catch(console.error);
