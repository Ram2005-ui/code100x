fetch('https://emkc.org/api/v1/piston/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    language: 'cpp',
    source: '#include <iostream>\nusing namespace std;\nint main() { int a; cin >> a; cout << a*2; return 0; }',
    stdin: '5'
  })
}).then(res=>res.text()).then(console.log);
