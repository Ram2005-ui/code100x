Promise.all([
  fetch('https://wandbox.org/api/compile.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      compiler: 'openjdk-jdk-22+36',
      code: `import java.util.Scanner;
  class Main {
      public static void main(String[] args) {
          Scanner sc = new Scanner(System.in);
          int N = sc.nextInt();
          System.out.println(N * 2);
      }
  }`,
      stdin: '5\n'
    })
  }).then(r=>r.json()),
  fetch('https://wandbox.org/api/compile.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      compiler: 'gcc-head',
      code: '#include <iostream>\nusing namespace std;\nint main(){int a; cin >> a; cout << a * 2 << endl; return 0;}',
      stdin: '5\n'
    })
  }).then(r=>r.json())
]).then(console.log).catch(console.error);
