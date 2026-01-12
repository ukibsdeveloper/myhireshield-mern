import axios from 'axios';

const payload = {
  companyName: 'Test Company',
  email: 'test@company.com',
  password: 'password123',
  website: 'https://testcompany.com',
  industry: 'Technology',
  companySize: '11-50',
  address: {
    street: '123 Test Street',
    city: 'Test City',
    state: 'Test State',
    country: 'India',
    pincode: '123456'
  },
  contactPerson: {
    name: 'John Doe',
    designation: 'CEO',
    phone: '9876543210',
    email: 'john@testcompany.com'
  },
  gstin: '22AAAAA0000A1Z5',
  cin: 'U72900KA2020PTC123456'
};

console.log('Sending payload:', JSON.stringify(payload, null, 2));

axios.post('http://localhost:5000/api/auth/register/company', payload, {
  headers: { 'Content-Type': 'application/json' }
})
.then(response => {
  console.log('SUCCESS:', response.data);
})
.catch(error => {
  console.log('ERROR:', error.response?.data || error.message);
  if (error.response?.data?.errors) {
    console.log('Validation errors:', error.response.data.errors);
  }
});