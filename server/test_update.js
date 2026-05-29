const axios = require('axios');
const jwt = require('jsonwebtoken');

// A valid token
const token = jwt.sign({ user: { id: '6a16b2f44142708322ee01c9' } }, process.env.JWT_SECRET || 'supersecretjwt');

axios.get('http://localhost:5000/api/problems', {
  headers: { Authorization: `Bearer ${token}` }
}).then(res => {
  const p = res.data[0];
  console.log("Updating problem ID:", p._id);
  return axios.put(`http://localhost:5000/api/problems/${p._id}`, p, {
    headers: { Authorization: `Bearer ${token}` }
  });
}).then(res => {
  console.log("Update Success");
}).catch(err => {
  console.error("Update Error:", err.response ? err.response.data : err.message);
});
