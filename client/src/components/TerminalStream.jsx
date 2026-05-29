import React, { useState, useEffect } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';

const TerminalStream = ({ isRunning, isSubmitting }) => {
  const [lines, setLines] = useState([]);
  
  const runSequence = [
    "[system] Booting secure sandbox environment...",
    "[system] Allocating memory limits (256MB)...",
    "[compiler] Parsing syntax and building AST...",
    "[compiler] Compilation successful. No errors.",
    "[judge] Connecting to execution node...",
    "[judge] Running against visible test cases...",
    "Waiting for output..."
  ];

  const submitSequence = [
    "[system] Booting secure sandbox environment...",
    "[system] Allocating memory limits (256MB)...",
    "[compiler] Compiling source code...",
    "[compiler] Compilation successful. No errors.",
    "[judge] Retrieving 50 hidden test cases...",
    "[judge] Initializing isolated container...",
    "[judge] Executing test suite...",
    "Waiting for final evaluation..."
  ];

  useEffect(() => {
    if (!isRunning && !isSubmitting) {
      setLines([]);
      return;
    }

    const sequence = isSubmitting ? submitSequence : runSequence;
    setLines([]);
    
    let currentIndex = 0;
    let timerId;
    
    // Add lines progressively to simulate a real terminal
    const addLine = () => {
      if (currentIndex < sequence.length) {
        setLines(prev => [...prev, sequence[currentIndex]]);
        currentIndex++;
        
        // Randomize delay between lines for realism (100ms - 400ms)
        const delay = Math.random() * 300 + 100;
        timerId = setTimeout(addLine, delay);
      }
    };
    
    // Initial delay
    timerId = setTimeout(addLine, 200);
    
    return () => clearTimeout(timerId);
  }, [isRunning, isSubmitting]);

  if (!isRunning && !isSubmitting) return null;

  return (
    <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#0D1117] border border-white/10 rounded-lg overflow-hidden shadow-2xl">
        <div className="bg-white/5 px-4 py-2 flex items-center gap-2 border-b border-white/10">
          <TerminalIcon className="w-4 h-4 text-text-muted" />
          <span className="text-xs font-mono text-text-muted">Terminal Output</span>
        </div>
        <div className="p-4 h-64 overflow-y-auto font-mono text-sm">
          {lines.map((line, idx) => (
            <div key={idx} className="mb-2 flex items-start gap-2">
              <span className="text-primary opacity-50">&gt;</span>
              <span className={line && typeof line === 'string' && line.includes('[error]') ? 'text-red-400' : 'text-green-400'}>
                {line || ''}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-primary opacity-50">&gt;</span>
            <span className="w-2 h-4 bg-white/50 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalStream;
