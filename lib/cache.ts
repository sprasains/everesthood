// Re-export the implementation from src so imports using the project's path mapping
// (`@/lib/cache`) get the centralized, enhanced cache implementation.
export * from '../src/lib/cache';
export { default } from '../src/lib/cache';
