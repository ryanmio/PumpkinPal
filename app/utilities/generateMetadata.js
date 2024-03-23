// app/utilities/generateMetadata.js

export const generateMetadata = (page, additionalData = {}) => {
  // Base URL for your application
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pumpkinpal.app';

  // Default metadata
  let metadata = {
    title: 'PumpkinPal: Your Pumpkin Growing Companion',
    description: 'PumpkinPal is a user-friendly, open-source application designed for serious pumpkin growers. Calculate and track the weight of your pumpkins using the OTT method, manage your pumpkins and measurements, and view detailed data all in one place.',
    keywords: 'PumpkinPal, Pumpkin Growing, OTT Weight Calculation, Pumpkin Management, Measurement Management, Pumpkin Detail View, User Profile, Real-Time Updates, Data Backup',
    og: {
      title: 'PumpkinPal: Your Pumpkin Growing Companion',
      description: 'PumpkinPal is a user-friendly, open-source application designed for serious pumpkin growers. Calculate and track the weight of your pumpkins using the OTT method, manage your pumpkins and measurements, and view detailed data all in one place.',
      image: `${baseUrl}/images/metashare.png`,
      url: `${baseUrl}`, // Default URL, can be overridden
      type: 'website', // Default type, can be overridden
    },
    twitter: {
      card: 'summary_large_image'
    },
    fb: {
      app_id: process.env.NEXT_PUBLIC_FB_APP_ID, // Your Facebook app ID
    }
  };

  // Return the customized metadata
  return metadata;
};