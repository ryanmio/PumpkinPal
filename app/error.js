'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { trackError, GA_CATEGORIES, GA_ACTIONS } from './utilities/error-analytics'; // Import GA utilities
import { CardHeader, CardContent, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }) {
  const router = useRouter(); // Use useRouter to access router properties

  useEffect(() => {
    // Log the error to Google Analytics
    trackError(error, router.pathname, GA_CATEGORIES.SYSTEM, GA_ACTIONS.ERROR);
    console.error(error); // Keep the console.error for local debugging
  }, [error, router.pathname]);

  // Style the component with a dynamic design
  return (
    <Card className="w-full max-w-lg mx-auto my-12">
      <CardHeader className="flex flex-col items-center space-y-2">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Oops, something went wrong!</h1>
          <p className="text-sm tracking-wide uppercase text-gray-500 dark:text-gray-400">Error code: {error.code || "Unknown"}</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <p className="text-sm md:text-base text-center text-gray-500 dark:text-gray-400">
          An error occurred... sorry about that. A log has been saved. Please try again later.
        </p>
        <Button className="w-full max-w-sm" variant="outline" onClick={() => router.push('/')}>
          Go Home
        </Button>
      </CardContent>
    </Card>
  );
}
