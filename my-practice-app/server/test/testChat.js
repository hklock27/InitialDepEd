// Improved test script for chat functionality
const axios = require('axios');

const SERVER_URL = 'http://localhost:5000';

async function testChatEndpoint() {
  console.log('🧪 Testing Chat Backend...\n');

  try {
    // Test 1: Simple query with full response logging
    console.log('Test 1: Asking about DepEd policies');
    const response1 = await axios.post(`${SERVER_URL}/api/chat/query`, {
      query: 'What are DepEd policies?',
      userId: 'test-user'
    });
    
    console.log('✅ Response received!');
    console.log('Full Response:', JSON.stringify(response1.data, null, 2));
    console.log('---\n');

    // Test 2: Different query
    console.log('Test 2: Asking about procedures');
    const response2 = await axios.post(`${SERVER_URL}/api/chat/query`, {
      query: 'school procedures',
      userId: 'test-user'
    });
    
    console.log('✅ Response received!');
    console.log('Full Response:', JSON.stringify(response2.data, null, 2));
    console.log('---\n');

    // Test 3: Query suggestions
    console.log('Test 3: Getting query suggestions');
    const response3 = await axios.get(`${SERVER_URL}/api/chat/suggestions`);
    
    console.log('✅ Suggestions received!');
    console.log('Full Response:', JSON.stringify(response3.data, null, 2));
    console.log('---\n');

    console.log('🎉 All tests completed! Check the responses above.');

  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error Message:', error.message);
      console.error('Error Details:', error);
    }
  }
}

// Run the test
testChatEndpoint();