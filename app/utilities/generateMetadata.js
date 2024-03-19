// app/utilities/generateMetadata.js

export const generateMetadata = (page) => {
  // Default metadata, you can customize this based on the page parameter if needed
  return {
    title: 'PumpkinPal: Your Pumpkin Growing Companion',
    description: 'PumpkinPal is a user-friendly, open-source application designed for serious pumpkin growers. Calculate and track the weight of your pumpkins using the OTT method, manage your pumpkins and measurements, and view detailed data all in one place.',
    keywords: 'PumpkinPal, Pumpkin Growing, OTT Weight Calculation, Pumpkin Management, Measurement Management, Pumpkin Detail View, User Profile, Real-Time Updates, Data Backup',
    og: {
      title: 'PumpkinPal: Your Pumpkin Growing Companion',
      description: 'PumpkinPal is a user-friendly, open-source application designed for serious pumpkin growers. Calculate and track the weight of your pumpkins using the OTT method, manage your pumpkins and measurements, and view detailed data all in one place.',
      image: '%PUBLIC_URL%/images/metashare.png',
      url: 'https://pumpkinpal.app'
    },
    twitter: {
      card: 'summary_large_image'
    }
  };
};
