import ReactGA from 'react-ga4';

export const GA_CATEGORIES = {
  USER: "User",
  SYSTEM: "System",
};

export const GA_ACTIONS = {
  REGISTER: "Register",
  LOGIN: "Login",
  LOGOUT: "Logout",
  ADD_PUMPKIN: "Add Pumpkin",
  EDIT_PUMPKIN: "Edit Pumpkin",
  ADD_MEASUREMENT: "Add Measurement",
  ERROR: "Error",
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
