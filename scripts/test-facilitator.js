// Test script for facilitator rotation
async function testFacilitatorRotation() {
  const teamMembers = [
    "Lucius Malizani",
    "Hopkins Ceaser",
    "Joseph Dzanja",
    "Lameck Mbewe",
    "Astonie Mukiwa",
  ];

  console.log('Starting facilitator rotation test...\n');

  // Test GET current facilitator
  console.log('1. Getting current facilitator:');
  try {
    const getResponse = await fetch('http://localhost:3000/api/facilitator');
    const getData = await getResponse.json();
    console.log('Current facilitator:', teamMembers[getData.index]);
    console.log('Index:', getData.index);
  } catch (error) {
    console.error('Error getting facilitator:', error);
  }

  console.log('\n2. Testing rotation sequence:');
  // Test rotation for a full cycle plus one
  for (let i = 0; i < 6; i++) {
    try {
      // Advance to next facilitator
      const postResponse = await fetch('http://localhost:3000/api/facilitator', {
        method: 'POST'
      });
      const postData = await postResponse.json();
      
      console.log(`\nRotation ${i + 1}:`);
      console.log('Previous index:', postData.previousIndex);
      console.log('New index:', postData.index);
      console.log('New facilitator:', teamMembers[postData.index]);
      console.log('Timestamp:', new Date(postData.timestamp).toLocaleString());
      
      // Verify with a GET request
      const verifyResponse = await fetch('http://localhost:3000/api/facilitator');
      const verifyData = await verifyResponse.json();
      console.log('Verified index:', verifyData.index);
      
      if (verifyData.index !== postData.index) {
        console.error('❌ Verification failed! Indexes do not match');
      } else {
        console.log('✅ Verification successful');
      }
      
      // Wait a second between rotations
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error in rotation:', error);
    }
  }
}

// Run the test
testFacilitatorRotation().then(() => {
  console.log('\nTest completed!');
}).catch(error => {
  console.error('Test failed:', error);
});
