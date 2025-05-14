import { MikroORM, RequestContext } from '@mikro-orm/core';
import config from '../mikro-orm.config'; // Path to your MikroORM config

let orm: MikroORM | null = null;

/**
 * Initializes MikroORM instance if not already initialized.
 */
async function initORM(): Promise<MikroORM> {
  if (orm === null) {
    orm = await MikroORM.init(config as any);
  }
  return orm;
}

/**
 * Middleware-like function to ensure ORM is initialized and creates a RequestContext.
 * Required for safe EntityManager usage in request handlers.
 */
export async function getOrm(): Promise<MikroORM> {
    return await initORM();
}

/**
 * Helper function to get the EntityManager within a RequestContext.
 * Use this in your API route handlers.
 */
export async function getEm() {
    const currentOrm = await getOrm();
    return currentOrm.em;
}

/**
 * Utility to wrap request handlers with RequestContext.
 */
export async function withRequestContext<T>(fn: () => Promise<T>): Promise<T> {
    const currentOrm = await getOrm();
    // Use RequestContext.create which implicitly handles async operations within the callback
    return RequestContext.create(currentOrm.em, fn);
}

// Optional: Pre-connect on server start (can improve cold starts slightly)
// initORM().catch(console.error);
