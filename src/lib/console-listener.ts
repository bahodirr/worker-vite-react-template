import { create } from 'zustand';

export type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  args: unknown[];
}

interface ConsoleStore {
  logs: LogEntry[];
  addLog: (level: LogLevel, args: unknown[]) => void;
  clearLogs: () => void;
  isCapturing: boolean;
  setCapturing: (capturing: boolean) => void;
}

export const useConsoleStore = create<ConsoleStore>((set) => ({
  logs: [],
  addLog: (level, args) =>
    set((state) => ({
      // Perf: Limit local store to 200 items to prevent React rendering lag
      logs: [
        ...state.logs,
        {
          id: Math.random().toString(36).substring(7),
          timestamp: Date.now(),
          level,
          args,
        },
      ].slice(-200), 
    })),
  clearLogs: () => set({ logs: [] }),
  isCapturing: false,
  setCapturing: (isCapturing) => set({ isCapturing }),
}));

const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
};

// Configuration
const LOG_ENDPOINT = '/api/browser-logs';
const BATCH_INTERVAL = 2000;
const MAX_BATCH_SIZE = 20;

interface LogPayload {
  level: LogLevel;
  message: string;
  url: string;
  timestamp: string;
}

let logQueue: LogPayload[] = [];
let batchTimer: ReturnType<typeof setTimeout> | null = null;

function formatArgs(args: unknown[]): string {
  return args
    .map((arg) => {
      if (typeof arg === 'string') return arg;
      if (typeof arg === 'number' || typeof arg === 'boolean') return String(arg);
      if (arg === null) return 'null';
      if (arg === undefined) return 'undefined';
      if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
      try {
        return JSON.stringify(arg);
      } catch {
        return '[Object]';
      }
    })
    .join(' ');
}

async function sendLogBatch() {
  if (logQueue.length === 0) return;

  const batch = logQueue.splice(0, MAX_BATCH_SIZE);

  try {
    await fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logs: batch }),
    });
  } catch {
    // Fail silently - don't log errors about logging
  }

  // Schedule next batch if more logs came in
  if (logQueue.length > 0) {
    scheduleBatch();
  }
}

function scheduleBatch() {
  if (batchTimer) return;
  batchTimer = setTimeout(() => {
    batchTimer = null;
    sendLogBatch();
  }, BATCH_INTERVAL);
}

function queueLog(level: LogLevel, args: unknown[]) {
  const message = formatArgs(args);
  
  // Skip internal/noise
  if (
    message.includes('[ErrorReporter]') || 
    message.includes('[ConsoleListener]') ||
    message.includes('Download the React DevTools') ||
    message.includes('[vite]')
  ) {
    return;
  }

  logQueue.push({
    level,
    message,
    url: window.location.href,
    timestamp: new Date().toISOString(),
  });

  if (logQueue.length >= MAX_BATCH_SIZE) {
    if (batchTimer) {
      clearTimeout(batchTimer);
      batchTimer = null;
    }
    sendLogBatch();
  } else {
    scheduleBatch();
  }
}

export function initConsoleListener() {
  const store = useConsoleStore.getState();
  if (store.isCapturing) return;

  const intercept = (level: LogLevel) => (...args: unknown[]) => {
    originalConsole[level].apply(console, args);
    useConsoleStore.getState().addLog(level, args);
    queueLog(level, args);
  };

  console.log = intercept('log');
  console.info = intercept('info');
  console.warn = intercept('warn');
  console.error = intercept('error');
  console.debug = intercept('debug');

  useConsoleStore.setState({ isCapturing: true });
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (logQueue.length > 0) {
      navigator.sendBeacon(LOG_ENDPOINT, JSON.stringify({ logs: logQueue }));
    }
  });
}
