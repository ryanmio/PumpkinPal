import React from 'react';
import { Link } from 'react-router-dom';

export default function Homepage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200">

        {/* Hero Section */}
        <div className="flex items-center justify-center w-full h-auto py-20 pr-10">
            <div className="relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl overflow-hidden">
                <img src="/images/screenmock-details-mobile.png" alt="App mockup" className="absolute w-full h-full object-cover" />
            </div>
            <div className="ml-10">
                <h1 className="text-4xl font-bold mb-4">PumpkinPal</h1>
                <p className="text-xl mb-6">An open-source companion app for pumpkin growers</p>
                <Link to="/signup" className="px-8 py-4 green-button rounded text-white text-xl text-white hover:text-white focus:outline-none focus:ring-0 underline-none">Create Account</Link>
            </div>
        </div>


            {/* Features Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full p-8">
                {/* Replace the paths and content with your own */}
                {Array(4).fill().map((_, i) => (
                    <div className="flex flex-col items-center bg-white p-4 rounded">
                        <img src="/logo192.png" alt="Feature" />
                        <h2 className="text-xl mt-4 mb-2">Feature {i+1}</h2>
                        <p>Description of Feature {i+1}</p>
                    </div>
                ))}
            </div>

            {/* Screenshots Section */}
            <div className="w-full px-8">
                <img className="w-full h-auto rounded-lg" src="/images/screenmockup-details.png" alt="App screenshot" />
            </div>

         {/* Call to Action Section */}
        <div className="w-full p-8">
            <p className="mb-6">Sign up to start tracking your pumpkins. We respect your privacy and do not share your data.</p>
            <Link to="/signup" className="px-8 py-2 my-6 green-button rounded text-white text-xl text-white hover:text-white focus:outline-none focus:ring-0 underline-none">Sign Up</Link>
            <p>Already signed up? <Link to="/login" className="text-blue-500">Login here</Link></p>
        </div>



            {/* Footer Section */}
            <div className="w-full py-8 bg-gray-800 text-white text-center">
                <p className="mb-4">This project is open source. Check it out on <a href="https://github.com/ryanmio/PumpkinPal" className="text-blue-500">GitHub</a>.</p>
                <p>© 2023 PumpkinPal. Licensed under the MIT license.</p>
            </div>
        </div>
    );
}
