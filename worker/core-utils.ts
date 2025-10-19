/**
 * Core utilities for the Cloudflare Durable Object and KV template
 * STRICTLY DO NOT MODIFY THIS FILE - Hidden from AI to prevent breaking core functionality
 */
import type { Fetcher } from '@cloudflare/workers-types';

export interface Env {
    ASSETS: Fetcher;
}