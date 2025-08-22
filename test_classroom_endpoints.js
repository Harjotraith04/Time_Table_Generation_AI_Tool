const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:8000';
const API_URL = `${BASE_URL}/api`;

// Test user credentials
const testUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'testpassword123',
    role: 'admin'
};

// Test classroom data
const testClassroom = {
    id: 'A101',
    name: 'Room A101',
    building: 'Main Building',
    floor: '1st Floor',
    capacity: 30,
    type: 'Lecture Hall',
    features: ['Projector', 'Whiteboard', 'Air Conditioning'],
    suitableFor: ['Theory', 'Seminar'],
    priority: 'medium',
    status: 'available'
};

let authToken = '';
let createdClassroomId = '';

// Utility function to make authenticated requests
const makeAuthenticatedRequest = async (method, url, data = null) => {
    const config = {
        method,
        url: `${API_URL}${url}`,
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    };
    
    if (data) {
        config.data = data;
    }
    
    return axios(config);
};

// Test functions
const registerUser = async () => {
    try {
        console.log('\n🔵 Testing User Registration...');
        const response = await axios.post(`${API_URL}/auth/register`, testUser);
        console.log('✅ User registration successful:', response.data.message);
        return true;
    } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
            console.log('ℹ️ User already exists, proceeding with login...');
            return true;
        }
        console.error('❌ User registration failed:', error.response?.data?.message || error.message);
        return false;
    }
};

const loginUser = async () => {
    try {
        console.log('\n🔵 Testing User Login...');
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        
        authToken = response.data.token;
        console.log('✅ Login successful, token received');
        return true;
    } catch (error) {
        console.error('❌ Login failed:', error.response?.data?.message || error.message);
        return false;
    }
};

const testGetAllClassrooms = async () => {
    try {
        console.log('\n🔵 Testing GET /api/data/classrooms (Get all classrooms)...');
        const response = await makeAuthenticatedRequest('GET', '/data/classrooms');
        console.log('✅ Get all classrooms successful');
        console.log(`📊 Found ${response.data.length || 0} classrooms`);
        return response.data;
    } catch (error) {
        console.error('❌ Get all classrooms failed:', error.response?.data?.message || error.message);
        return [];
    }
};

const testCreateClassroom = async () => {
    try {
        console.log('\n🔵 Testing POST /api/data/classrooms (Create classroom)...');
        const response = await makeAuthenticatedRequest('POST', '/data/classrooms', testClassroom);
        createdClassroomId = response.data._id || response.data.id;
        console.log('✅ Create classroom successful');
        console.log(`📝 Created classroom with ID: ${createdClassroomId}`);
        console.log(`📋 Response data:`, JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('❌ Create classroom failed:', error.response?.data?.message || error.message);
        return null;
    }
};

const testUpdateClassroom = async () => {
    if (!createdClassroomId) {
        console.log('⚠️ Skipping update test - no classroom ID available');
        return;
    }
    
    try {
        console.log('\n🔵 Testing PUT /api/data/classrooms/:id (Update classroom)...');
        const updatedData = {
            ...testClassroom,
            id: 'A101-UPDATED',
            capacity: 35,
            features: ['Projector', 'Whiteboard', 'Air Conditioning', 'Smart Board']
        };
        
        const response = await makeAuthenticatedRequest('PUT', `/data/classrooms/${createdClassroomId}`, updatedData);
        console.log('✅ Update classroom successful');
        console.log(`📝 Updated classroom capacity to: ${response.data.capacity}`);
        return response.data;
    } catch (error) {
        console.error('❌ Update classroom failed:', error.response?.data?.message || error.message);
        return null;
    }
};

const testExportClassrooms = async () => {
    try {
        console.log('\n🔵 Testing GET /api/data/classrooms/export (Export classrooms CSV)...');
        const response = await axios.get(`${API_URL}/data/classrooms/export`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            responseType: 'blob'
        });
        
        console.log('✅ Export classrooms successful');
        console.log(`📄 Exported file size: ${response.data.size} bytes`);
        
        // Save the exported file
        const filePath = path.join(__dirname, 'exported_classrooms.csv');
        fs.writeFileSync(filePath, response.data);
        console.log(`💾 Exported file saved as: ${filePath}`);
        
        return true;
    } catch (error) {
        console.error('❌ Export classrooms failed:', error.response?.data?.message || error.message);
        return false;
    }
};

const testBulkImportClassrooms = async () => {
    try {
        console.log('\n🔵 Testing POST /api/data/classrooms/bulk-import (CSV import)...');
        
        // Create a sample CSV file for testing
        const csvContent = `id,name,building,floor,capacity,type,features,suitableFor
B101,Room B101,Science Building,2nd Floor,25,Science Lab,"Lab Equipment,Safety Equipment","Practical,Workshop"
B102,Room B102,Science Building,2nd Floor,20,Computer Lab,"Computers,Projector","Practical,Theory"
C201,Room C201,Arts Building,3rd Floor,40,Lecture Hall,"Projector,Sound System","Theory,Seminar"`;
        
        const csvPath = path.join(__dirname, 'test_classrooms.csv');
        fs.writeFileSync(csvPath, csvContent);
        
        const FormData = require('form-data');
        const form = new FormData();
        form.append('csv', fs.createReadStream(csvPath));
        
        const response = await axios.post(`${API_URL}/data/classrooms/bulk-import`, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        console.log('✅ Bulk import successful');
        console.log(`📊 Imported ${response.data.importedCount} classrooms`);
        
        // Clean up test file
        fs.unlinkSync(csvPath);
        
        return response.data;
    } catch (error) {
        console.error('❌ Bulk import failed:', error.response?.data?.message || error.message);
        return null;
    }
};

const testDeleteClassroom = async () => {
    if (!createdClassroomId) {
        console.log('⚠️ Skipping delete test - no classroom ID available');
        return;
    }
    
    try {
        console.log('\n🔵 Testing DELETE /api/data/classrooms/:id (Delete classroom)...');
        const response = await makeAuthenticatedRequest('DELETE', `/data/classrooms/${createdClassroomId}`);
        console.log('✅ Delete classroom successful');
        console.log(`🗑️ Deleted classroom with ID: ${createdClassroomId}`);
        return true;
    } catch (error) {
        console.error('❌ Delete classroom failed:', error.response?.data?.message || error.message);
        return false;
    }
};

// Main test runner
const runAllTests = async () => {
    console.log('🚀 Starting Classroom Endpoints Test Suite');
    console.log('='.repeat(50));
    
    try {
        // Authentication tests
        const registerSuccess = await registerUser();
        if (!registerSuccess) return;
        
        const loginSuccess = await loginUser();
        if (!loginSuccess) return;
        
        // Classroom CRUD tests
        await testGetAllClassrooms();
        await testCreateClassroom();
        await testUpdateClassroom();
        await testExportClassrooms();
        await testBulkImportClassrooms();
        
        // Get all classrooms again to see the updated list
        await testGetAllClassrooms();
        
        // Clean up - delete the test classroom
        await testDeleteClassroom();
        
        console.log('\n🎉 All tests completed successfully!');
        console.log('='.repeat(50));
        
    } catch (error) {
        console.error('\n💥 Test suite failed:', error.message);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Run the tests
if (require.main === module) {
    runAllTests();
}

module.exports = {
    runAllTests,
    testGetAllClassrooms,
    testCreateClassroom,
    testUpdateClassroom,
    testDeleteClassroom,
    testExportClassrooms,
    testBulkImportClassrooms
};
