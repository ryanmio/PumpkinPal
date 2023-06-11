import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import { ParallaxProvider, Parallax } from 'react-scroll-parallax';
import { useDarkMode } from './DarkModeContext';

export default function Homepage() {
    const [flipped, set] = useState(false);
    const { colorMode, setColorMode } = useDarkMode();

    const { transform, opacity } = useSpring({
        opacity: flipped ? 1 : 0,
        transform: `perspective(600px) rotateX(${flipped ? 180 : 0}deg)`,
        config: { mass: 5, tension: 500, friction: 80 },
    });

    return (
        <ParallaxProvider>
            <div className={colorMode === 'dark' ? 'dark-mode' : 'light-mode'}>
                <button onClick={() => setColorMode(colorMode === 'dark' ? 'light' : 'dark')}>
                    Toggle Dark Mode
                </button>

                <Parallax y={[-20, 20]} tagOuter="figure">
                    <animated.div
                        className="c"
                        onClick={() => set(state => !state)}
                        style={{
                            opacity: opacity.interpolate(o => 1 - o),
                            transform,
                        }}
                    >
                        {/* Your logo or a placeholder image */}
                        <img src="/logo512.png" alt="Logo" />
                    </animated.div>
                </Parallax>

                {/* Interactive elements, feature showcase, testimonials, and call to action go here */}
                {/* These will depend heavily on your specific application and design */}
            </div>
        </ParallaxProvider>
    );
}
