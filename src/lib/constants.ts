// Configuration constants
export const CONFIG = {
  FREE_SHIPPING_THRESHOLD: 500,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  VISITOR_TRACKING_INTERVAL: 5000, // 5 seconds
  VISITOR_UPDATE_INTERVAL: 60000, // 60 seconds
  MAX_PAGE_VIEWS: 50,
  ADMIN_SESSION_CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutes
} as const;

// Input limits
export const LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 100,
  ADDRESS_MIN: 10,
  ADDRESS_MAX: 500,
  EMAIL_MAX: 255,
  PHONE_LENGTH: 10,
  PRICE_MAX: 100000,
  STOCK_MAX: 100000,
} as const;









