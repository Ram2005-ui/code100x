fetch('https://wandbox.org/api/compile.json', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    compiler: 'openjdk-jdk-22+36',
    code: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int N = sc.nextInt();
        int max = Integer.MIN_VALUE;
        for (int i = 0; i < N; i++) {
            int x = sc.nextInt();
            max = Math.max(max, x);
        }
        System.out.println(max);
    }
}`,
    stdin: '5\n10 20 30 50 40\n'
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(console.error);
