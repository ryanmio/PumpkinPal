import React from 'react';
import { Link } from 'react-router-dom';

export default function Homepage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200">

       {/* Hero Section */}
<div className="flex flex-col md:flex-row items-center justify-center w-full h-auto py-10 md:py-20 md:pr-10">
    <div className="relative mx-auto w-1/2 md:w-[294px] md:h-[588px]">
        <div style={{ paddingBottom: 'calc(1500 / 736 * 100%)' }} className="relative w-full h-0 md:h-full">
            <img src="/images/screenmock-details-mobile.webp" alt="App mockup" className="absolute top-0 left-0 w-full h-full object-cover" />
        </div>
    </div>
    <div className="mt-10 md:mt-0 md:ml-10 text-center md:text-left md:w-[294px] mx-auto">
        <h1 className="text-4xl font-bold mb-4">PumpkinPal</h1>
        <p className="text-xl mb-6 px-2">An open-source companion app for pumpkin growers</p>
        <Link to="/register" className="px-4 py-2 md:px-8 md:py-4 green-button rounded text-white text-lg md:text-xl text-white hover:text-white focus:outline-none focus:ring-0 underline-none no-underline">Create Account</Link>
    </div>
</div>



    {/* Features Section */}
<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full px-4 sm:px-8 -mx-4 sm:-mx-8 mb-8">
    {[
        { title: "Pumpkin Dashboard", description: "View an overview of all your pumpkins and the data you've collected."},
        { title: "OTT Weight Calculation", description: "Calculate the OTT weight of your pumpkins and track progress over time."},
        { title: "Pumpkin Management", description: "Add new pumpkins to your profile, edit existing ones."},
        { title: "Data Export", description: "Export your pumpkin's data as a CSV file for further analysis or record-keeping."},
        { title: "Real-Time Data Entry", description: "Enter your measurements as you take them. Your data is instantly accessible from any device."},
        { title: "Data Backup", description: "All measurements are automatically backed up in the cloud."},
        { title: "Field-Friendly Interface", description: "Large, easy-to-tap buttons and simple forms make it easy to enter data even with gloves on."},
        { title: "Instant Weight Estimation", description: "As soon as you enter a measurement you will know your pumpkin's weight, right from the field."},
    ].map((feature, i) => (
        <div className="flex flex-col items-center bg-white px-3 py-4 sm:p-4 rounded" key={i}>
            <img src="/logo192.webp" alt="Feature" className="w-6/12 h-auto sm:w-1/4 lg:w-3/8" />
            <h2 className="text-xl mt-4 mb-2">{feature.title}</h2>
            <p className="text-sm sm:text-base">{feature.description}</p>
        </div>
    ))}
</div>

{/* Screenshots Section */}
<div className="w-full px-8">
    <div className="px-4 sm:px-6 lg:px-32">
        <img className="w-full h-auto rounded-lg" src="/images/screenmockup-details.webp" alt="App screenshot" />
    </div>
</div>


       {/* Call to Action Section */}
<div className="w-full p-8">
    <p className="mb-6">We respect your privacy and will never share your information. Pumpkin data is encrypted and stored separately from user data so that your pumpkin measurements are always secure.</p>
    <Link to="/register" className="px-8 py-2 mb-8 green-button rounded text-white text-xl text-white hover:text-white focus:outline-none focus:ring-0 underline-none no-underline font-bold">Sign Up</Link>
    <p className="mt-3">Already signed up? <Link to="/login" className="text-blue-500">Login here</Link></p>
</div>




           {/* Footer Section */}
<div className="App-footer py-8 px-4 md:px-8 lg:px-16">
    <p className="mb-2">This project is open source. Check it out on <a href="https://github.com/ryanmio/PumpkinPal" style={{color: '#F2EEE3'}}>GitHub</a>.</p>
    <p className="mb-2">© 2023 PumpkinPal.</p>
</div>
</div>
);
}
