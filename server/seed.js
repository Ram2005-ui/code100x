const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Problem = require('./models/Problem');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/code100x';

const problems = [
  // ── EASY ────────────────────────────────────────────────────────────────────
  {
    title: 'Hello World',
    difficulty: 'Easy',
    description: `Print "Hello, World!" to the console.\n\nNo input is required.`,
    testCases: [
      { input: '', expectedOutput: 'Hello, World!\n', isHidden: false },
    ]
  },
  {
    title: 'Sum of Two Numbers',
    difficulty: 'Easy',
    description: `Given two integers A and B on separate lines, print their sum.\n\nInput:\nTwo integers A and B.\n\nOutput:\nPrint A + B.`,
    testCases: [
      { input: '3\n5', expectedOutput: '8\n', isHidden: false },
      { input: '10\n20', expectedOutput: '30\n', isHidden: false },
      { input: '-5\n5', expectedOutput: '0\n', isHidden: true },
      { input: '1000000\n2000000', expectedOutput: '3000000\n', isHidden: true },
    ]
  },
  {
    title: 'FizzBuzz',
    difficulty: 'Easy',
    description: `Print numbers from 1 to N.\nFor multiples of 3 print "Fizz", for multiples of 5 print "Buzz", for multiples of both print "FizzBuzz".\n\nInput:\nA single integer N.\n\nOutput:\nPrint N lines.`,
    testCases: [
      { input: '15', expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n', isHidden: false },
      { input: '5', expectedOutput: '1\n2\nFizz\n4\nBuzz\n', isHidden: false },
      { input: '3', expectedOutput: '1\n2\nFizz\n', isHidden: true },
    ]
  },
  {
    title: 'Reverse a String',
    difficulty: 'Easy',
    description: `Given a string S, print it reversed.\n\nInput:\nA single string S (no spaces).\n\nOutput:\nPrint the reversed string.`,
    testCases: [
      { input: 'hello', expectedOutput: 'olleh\n', isHidden: false },
      { input: 'abcdef', expectedOutput: 'fedcba\n', isHidden: false },
      { input: 'racecar', expectedOutput: 'racecar\n', isHidden: true },
      { input: 'a', expectedOutput: 'a\n', isHidden: true },
    ]
  },
  {
    title: 'Palindrome Check',
    difficulty: 'Easy',
    description: `Given a string S, check if it is a palindrome (reads the same forwards and backwards). Print "YES" if it is, "NO" otherwise.\n\nInput:\nA single string S.\n\nOutput:\nPrint YES or NO.`,
    testCases: [
      { input: 'racecar', expectedOutput: 'YES\n', isHidden: false },
      { input: 'hello', expectedOutput: 'NO\n', isHidden: false },
      { input: 'madam', expectedOutput: 'YES\n', isHidden: true },
      { input: 'abcd', expectedOutput: 'NO\n', isHidden: true },
    ]
  },
  {
    title: 'Factorial',
    difficulty: 'Easy',
    description: `Given a non-negative integer N, compute N! (N factorial).\n\nInput:\nA single integer N (0 ≤ N ≤ 12).\n\nOutput:\nPrint N!`,
    testCases: [
      { input: '5', expectedOutput: '120\n', isHidden: false },
      { input: '0', expectedOutput: '1\n', isHidden: false },
      { input: '10', expectedOutput: '3628800\n', isHidden: true },
      { input: '12', expectedOutput: '479001600\n', isHidden: true },
    ]
  },
  {
    title: 'Fibonacci Number',
    difficulty: 'Easy',
    description: `Given N, return the N-th Fibonacci number (0-indexed).\nThe Fibonacci sequence starts: 0, 1, 1, 2, 3, 5, 8, ...\n\nInput:\nA single integer N (0 ≤ N ≤ 30).\n\nOutput:\nPrint the N-th Fibonacci number.`,
    testCases: [
      { input: '0', expectedOutput: '0\n', isHidden: false },
      { input: '1', expectedOutput: '1\n', isHidden: false },
      { input: '10', expectedOutput: '55\n', isHidden: false },
      { input: '20', expectedOutput: '6765\n', isHidden: true },
    ]
  },
  {
    title: 'Count Vowels',
    difficulty: 'Easy',
    description: `Given a string S, count the number of vowels (a, e, i, o, u) — case-insensitive.\n\nInput:\nA single string S.\n\nOutput:\nPrint the count.`,
    testCases: [
      { input: 'Hello World', expectedOutput: '3\n', isHidden: false },
      { input: 'aeiou', expectedOutput: '5\n', isHidden: false },
      { input: 'bcdfg', expectedOutput: '0\n', isHidden: true },
      { input: 'Programming', expectedOutput: '3\n', isHidden: true },
    ]
  },
  {
    title: 'Find Maximum',
    difficulty: 'Easy',
    description: `Given N integers, find the maximum.\n\nInput:\nFirst line: N\nSecond line: N space-separated integers.\n\nOutput:\nPrint the maximum integer.`,
    testCases: [
      { input: '5\n3 1 4 1 5', expectedOutput: '5\n', isHidden: false },
      { input: '3\n-1 -5 -2', expectedOutput: '-1\n', isHidden: false },
      { input: '1\n42', expectedOutput: '42\n', isHidden: true },
    ]
  },
  {
    title: 'Two Sum',
    difficulty: 'Easy',
    description: `Given an array of integers nums and a target integer, return the 0-based indices of the two numbers that add up to target.\nAssume exactly one solution exists.\n\nInput:\nLine 1: N (array size)\nLine 2: N space-separated integers\nLine 3: target\n\nOutput:\nPrint the two indices separated by a space.`,
    testCases: [
      { input: '4\n2 7 11 15\n9', expectedOutput: '0 1\n', isHidden: false },
      { input: '3\n3 2 4\n6', expectedOutput: '1 2\n', isHidden: false },
      { input: '2\n3 3\n6', expectedOutput: '0 1\n', isHidden: true },
    ]
  },

  // ── MEDIUM ───────────────────────────────────────────────────────────────────
  {
    title: 'Maximum Subarray (Kadane\'s Algorithm)',
    difficulty: 'Medium',
    description: `Given an integer array nums, find the contiguous subarray with the largest sum and return its sum.\n\nInput:\nLine 1: N\nLine 2: N space-separated integers.\n\nOutput:\nPrint the maximum subarray sum.`,
    testCases: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6\n', isHidden: false },
      { input: '1\n1', expectedOutput: '1\n', isHidden: false },
      { input: '5\n5 4 -1 7 8', expectedOutput: '23\n', isHidden: true },
      { input: '4\n-1 -2 -3 -4', expectedOutput: '-1\n', isHidden: true },
    ]
  },
  {
    title: 'Valid Parentheses',
    difficulty: 'Medium',
    description: `Given a string containing only '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\nA string is valid if open brackets are closed by the same type of bracket and in the correct order.\n\nInput:\nA single string.\n\nOutput:\nPrint YES if valid, NO otherwise.`,
    testCases: [
      { input: '()', expectedOutput: 'YES\n', isHidden: false },
      { input: '()[]{}', expectedOutput: 'YES\n', isHidden: false },
      { input: '(]', expectedOutput: 'NO\n', isHidden: false },
      { input: '{[()]}', expectedOutput: 'YES\n', isHidden: true },
      { input: '([)]', expectedOutput: 'NO\n', isHidden: true },
    ]
  },
  {
    title: 'Binary Search',
    difficulty: 'Medium',
    description: `Given a sorted array of N integers and a target, return the index of target using binary search. If not found, return -1.\n\nInput:\nLine 1: N\nLine 2: N sorted integers\nLine 3: target\n\nOutput:\nPrint the 0-based index or -1.`,
    testCases: [
      { input: '6\n-1 0 3 5 9 12\n9', expectedOutput: '4\n', isHidden: false },
      { input: '6\n-1 0 3 5 9 12\n2', expectedOutput: '-1\n', isHidden: false },
      { input: '1\n5\n5', expectedOutput: '0\n', isHidden: true },
    ]
  },
  {
    title: 'Anagram Check',
    difficulty: 'Medium',
    description: `Given two strings S and T, determine if T is an anagram of S.\n\nInput:\nLine 1: S\nLine 2: T\n\nOutput:\nPrint YES or NO.`,
    testCases: [
      { input: 'anagram\nnagaram', expectedOutput: 'YES\n', isHidden: false },
      { input: 'rat\ncar', expectedOutput: 'NO\n', isHidden: false },
      { input: 'listen\nsilent', expectedOutput: 'YES\n', isHidden: true },
      { input: 'hello\nworld', expectedOutput: 'NO\n', isHidden: true },
    ]
  },
  {
    title: 'Merge Two Sorted Arrays',
    difficulty: 'Medium',
    description: `Given two sorted arrays, merge them into a single sorted array.\n\nInput:\nLine 1: N (size of first array)\nLine 2: N sorted integers\nLine 3: M (size of second array)\nLine 4: M sorted integers\n\nOutput:\nPrint all N+M integers sorted, space-separated.`,
    testCases: [
      { input: '3\n1 3 5\n3\n2 4 6', expectedOutput: '1 2 3 4 5 6\n', isHidden: false },
      { input: '2\n1 2\n3\n3 4 5', expectedOutput: '1 2 3 4 5\n', isHidden: false },
      { input: '0\n\n2\n1 2', expectedOutput: '1 2\n', isHidden: true },
    ]
  },
  {
    title: 'Longest Common Prefix',
    difficulty: 'Medium',
    description: `Given N strings, find the longest common prefix. If none exists, print an empty line.\n\nInput:\nLine 1: N\nNext N lines: one string each.\n\nOutput:\nPrint the longest common prefix.`,
    testCases: [
      { input: '3\nflower\nflow\nflight', expectedOutput: 'fl\n', isHidden: false },
      { input: '3\ndog\nracecar\ncar', expectedOutput: '\n', isHidden: false },
      { input: '2\ninterstate\ninterface', expectedOutput: 'inter\n', isHidden: true },
    ]
  },
  {
    title: 'Power of Two',
    difficulty: 'Medium',
    description: `Given an integer N, determine if it is a power of two.\n\nInput:\nA single integer N.\n\nOutput:\nPrint YES or NO.`,
    testCases: [
      { input: '1', expectedOutput: 'YES\n', isHidden: false },
      { input: '16', expectedOutput: 'YES\n', isHidden: false },
      { input: '3', expectedOutput: 'NO\n', isHidden: false },
      { input: '0', expectedOutput: 'NO\n', isHidden: true },
      { input: '1024', expectedOutput: 'YES\n', isHidden: true },
    ]
  },

  // ── HARD ─────────────────────────────────────────────────────────────────────
  {
    title: 'Longest Increasing Subsequence',
    difficulty: 'Hard',
    description: `Given an array of integers, find the length of the longest strictly increasing subsequence.\n\nInput:\nLine 1: N\nLine 2: N space-separated integers.\n\nOutput:\nPrint the length of the LIS.`,
    testCases: [
      { input: '8\n10 9 2 5 3 7 101 18', expectedOutput: '4\n', isHidden: false },
      { input: '4\n0 1 0 3 2 3', expectedOutput: '4\n', isHidden: false },
      { input: '4\n7 7 7 7', expectedOutput: '1\n', isHidden: true },
    ]
  },
  {
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    description: `Given an array of non-negative integers representing an elevation map where each bar has width 1, compute how much water it can trap after raining.\n\nInput:\nLine 1: N\nLine 2: N space-separated integers (heights).\n\nOutput:\nPrint the total trapped water.`,
    testCases: [
      { input: '12\n0 1 0 2 1 0 1 3 2 1 2 1', expectedOutput: '6\n', isHidden: false },
      { input: '6\n4 2 0 3 2 5', expectedOutput: '9\n', isHidden: false },
      { input: '3\n3 0 3', expectedOutput: '3\n', isHidden: true },
    ]
  },
  {
    title: 'N-Queens Problem',
    difficulty: 'Hard',
    description: `Place N queens on an N×N chessboard so that no two queens attack each other. Print the number of distinct solutions.\n\nInput:\nA single integer N (1 ≤ N ≤ 9).\n\nOutput:\nPrint the number of solutions.`,
    testCases: [
      { input: '4', expectedOutput: '2\n', isHidden: false },
      { input: '1', expectedOutput: '1\n', isHidden: false },
      { input: '8', expectedOutput: '92\n', isHidden: true },
    ]
  },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await Problem.deleteMany({});
    console.log(`Cleared existing problems`);

    await Problem.insertMany(problems);
    console.log(`Successfully seeded ${problems.length} problems`);

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
