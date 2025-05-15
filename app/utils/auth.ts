// Authentication utility functions

// Define user type for better type safety
export interface User {
  id: string;
  authenticated: boolean;
  address?: string;
  displayName?: string;
  timestamp?: string;
  [key: string]: any; // Allow for additional properties
}

/**
 * Save user data to local storage
 * @param user User object to save
 */
export const saveUserToStorage = (user: User) => {
  if (typeof window !== 'undefined') {
    try {
      // Validate user object has required fields
      if (!user.id || typeof user.authenticated !== 'boolean') {
        throw new Error('Invalid user object: missing required fields');
      }
      
      // Add timestamp if not present
      const userToSave = {
        ...user,
        lastSaved: new Date().toISOString()
      };
      
      localStorage.setItem('saveup_user', JSON.stringify(userToSave));
      return true;
    } catch (error) {
      console.error('Error saving user data to storage:', error);
      return false;
    }
  }
  return false;
};

/**
 * Get user data from local storage
 * @returns User object or null if not found
 */
export const getUserFromStorage = (): User | null => {
  if (typeof window !== 'undefined') {
    try {
      const userData = localStorage.getItem('saveup_user');
      if (!userData) return null;
      
      const parsedUser = JSON.parse(userData) as User;
      
      // Validate parsed data has required user fields
      if (!parsedUser.id || typeof parsedUser.authenticated !== 'boolean') {
        console.warn('Invalid user data in storage, removing...');
        removeUserFromStorage();
        return null;
      }
      
      return parsedUser;
    } catch (error) {
      console.error('Error parsing user data from storage:', error);
      // Clean up invalid data
      removeUserFromStorage();
      return null;
    }
  }
  return null;
};

/**
 * Remove user data from local storage
 */
export const removeUserFromStorage = (): boolean => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('saveup_user');
      return true;
    } catch (error) {
      console.error('Error removing user data from storage:', error);
      return false;
    }
  }
  return false;
};

/**
 * Check if user is authenticated
 * @returns Boolean indicating if user is authenticated
 */
export const isUserAuthenticated = (): boolean => {
  const user = getUserFromStorage();
  return !!user && user.authenticated === true;
};

/**
 * Check if the authentication token is expired
 * @param expiryMinutes Number of minutes until token expiry (default: 60)
 * @returns Boolean indicating if token is expired
 */
export const isAuthTokenExpired = (expiryMinutes: number = 60): boolean => {
  const user = getUserFromStorage();
  if (!user || !user.lastSaved) return true;
  
  try {
    const lastSaved = new Date(user.lastSaved).getTime();
    const now = new Date().getTime();
    const expiryMs = expiryMinutes * 60 * 1000;
    
    return (now - lastSaved) > expiryMs;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
};

/**
 * Get user display name or fallback to default
 * @param fallback Fallback name if user or displayName not found
 * @returns User display name or fallback
 */
export const getUserDisplayName = (fallback: string = 'User'): string => {
  const user = getUserFromStorage();
  return user?.displayName || fallback;
};

/**
 * Refresh user authentication if token is expired
 * @param refreshCallback Function to call to refresh authentication
 * @param expiryMinutes Number of minutes until token expiry (default: 60)
 * @returns Promise resolving to boolean indicating if refresh was needed
 */
export const refreshAuthIfNeeded = async (
  refreshCallback: () => Promise<boolean>,
  expiryMinutes: number = 60
): Promise<boolean> => {
  // If user is not authenticated or token is expired, refresh
  if (!isUserAuthenticated() || isAuthTokenExpired(expiryMinutes)) {
    try {
      const refreshed = await refreshCallback();
      return refreshed;
    } catch (error) {
      console.error('Error refreshing authentication:', error);
      return false;
    }
  }
  return true; // Already authenticated and token is valid
};

/**
 * Format user address for display
 * @param address Full user address
 * @param startChars Number of characters to show at start
 * @param endChars Number of characters to show at end
 * @returns Formatted address string
 */
export const formatAddress = (
  address?: string, 
  startChars: number = 6, 
  endChars: number = 4
): string => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};
