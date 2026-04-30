/**
 * Storage keys constants for Clipper
 * Centralizes storage key names to avoid string literals spread across the codebase
 */
export const STORAGE_KEYS = {
  AUTH: "clipper:auth",
  CODE: "clipper:code",
  KEYS: "clipper:keys",
  PROC: "clipper:proc",
} as const;
