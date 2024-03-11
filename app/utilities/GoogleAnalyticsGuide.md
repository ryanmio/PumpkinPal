# Implementation Guide: Adding Google Analytics 4 (GA4) to New Components in PumpkinPal

## Step 0: Update GA ACTIONS and CATEGORIES (Preparation)

Before implementing GA in a new component, update the `GA_ACTIONS` and `GA_CATEGORIES` in `error-analytics.js` to include new actions or categories specific to the component.

```javascript
// In error-analytics.js
export const GA_ACTIONS = {
  // ...existing actions
  NEW_ACTION: 'new_action',
};

export const GA_CATEGORIES = {
  // ...existing categories
  NEW_CATEGORY: 'New Category',
};
```
## Step 1: Import the Utility Functions and Constants
Import the utility functions trackUserEvent and trackError, as well as GA_ACTIONS and GA_CATEGORIES, into the component where you want to add GA4 tracking.

```javascript
import { trackUserEvent, trackError, GA_ACTIONS, GA_CATEGORIES } from '../utilities/error-analytics';
```
## Step 2: Identify User Events to Track
Determine which user events in the component you want to track.

## Step 3: Add trackUserEvent to User Events
Use the trackUserEvent function and the imported constants to track the identified user events.

```javascript
const handleButtonClick = () => {
  // Your code here
  trackUserEvent(GA_ACTIONS.NEW_ACTION, GA_CATEGORIES.NEW_CATEGORY);
};
```
## Step 4: Identify Errors to Track
Identify places in your component where errors could occur.

## Step 5: Add trackError to Error Handlers
Use the trackError function and the imported constants to track the identified errors.

```javascript
const fetchData = async () => {
  try {
    // Your code here
  } catch (error) {
    trackError(error.message, GA_CATEGORIES.NEW_CATEGORY, 'ComponentName', GA_ACTIONS.NEW_ACTION);
  }
};
```

## Step 6: Test the Implementation
Test the component to make sure that the events and errors are being tracked as expected.

## Step 7: Code Review and Deployment
Submit your changes for code review. Once approved, deploy the updated component.