import { Hono } from "hono";
import { Env } from './core-utils';

export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Add more routes like this. **DO NOT MODIFY CORS OR OVERRIDE ERROR HANDLERS**
    app.get('/api/test', (c) => c.json({ success: true, data: { name: 'this works' }}));

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
}
