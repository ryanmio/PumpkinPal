import ReactGA from 'react-ga4';

export const GA_CATEGORIES = {
  USER: "User",
  SYSTEM: "System",
  MY_STATS: 'My Stats',
  SEARCH: 'Search',
  IMAGE_CARD: 'ImageCard',
};

export const GA_ACTIONS = {
  REGISTER: "Register",
  LOGIN: "Login",
  LOGOUT: "Logout",
  ADD_PUMPKIN: "Add Pumpkin",
  DELETE_PUMPKIN: "Delete Pumpkin",
  EDIT_PUMPKIN: "Edit Pumpkin",
  ADD_MEASUREMENT: "Add Measurement",
  ERROR: "Error",
  EMAIL_LOGIN: "Email Login",
  GOOGLE_LOGIN: "Google Login",
  DELETE_ACCOUNT: "Delete Account",
  UPDATE_PREFERENCES: "Update Preferences",
  EXPORT_DATA: "Export Data",
  EDIT_GROWER_ID: 'edit_grower_id',
  CONFIRM_GROWER_ID: 'confirm_grower_id',
  NAVIGATE_PUMPKIN_DETAILS: 'navigate_pumpkin_details',
  PERFORM_SEARCH: 'perform_search',
  SEARCH_CLICK: 'search_click',
  DOWNLOAD_SUCCESS: 'Download_Success',
  DOWNLOAD_FAILURE: 'Download_Failure',
  SHARE_SUCCESS: 'Share_Success',
  SHARE_FAILURE: 'Share_Failure',
  DELETE_SUCCESS: 'Delete_Success',
  DELETE_FAILURE: 'Delete_Failure',
};


// Function for sending error events to Google Analytics
export function trackError(error, method, category = GA_CATEGORIES.SYSTEM, action = GA_ACTIONS.ERROR) {
  ReactGA.event({
    category: category,
    action: action,
    label: `${method} - ${error.code || "Unknown error"}: ${error.message || ""}`,
  });
}

// Function for sending user events to Google Analytics
export function trackUserEvent(action, method) {
  ReactGA.event({
    category: GA_CATEGORIES.USER,
    action: action,
    label: method,
  });
}
