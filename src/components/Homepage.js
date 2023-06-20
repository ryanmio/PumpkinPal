import React from 'react';
import { Link } from 'react-router-dom';

export default function Homepage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200">

        {/* Hero Section */}
        <div className="flex flex-col sm:flex-row items-center justify-center w-full h-auto py-20 sm:pr-10">
            <div className="relative mx-auto border-gray-800 bg-gray-800 border-[5%] sm:border-[14px] rounded-[2.5rem] h-[60vw] w-[30vw] sm:h-[600px] sm:w-[300px] shadow-xl overflow-hidden">
                <div className="relative w-full h-full overflow-hidden rounded-[2rem]">
                    <img src="/images/screenmock-details-mobile.png" alt="App mockup" className="absolute w-full h-full object-cover" />
                </div>
            </div>
            <div className="mt-10 sm:mt-0 sm:ml-10">
                <h1 className="text-4xl font-bold mb-4">PumpkinPal</h1>
                <p className="text-xl mb-6">An open-source companion app for pumpkin growers</p>
                <Link to="/signup" className="px-4 py-2 sm:px-8 sm:py-4 green-button rounded text-white text-lg sm:text-xl text-white hover:text-white focus:outline-none focus:ring-0 underline-none no-underline">Create Account</Link>
            </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-11/12 sm:w-full px-4 sm:p-8">
            {[
                { title: "Pumpkin Dashboard", description: "View an overview of all your pumpkins and the data you've collected."},
                { title: "OTT Weight Calculation", description: "Calculate the OTT weight of your pumpkins and track progress over time."},
                { title: "Pumpkin Management", description: "Add new pumpkins to your profile, edit existing ones, and delete them with ease. Keep track of each pumpkin's name, description, lineage, and key dates."},
                { title: "Data Export", description: "Export your pumpkin's data as a CSV file for further analysis or record-keeping."},
                { title: "Real-Time Data Entry", description: "Enter your measurements as you take them. The app updates in real time, so your data is always current and accessible from any device."},
                { title: "Data Backup", description: "Never worry about losing your measurement data. All measurements are automatically backed up in the cloud, ensuring that your data is safe and secure."},
                { title: "Field-Friendly Interface", description: "The app's user-friendly interface is designed with field use in mind. Large, easy-to-tap buttons and simple forms make it easy to enter data even with gloves on."},
                { title: "Instant Weight Estimation", description: "As soon as you enter a new measurement, the app calculates the estimated weight of your pumpkin. This allows you to track your pumpkin's growth in real time, right from the field."},
            ].map((feature, i) => (
                <div className="flex flex-col items-center bg-white p-4 rounded" key={i}>
                    <img src="/logo192.png" alt="Feature" />
                    <h2 className="text-xl mt-4 mb-2">{feature.title}</h2>
                    <p className="text-sm sm:text-base">{feature.description}</p>
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
    <Link to="/signup" className="px-8 py-2 mb-8 green-button rounded text-white text-xl text-white hover:text-white focus:outline-none focus:ring-0 underline-none no-underline font-bold">Sign Up</Link>
    <p className="mt-2">Already signed up? <Link to="/login" className="text-blue-500">Login here</Link></p>
</div>




            {/* Footer Section */}
            <div className="w-full py-8 bg-gray-800 text-white text-center">
                <p className="mb-4">This project is open source. Check it out on <a href="https://github.com/ryanmio/PumpkinPal" className="text-blue-500">GitHub</a>.</p>
                <p>© 2023 PumpkinPal. Licensed under the MIT license.</p>
            </div>
        </div>
    );
}
