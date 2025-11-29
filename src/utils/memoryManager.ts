/**
 * Manages cleanup of object URLs and blob URLs to prevent memory leaks
 */

const urlRegistry = new Set<string>();

/**
 * Revokes an object URL and removes it from registry
 * @param url - Object URL to revoke
 */
export const revokeObjectURL = (url: string): void => {
  if (url && urlRegistry.has(url)) {
    URL.revokeObjectURL(url);
    urlRegistry.delete(url);
  }
};
