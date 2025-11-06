import React, { useMemo, useState } from 'react';
import { AlertTriangle, RefreshCw, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import toast from 'react-hot-toast';

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
  title = "Something went wrong",
  message = "An unexpected error occurred",
  error,
  onRetry,
  onGoHome,
  showErrorDetails = true,
  statusMessage = "Error details"
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

  const errorMessage = useMemo(() => (
    error?.message || (typeof error === 'string' ? error : 'Unknown error')
  ), [error]);

  const errorStack = useMemo(() => (
    error?.stack || ''
  ), [error]);

  const aiPrompt = useMemo(() => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const timestamp = new Date().toISOString();

    return [
      `Please fix this error: ${errorMessage}`,
      '',
      `File/Component: ${errorStack.split('\n')[1]?.trim() || 'Unknown'}`,
      `URL: ${url}`,
      `Time: ${timestamp}`,
      '',
      errorStack ? `Stack trace:\n${errorStack}` : '',
    ].filter(Boolean).join('\n');
  }, [errorMessage, errorStack]);

  const handleCopyForAI = async () => {
    try {
      await navigator.clipboard.writeText(aiPrompt);
      setCopied(true);
      toast.success('Copied! Paste to AI to fix this error');
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      window.prompt('Copy this to AI:', aiPrompt);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardContent className="p-6 space-y-5">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>

          {/* Error Message Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Error Details</span>
            </div>
            <div className="relative">
              <pre className="whitespace-pre-wrap break-words font-mono text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg p-4 pr-12">
                {errorMessage}
              </pre>
            </div>
          </div>

          {/* AI Fix Prompt */}
          <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Need help fixing this?</p>
            <p className="text-xs text-muted-foreground">
              Copy the error details and paste them to AI for instant debugging assistance.
            </p>
            <Button
              onClick={handleCopyForAI}
              variant={copied ? "default" : "outline"}
              className="w-full"
              size="sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied! Paste to AI
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Error for AI
                </>
              )}
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleRetry} variant="outline" className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button onClick={handleGoHome} className="flex-1">
              Go Home
            </Button>
          </div>

          {/* Stack Trace (Collapsible) */}
          {errorStack && (
            <details className="text-left">
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
                View stack trace
              </summary>
              <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words font-mono text-[10px] leading-relaxed text-muted-foreground bg-muted/40 rounded-md p-3">
                {errorStack}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
