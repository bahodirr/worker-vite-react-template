import { useEffect, useState, useRef, useMemo, memo } from 'react';
import { useConsoleStore, LogEntry, LogLevel } from '@/lib/console-listener';
import { Bug, Trash2, X, ChevronDown, Terminal, AlertTriangle, Info, XCircle, FileText, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const LOG_LEVELS: LogLevel[] = ['log', 'info', 'warn', 'error', 'debug'];

export function ConsoleViewer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<LogLevel>>(new Set(LOG_LEVELS));
  const logs = useConsoleStore((state) => state.logs);
  const clearLogs = useConsoleStore((state) => state.clearLogs);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const filteredLogs = useMemo(() => 
    logs.filter((log) => activeFilters.has(log.level)),
    [logs, activeFilters]
  );

  const errorCount = useMemo(() => logs.filter((l) => l.level === 'error').length, [logs]);
  const warnCount = useMemo(() => logs.filter((l) => l.level === 'warn').length, [logs]);

  // Auto-scroll
  useEffect(() => {
    if (isOpen && autoScroll && scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [filteredLogs.length, isOpen, autoScroll]); // Only trigger on length change to avoid jitters

  const toggleFilter = (level: LogLevel) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full px-3 py-2 shadow-lg transition-all",
          "bg-zinc-900 text-zinc-100 border border-zinc-700 hover:border-zinc-500",
          "dark:bg-zinc-800 dark:border-zinc-600 dark:hover:border-zinc-400"
        )}
      >
        <Bug className="h-4 w-4" />
        {(errorCount > 0 || warnCount > 0) && (
          <div className="flex items-center gap-1 text-xs font-medium">
            {errorCount > 0 && (
              <span className="flex items-center gap-0.5 text-red-400">
                <XCircle className="h-3 w-3" />
                {errorCount}
              </span>
            )}
            {warnCount > 0 && (
              <span className="flex items-center gap-0.5 text-amber-400">
                <AlertTriangle className="h-3 w-3" />
                {warnCount}
              </span>
            )}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className={cn(
      "fixed z-50 flex flex-col overflow-hidden",
      "inset-0 md:inset-auto md:bottom-4 md:right-4 md:h-[500px] md:w-[480px] md:rounded-lg",
      "bg-zinc-950 text-zinc-100 border-zinc-800 md:border md:shadow-2xl"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-zinc-400" />
          <span className="text-sm font-medium">Console</span>
          <span className="text-xs text-zinc-500">{filteredLogs.length}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAutoScroll(!autoScroll)}
            className={cn(
              "h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800",
              autoScroll && "text-emerald-400 bg-emerald-400/10"
            )}
            title={autoScroll ? "Auto-scroll on" : "Auto-scroll off"}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearLogs}
            className="h-7 w-7 text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
            title="Clear logs"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 border-b border-zinc-800 px-3 py-1.5 bg-zinc-900/50">
        <Filter className="h-3 w-3 text-zinc-500 mr-1" />
        {LOG_LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => toggleFilter(level)}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors",
              activeFilters.has(level)
                ? getFilterActiveStyle(level)
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {getLogIcon(level, 'h-3 w-3')}
            <span className="capitalize">{level}</span>
          </button>
        ))}
      </div>

      {/* Logs Area */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="flex flex-col p-2 gap-0.5">
          {filteredLogs.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-zinc-500">
              <Terminal className="mb-2 h-8 w-8 opacity-30" />
              <p className="text-sm">No logs yet</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <LogItem key={log.id} log={log} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// Memoized to prevent re-rendering existing logs when new ones arrive
const LogItem = memo(function LogItem({ log }: { log: LogEntry }) {
  const [isExpanded, setIsExpanded] = useState(false);
  // Expensive formatting only runs once per log
  const formattedContent = useMemo(() => formatLogContent(log.args), [log.args]);
  const isLong = formattedContent.length > 200;

  return (
    <div
      className={cn(
        "group flex gap-2 px-2 py-1 rounded text-xs font-mono transition-colors cursor-pointer",
        getLogRowStyle(log.level)
      )}
      onClick={() => isLong && setIsExpanded(!isExpanded)}
    >
      <div className="shrink-0 pt-0.5">
        {getLogIcon(log.level, 'h-3 w-3')}
      </div>
      <div className="flex-1 min-w-0">
        <div className={cn(
          "whitespace-pre-wrap break-all", // Use break-all to prevent horizontal overflow
          !isExpanded && isLong && "line-clamp-2"
        )}>
          {formattedContent}
        </div>
      </div>
      <div className="shrink-0 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity select-none">
        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
    </div>
  );
});

function getLogRowStyle(level: LogLevel): string {
  switch (level) {
    case 'error':
      return "bg-red-500/5 text-red-300 hover:bg-red-500/10";
    case 'warn':
      return "bg-amber-500/5 text-amber-300 hover:bg-amber-500/10";
    case 'info':
      return "bg-blue-500/5 text-blue-300 hover:bg-blue-500/10";
    case 'debug':
      return "text-zinc-500 hover:bg-zinc-800/50";
    default:
      return "text-zinc-300 hover:bg-zinc-800/50";
  }
}

function getFilterActiveStyle(level: LogLevel): string {
  switch (level) {
    case 'error':
      return "bg-red-500/20 text-red-400";
    case 'warn':
      return "bg-amber-500/20 text-amber-400";
    case 'info':
      return "bg-blue-500/20 text-blue-400";
    case 'debug':
      return "bg-zinc-700 text-zinc-300";
    default:
      return "bg-zinc-700 text-zinc-100";
  }
}

function getLogIcon(level: LogLevel, className: string) {
  const iconClass = cn(className, "shrink-0");
  switch (level) {
    case 'error':
      return <XCircle className={cn(iconClass, "text-red-400")} />;
    case 'warn':
      return <AlertTriangle className={cn(iconClass, "text-amber-400")} />;
    case 'info':
      return <Info className={cn(iconClass, "text-blue-400")} />;
    case 'debug':
      return <Bug className={cn(iconClass, "text-zinc-500")} />;
    default:
      return <FileText className={cn(iconClass, "text-zinc-400")} />;
  }
}

function formatLogContent(args: unknown[]): string {
  return args
    .map((arg) => {
      if (arg === null) return 'null';
      if (arg === undefined) return 'undefined';
      if (typeof arg === 'string') {
        // Strip %c styling prefixes and CSS strings
        if (arg.startsWith('%c')) return arg.slice(2);
        if (arg.startsWith('font-') || arg.startsWith('color:')) return '';
        return arg;
      }
      if (typeof arg === 'number' || typeof arg === 'boolean') return String(arg);
      if (arg instanceof Error) return `${arg.name}: ${arg.message}`;

      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return '[Object]';
      }
    })
    .filter(Boolean)
    .join(' ');
}
