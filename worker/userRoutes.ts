import { Hono } from "hono";
import { Env } from './core-utils';

interface BrowserLog {
    level: 'log' | 'info' | 'warn' | 'error' | 'debug';
    message: string;
    url: string;
    timestamp: string;
}

export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // **DO NOT MODIFY CORS OR OVERRIDE ERROR HANDLERS**

    // Client error intake endpoint
    app.post('/api/client-errors', async (c) => {
        try {
            const e = await c.req.json<any>();
            if (!e?.message || !e?.url || !e?.userAgent) {
                return c.json({ success: false, error: 'Missing required fields' }, 400);
            }
            console.error('[CLIENT ERROR]', JSON.stringify({
                timestamp: e.timestamp || new Date().toISOString(),
                message: e.message,
                url: e.url,
                userAgent: e.userAgent,
                stack: e.stack,
                componentStack: e.componentStack,
                errorBoundary: e.errorBoundary,
                source: e.source,
                lineno: e.lineno,
                colno: e.colno,
            }, null, 2));
            return c.json({ success: true });
        } catch (error) {
            console.error('[CLIENT ERROR HANDLER] Failed:', error);
            return c.json({ success: false, error: 'Failed to process' }, 500);
        }
    });

    // Browser logs intake endpoint
    app.post('/api/browser-logs', async (c) => {
        try {
            const body = await c.req.json<{ logs: BrowserLog[] }>();
            const logs = body?.logs;
            
            if (!logs || !Array.isArray(logs)) {
                return c.json({ success: true }); // Ignore bad payloads silently
            }

            for (const log of logs) {
                const prefix = `[BROWSER ${log.level.toUpperCase()}]`;
                const logData = {
                    timestamp: log.timestamp,
                    message: log.message,
                    url: log.url,
                };

                // Route to appropriate console method based on level
                switch (log.level) {
                    case 'error':
                        console.error(prefix, JSON.stringify(logData));
                        break;
                    case 'warn':
                        console.warn(prefix, JSON.stringify(logData));
                        break;
                    case 'info':
                        console.info(prefix, JSON.stringify(logData));
                        break;
                    case 'debug':
                        console.debug(prefix, JSON.stringify(logData));
                        break;
                    default:
                        console.log(prefix, JSON.stringify(logData));
                }
            }

            return c.json({ success: true, received: logs.length });
        } catch (error) {
            console.error('[BROWSER LOGS HANDLER] Failed:', error);
            return c.json({ success: false, error: 'Failed to process' }, 500);
        }
    });
}
