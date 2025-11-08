// Generate secure session ID
export function generateSecureSessionId(): string {
  // Use crypto.randomUUID if available, otherwise fallback
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `session_${crypto.randomUUID()}`;
  }
  
  // Fallback for older browsers
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return `session_${Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')}`;
}

// Encrypt localStorage data (simple base64 encoding - for production use proper encryption)
export function setSecureStorage(key: string, value: any): void {
  try {
    const encrypted = btoa(JSON.stringify(value));
    localStorage.setItem(key, encrypted);
  } catch (error) {
    console.error('Failed to set secure storage:', error);
  }
}

export function getSecureStorage<T>(key: string): T | null {
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    return JSON.parse(atob(encrypted)) as T;
  } catch (error) {
    console.error('Failed to get secure storage:', error);
    return null;
  }
}


