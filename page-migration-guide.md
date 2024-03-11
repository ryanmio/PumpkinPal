# Migrating from CRA to Next.js 14 with App Router

In the process of migrating a React component that uses `react-router-dom` for routing to Next.js 14, which utilizes its new App Router, we made several key changes to adapt to Next.js's routing and data fetching paradigms. Here's a detailed breakdown of what was done, why, and how you can apply these changes to your project.

## Changes Made

### 1. Accessing Dynamic Route Parameters

**Before:** In CRA with `react-router-dom`, you would use the `useParams` hook to access dynamic route parameters.

**After:** In Next.js 14, you still use a `useParams` hook, but it's imported from `next/navigation`. This change is necessary because Next.js has its own routing system, which is different from `react-router-dom`.

**Why:** Next.js's router is built into the framework and provides functionalities like server-side rendering and static generation out of the box. Using its router ensures compatibility with these features.

**Documentation:** [Next.js Routing](https://nextjs.org/docs/routing/introduction)

### 2. Programmatic Navigation

**Before:** With `react-router-dom`, you might use the `useNavigate` hook for programmatic navigation.

**After:** In Next.js, you use the `useRouter` hook from `next/navigation` and then call the `push` method on the router instance to navigate programmatically.

**Why:** This change is necessary to utilize Next.js's built-in router, which is designed to work seamlessly with both client-side and server-side rendered pages.

**Documentation:** [Next.js useRouter](https://nextjs.org/docs/api-reference/next/router#userouter)

### 3. Page Lifecycle and Data Fetching

**Before:** In a CRA project, you might use React hooks like `useEffect` for data fetching on the client side.

**After:** In Next.js, you can still use `useEffect` for client-side data fetching. However, for data that needs to be fetched at the time of rendering, you might consider using `getServerSideProps` (for server-side rendering) or `getStaticProps` (for static generation).

**Why:** While client-side data fetching is still valid, Next.js offers these additional data fetching methods to better support SEO and performance through server-side rendering and static generation.

**Documentation:** [Data Fetching in Next.js](https://nextjs.org/docs/basic-features/data-fetching)

## Implementation Example

Here's a simplified example of how we migrated the `EditPumpkin` component:
```javascript
// Before: Using react-router-dom
import { useParams, useNavigate } from 'react-router-dom';
// After: Using Next.js 14 App Router
import { useRouter, useParams } from 'next/navigation';
```

And for navigation:
```javascript
// Before
let navigate = useNavigate();
navigate('/dashboard');
// After
const router = useRouter();
router.push('/dashboard');
```

## Handling URL Parameters

When migrating routes that include dynamic URL parameters, it's important to decode these parameters if they might include encoded characters. In Next.js, you can use `useParams` from `next/navigation` to access the parameters, and then decode them using `decodeURIComponent`.

For example, to handle a route like `/pumpkin-details/:id` where `id` might include spaces or other characters that are encoded in URLs:


## Conclusion

Migrating from CRA to Next.js involves adapting to Next.js's routing and data fetching paradigms. By making these changes, we leverage Next.js's powerful features like server-side rendering, static generation, and built-in optimization for performance and SEO.

For more detailed information and advanced use cases, refer to the official Next.js documentation linked above.