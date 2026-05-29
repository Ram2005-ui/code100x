const code = `
#include <iostream>
using namespace std;
int main() {
    int a;
    cin >> a;
    cout << a * 2;
    return 0;
}`;

fetch('https://emkc.org/api/v2/piston/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    language: 'c++',
    version: '*',
    files: [{ content: code }],
    stdin: '5\n'
  })
}).then(res=>res.json()).then(console.log);
