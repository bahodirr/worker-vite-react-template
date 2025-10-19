import React, { useMemo, useState } from 'react';
import { AlertTriangle, RefreshCw, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface ErrorFallbackProps {
  title?: string;
  message?: string;
  error?: Error | any;
  onRetry?: () => void;
  onGoHome?: () => void;
  showErrorDetails?: boolean;
  statusMessage?: string;
}

export function ErrorFallback({
  title = "Oops! Something went wrong",
  message = "We're aware of the issue and actively working to fix it. Your experience matters to us.",
  error,
  onRetry,
  onGoHome,
  showErrorDetails = true,
  statusMessage = "Our team has been notified"
}: ErrorFallbackProps) {
  const [copied, setCopied] = useState(false);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  const copyText = useMemo(() => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const timestamp = new Date().toISOString();
    const errorMessage = error?.message || (typeof error === 'string' ? error : 'Unknown error');
    const errorStack = error?.stack || '';

    return [
      'Please help me debug this app error:',
      '',
      `Title: ${title}`,
      `Message: ${message}`,
      `Error Message: ${errorMessage}`,
      errorStack ? `Stack:\n${errorStack}` : undefined,
      `URL: ${url}`,
      `User Agent: ${userAgent}`,
      `Timestamp: ${timestamp}`,
      '',
      'Instructions: Suggest likely causes and next steps. Keep it concise.'
    ].filter(Boolean).join('\n');
  }, [error, title, message]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (_) {
      // Fallback: open a prompt to manually copy
      window.prompt('Copy the error details below:', copyText);
    }
  };

  const errorMessage = useMemo(() => (
    error?.message || (typeof error === 'string' ? error : message)
  ), [error, message]);
  const errorStack = useMemo(() => (
    error?.stack || ''
  ), [error]);

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm">
          <Card className="shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="text-center space-y-2">
                <div className="mx-auto w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
              <h1 className="text-base font-semibold">{title}</h1>
              <div className="relative text-left max-w-full pt-8 pr-12">
                <Button onClick={handleCopy} variant="outline" className="absolute top-2 right-2 h-7 px-2 py-0 text-xs">
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                <pre className="whitespace-pre-wrap break-words font-mono text-xs text-muted-foreground bg-muted/50 rounded-md p-3">
                  {errorMessage}
                </pre>
              </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={handleRetry} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            {errorStack && (
              <details className="text-left">
                <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">Stack trace</summary>
                <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-snug text-muted-foreground bg-muted/40 rounded-md p-3">
                  {errorStack}
                </pre>
              </details>
            )}
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Removed floating corner panel; copy remains near the message */}
    </>
  );
}
