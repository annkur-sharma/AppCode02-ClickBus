/**
 * Cloudflare Worker environment configuration types
 * This file defines the types for environment variables and bindings available to the worker
 */

// Environment interface for Cloudflare Worker
declare global {
  interface Env {
    // Azure Service Bus Configuration
    AZURE_SERVICE_BUS_CONNECTION_STRING?: string;
    AZURE_SERVICE_BUS_QUEUE_NAME?: string;
    
    // Kubernetes Pod Information
    POD_NAME?: string;
    POD_NAMESPACE?: string;
    POD_IP?: string;
    
    // Mocha Authentication (from secrets)
    MOCHA_USERS_SERVICE_API_KEY?: string;
    MOCHA_USERS_SERVICE_API_URL?: string;
    
    // Environment
    NODE_ENV?: string;
    PORT?: string;
    LOG_LEVEL?: string;
    
    // Cloudflare Worker Bindings (can be extended as needed)
    // DB?: D1Database;
    // CACHE?: KVNamespace;
  }

  // Web Crypto API
  const crypto: Crypto;
  
  // Console API
  const console: Console;
  
  // Date API
  const Date: DateConstructor;
}

export {};