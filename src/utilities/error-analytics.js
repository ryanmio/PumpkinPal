import ReactGA from 'react-ga4';

const GA_CATEGORIES = {
  USER: "User",
  SYSTEM: "System",
};

const GA_ACTIONS = {
  REGISTER: "Register",
  ERROR: "Error",
};

// Your function for sending error events to Google Analytics
export function trackError(error, method, category = GA_CATEGORIES.SYSTEM, action = GA_ACTIONS.ERROR) {
  ReactGA.event({
    category: category,
    action: action,
    label: `${method} - ${error.code || "Unknown error"}: ${error.message || ""}`,
  });
}

// Your function for sending user events to Google Analytics
export function trackUserEvent(action, method) {
  ReactGA.event({
    category: GA_CATEGORIES.USER,
    action: action,
    label: method,
  });
}
