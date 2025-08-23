const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login with admin credentials...');
    
    const response = await axios.post('http://localhost:8000/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    console.log('Login successful!');
    console.log('User:', response.data.user);
    console.log('Token (first 20 chars):', response.data.token?.substring(0, 20) + '...');
    
    // Test accessing protected route with token
    const profileResponse = await axios.get('http://localhost:8000/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${response.data.token}`
      }
    });
    
    console.log('Profile access successful!');
    console.log('Profile data:', profileResponse.data);
    
  } catch (error) {
    console.error('Login test failed:', error.response?.data || error.message);
  }
}

testLogin();
