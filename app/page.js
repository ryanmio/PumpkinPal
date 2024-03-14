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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full px-4 py-24 sm:px-6 -mx-4 sm:-mx-8 mb-8 bg-[#f2f2f2] dark:bg-[#333]">
                {[
                    { title: "Pumpkin Dashboard", description: "A central hub for growers to keep track of all their growing pumpkins." },
                    { title: "OTT Weight Tracking", description: "Allows for in-field estimation of pumpkin weight using the Over The Top (OTT) formula, tracking these measurements over time." },
                    { title: "Image Gallery", description: "Growers can take photos with the app or upload them, associating each image with the relevant pumpkin and its stats like DAP and date." },
                    { title: "PumpkinPal Database", description: "The custom-built PumpkinPal Database enables the calculation of rankings and stats for growers, pumpkins, and GPC sites." },
                    { title: "Weigh-Off Stats", description: "Provides a personal grower profile for users who have competed in GPC sanctioned weigh-offs." },
                    { title: "GPC Search", description: "Enables users to find any grower, pumpkin, or site and see a comprehensive overview, rankings, and stats." },
                    { title: "User Data Export", description: "Users can export their data for further analysis or record-keeping." },
                    { title: "Field-Friendly Interface", description: "Large, easy-to-tap buttons and simple forms make it easy to enter data even with gloves on." },
                ].map((feature, i) => (
                    <div className="flex flex-col items-center bg-white px-3 py-4 sm:p-4 rounded" key={i}>
                        <Image src="/logo192.webp" alt="Feature" width={192} height={192} className="w-6/12 h-auto sm:w-1/4 lg:w-3/8" />
                        <h2 className="text-xl mt-4 mb-2">{feature.title}</h2>
                        <p className="text-sm sm:text-base">{feature.description}</p>
                    </div>
                ))}
            </div>

            {/* Call to Action Section */}
            <div className="w-full p-8">
                <p className="mb-6">We respect your privacy and will never share your information. Pumpkin data is encrypted and stored separately from user data so that your pumpkin measurements are always secure.</p>
                <Link href="/register" className="px-8 py-2 mb-8 green-button rounded text-white text-xl hover:text-white focus:outline-none focus:ring-0 underline-none no-underline font-bold">Sign Up</Link>
                <p className="mt-3">Already signed up? 
                    <Link href="/login" className="text-blue-500">Login here</Link>
                </p>
            </div>

            {/* Footer Section */}
            <div className="App-footer w-full py-8 px-4 md:px-8 lg:px-16">
                <p className="mb-2">This project is open source. Check it out on 
                    <a href="https://github.com/ryanmio/PumpkinPal" target="_blank" rel="noopener noreferrer" className="text-blue-500" style={{ marginLeft: '5px' }}>GitHub</a>.
                </p>
                <p className="mb-2">© 2023 PumpkinPal.</p>
            </div>
        </div>
    );
}