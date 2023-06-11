import React from 'react';
import { ParallaxProvider, useParallax } from 'react-scroll-parallax';

// Define a FeatureCard component
function FeatureCard({ title, description }) {
    return (
        <div className="feature-card">
            <img src="/logo192.png" alt="Feature" />
            <h2>{title}</h2>
            <p>{description}</p>
        </div>
    );
}

export default function Homepage() {
    const { ref } = useParallax({ speed: 10 });

    return (
        <ParallaxProvider>
            <div ref={ref}>
                <div className="hero">
                    <img src="/hero.png" alt="Hero" />
                </div>

                <div className="features">
                    <FeatureCard title="Feature 1" description="Description of Feature 1" />
                    <FeatureCard title="Feature 2" description="Description of Feature 2" />
                    <FeatureCard title="Feature 3" description="Description of Feature 3" />
                    {/* Add more FeatureCard components as needed */}
                </div>

                <div className="about-us">
                    <h2>About Us</h2>
                    <p>This app is an open source work in progress to help pumpkin growers, and is a passion project.</p>
                </div>

                <div className="join-beta">
                    <h2>Join the Beta Program</h2>
                    <p>We need people to offer their regular feedback to improve the app.</p>
                    <button onClick={() => {/* Add functionality to join the beta program */}}>Join the Beta</button>
                </div>
            </div>
        </ParallaxProvider>
    );
}
