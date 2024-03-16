// app/page.js
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import OTTWeightTracking from '../components/OTTWeightTracking';
import Search from '../src/components/GrowerStatsProfile/Search';

// Placeholder component for the Suspense fallback
const LoadingSearch = () => <div>Loading search...</div>; 

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200">
            {/* Hero Section */}
            <section className="flex justify-center items-center w-full py-6 md:py-12 lg:py-16 xl:py-20">
                <div className="container flex flex-col items-center justify-center gap-4 px-4 text-center md:px-6">
                    <div className="space-y-3">
                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">Grow a record pumpkin</h1>
                        <div className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                            <p>PumpkinPal is the all-in-one companion app for pumpkin growers.</p>
                        </div>
                    </div>
                    <Image
                        src="/images/graphdemo.gif"
                        alt="Hero"
                        className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center"
                        width={550}
                        height={310}
                    />
                </div>
            </section>

            <Suspense fallback={<p>Loading OTT Weight Tracking...</p>}>
                <OTTWeightTracking />
            </Suspense>


            {/* GPC Search Section with Suspense */}
            <section className="flex justify-center items-center w-full py-12 md:py-24 lg:py-32">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col justify-center space-y-4">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center">GPC Search</h2>
                            <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400 text-center mx-auto">
                                Find any grower, pumpkin, or site and get a comprehensive overview, rankings, and stats for each search result.
                            </p>
                        </div>
                        {/* Wrap the Search Component with Suspense */}
                        <Suspense fallback={<LoadingSearch />}>
                            <Search />
                        </Suspense>
                    </div>
                </div>
            </section>

            {/* Mission Statement Section */}
            <section className="w-full py-12 md:py-24 lg:py-32 flex justify-center bg-[#f2f2f2] dark:bg-[#333]">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">🌱 Our Mission</h2>
                            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                                Our mission is to empower the pumpkin growing community by providing tools that make the hobby more
                                accessible and enjoyable. We envision a future where every weigh-off is crowded with more and heavier
                                pumpkins. We're committed to making that vision a reality through the continuous development and improvement
                                of PumpkinPal.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Commitment Section */}
            <section className="w-full py-12 md:py-24 lg:py-32 flex justify-center">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">💸 Always Free</h2>
                            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                                PumpkinPal is committed to remaining free for all users. We believe in the power of community and the spirit of sharing knowledge and resources. As such, we pledge to keep PumpkinPal free to use, now and always.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="w-full py-12 md:py-24 lg:py-32 flex justify-center bg-[#f2f2f2] dark:bg-[#333]">
                <div className="container space-y-12 px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">All-in-One</h2>
                            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400 mx-auto">
                                A digital Swiss Army knife for growing giant pumpkins.
                            </p>
                        </div>
                    </div>
                    <div className="mx-auto grid max-w-sm items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3 justify-content-center">
                        {[
                            { title: "OTT Weight Tracking", description: "Instant in-field weight estimates and growth tracking with visual graphs, perfect for monitoring your pumpkin's progress throughout the season." },
                            { title: "Field-Friendly Interface", description: "Designed with the grower in mind, large buttons and minimal UI allow for easy data entry, even while wearing gloves in the field." },
                            { title: "PumpkinPal Database", description: "Dive into the most comprehensive pumpkin database ever built, drawing from all available GPC results on BigPumpkins.com." },
                            { title: "GPC Search", description: "Search the Giant Pumpkin Commonwealth's vast database. Find any grower, pumpkin, or site for historical data, rankings, and stats." },
                            { title: "Weigh-Off Stats", description: "Your personalized grower profile with detailed performance overviews from GPC sanctioned weigh-offs, all in one place." },
                            { title: "Image Gallery", description: "Take photos with the app or upload them, associating each image with the relevant pumpkin and its stats like DAP and date." },
                            { title: "Data Export", description: "With just a few taps, it's straightforward and easy to export all of your pumpkin data for further analysis or record-keeping." },
                            { title: "Cloud Storage Backups", description: "Rest easy with automatic cloud backup, safeguarding your data against loss and ensuring high availability." },
                        ].map((feature, i) => (
                            <div className="grid gap-1 justify-self-center" key={i}>
                                <h3 className="text-lg font-bold">{feature.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="py-24">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-6">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Data Security</h2>
                        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                            Rest easy, your pumpkin data is locked up tighter than your diary. 
                            Imagine a vault within a vault, that's the level of security we're talking about.
                        </p>
                    </div>
                    </div>
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <Link href="/register" className="px-8 py-2 green-button rounded text-white text-lg hover:text-white focus:outline-none focus:ring-0 underline-none no-underline">Join Now</Link>
                        <p className="text-base text-gray-600">
                            Already on board?
                            <Link href="/login" className="text-[#6c755e] hover:text-[#80876E]"> Sign in</Link>
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer Section */}
            <div className="App-footer w-full py-8 px-4 md:px-8 lg:px-16">
                <p className="mb-2">This project is open source. Check it out on 
                    <Link
                        href="https://github.com/ryanmio/PumpkinPal"
                        passHref
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-gray-200"
                        style={{ marginLeft: '5px' }}>
                        GitHub
                    </Link>.
                </p>
                <p className="text-xs text-gray-200">© 2023 PumpkinPal.</p>
            </div>
        </div>
    );
}

