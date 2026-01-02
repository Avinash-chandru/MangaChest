import * as authUtils from '../utils/auth';

// Re-export named functions (local-only)
export const loginUser = authUtils.loginUser;
export const registerUser = authUtils.registerUser;
export const loginAdmin = authUtils.loginAdmin;
export const logout = authUtils.logout;
export const isAuthenticated = authUtils.isAuthenticated;
export const getCurrentUser = authUtils.getCurrentUser;

// Default export for backwards compatibility
export default authUtils;