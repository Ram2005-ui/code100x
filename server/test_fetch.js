const axios = require('axios');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ user: { id: '6a16b2f44142708322ee01c9' } }, process.env.JWT_SECRET || 'supersecretjwt');

axios.get('http://localhost:5000/api/problems', {
  headers: { Authorization: `Bearer ${token}` }
}).then(res => {
  const p = res.data[0];
  console.log("First problem ID:", p._id);
  return axios.get(`http://localhost:5000/api/problems/${p._id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}).then(res => {
  console.log("Success:", res.data.title);
  console.log("Test cases:", res.data.testCases);
}).catch(err => {
  console.error("Error:", err.response ? err.response.data : err.message);
});
