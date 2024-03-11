import Link from 'next/link';

function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Lost in the Pumpkin Patch</h1>
        <p className="max-w-[500px] text-gray-500 md:text-xl leading-relaxed dark:text-gray-400">
          Oops! Looks like you're lost in the pumpkin patch.
        </p>
      </div>
      <Link href="/" className="mt-4 inline-flex h-9 items-center justify-center rounded-md border border-gray-200 bg-white px-4 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus-visible:ring-gray-300">
        Go back to Home
      </Link>
    </div>
  );
}

export default Custom404;