# PumpkinPal: An Open-Source Pumpkin OTT Weight Calculator App 
[![Live Web App](https://img.shields.io/badge/-Live%20Web%20App-80876E?style=for-the-badge&logo=Canonical&logoColor=white)](https://pumpkinpal.app)

[![Demo Account](https://img.shields.io/badge/-Demo%20Account-80876E?style=for-the-badge&logo=OpenAccess&logoColor=white)](https://pumpkinpal.app/login/?demo=true)

<img src="https://raw.githubusercontent.com/ryanmio/PumpkinPal/main/public/logo.png" align="right" alt="PumpkinPal Logo" width="150">

     
## 🚧 Project Status: Early Access

PumpkinPal is an open-source app that helps competitive pumpkin growers enter and track their pumpkin-growing journey. This app is in development. Feel free to visit the live app at pumpkinpal.app.

## 🎯 Project Overview

The goal of this project is to develop a user-friendly, open-source application for competitive pumpkin growers to calculate and track the weight of their pumpkins using the OTT method. The app's primary users are hobbyists in the giant pumpkin growing community.

## Core Features

- **Weight Calculation**: The app uses the Over The Top (OTT) formula to calculate the estimated weight of the pumpkins. It provides an easy-to-use input form that growers can use in the field to enter their measurements. The OTT method, which takes into account the circumference of the pumpkin and its side-to-side and stem-to-blossom measurements, is a widely accepted estimation technique in the pumpkin-growing community.

- **Dashboard**: The dashboard provides users with an overview of their pumpkins and all the data they have collected. It displays a list of the user's pumpkins, along with key details and options to view more information, edit details, or add new measurements.

- **Data Visualization**: The PumpkinDetail component displays detailed information about a single pumpkin, including a line graph visualizing the pumpkin's growth over time. This graph, powered by React Chartjs 2, plots the estimated weight of the pumpkin against time, providing growers with a visual representation of their pumpkin's growth trend. The MeasurementsCard component presents the raw data in a tabular format, allowing growers to see each individual measurement they've recorded.

- **Data Export**: Users have the ability to export their data for further analysis or record-keeping. This feature provides flexibility and control to the users over their data, ensuring they can use it outside the app in whatever way they find most useful.

![Export GIF](https://raw.githubusercontent.com/ryanmio/PumpkinPal/main/public/images/exportdemo.gif)

   
## Tech Stack

### Frontend:
- **React.js**: The backbone of the application, providing a robust framework for building the user interface.
- **Tailwind CSS**: A utility-first CSS framework used for styling the application.

### Backend:
- **Firebase**: Used for user authentication and real-time database management.

### Libraries:
- **React Router Dom**: A standard routing library for React, used to navigate between different components in the application.
- **React Hot Toast**: A lightweight notification library for React apps used to provide customizable toast notifications to the user.
- **React Chartjs 2**: A wrapper for Chart.js, a powerful data visualization library for JavaScript.

![Graph GIF](https://raw.githubusercontent.com/ryanmio/PumpkinPal/main/public/images/graphdemo.gif)

### Why React? 🔄

I opted to develop this app in React because I believe React is the best framework for coding with AI assistance using tools like ChatGPT or GitHub Co-Pilot. This is because of its popularity, component-based architecture, and existing integrations.

- **Popularity**: React.js is one of the most popular JavaScript libraries, boasting a large community of developers and a wealth of resources. This popularity ensures that solutions to common problems are readily available in most LLMs training data.

- **Component-Based Architecture**: React's component-based architecture is ideal for developing with AI assistance. Components can be isolated and worked on individually, making it easier to ask for help or use AI tools like ChatGPT. This modular approach also allows for code reuse, simplifies the codebase, and helps fit into LLM token limits and context windows.

- **Integration with Emerging Technologies**: React integrates well with other emerging technologies like Pinecone, OpenAI's API, and LangChain. This compatibility ensures that PumpkinPal can leverage these technologies to enhance its functionality and stay at the forefront of technological advancements.

### Why Firebase? 🔥

I considered various options, including setting up a MERN (MongoDB, Express.js, React.js, Node.js) stack. However, I ultimately decided to streamline the process with a Backend as a Service (BaaS) provider. Firebase emerged as the clear choice for its simplicity, real-time capabilities, scalability, ease of integration, and cost-effectiveness, making it a perfect fit for a small-scale application like PumpkinPal.

- **Simplicity**: Firebase's suite of cloud-based services, including a NoSQL database (Firestore), user authentication, and cloud storage, offers a level of simplicity that's hard to beat. This eliminates the need for managing servers or writing APIs, allowing me to focus on the frontend and user experience. This simplicity is particularly beneficial when developing with AI assistance, as it reduces the complexity of the tasks the AI needs to perform.

- **Real-time Capabilities**: The real-time capabilities of Firebase Firestore are a significant advantage for an application like PumpkinPal, where users are frequently adding and updating data. Real-time updates ensure the app feels responsive and the data is always up-to-date, enhancing the user experience.

- **Scalability**: Scalability is another key consideration. Firebase is designed to handle large amounts of data and heavy user loads, ensuring the app can grow without performance issues. This scalability is crucial as the user base of the app grows, and Firebase's ability to easily accommodate the increased traffic and data is a major plus.

- **Ease of Integration**: Firebase's seamless integration with React.js simplifies the connection between the frontend and backend, allowing for faster development and reducing the potential for errors. This ease of integration is particularly beneficial when working with AI tools, as it allows the AI to focus on the logic and functionality rather than the intricacies of connecting disparate systems.

- **Cost-Effective**: Firebase's free tier and pay-as-you-go pricing make it a cost-effective choice for a passion project. This allows the app to have a robust backend infrastructure at little or no cost.

In essence, Firebase provides a robust, scalable, and cost-effective backend solution that enhances the app's responsiveness and user experience while keeping the development process simple and efficient.

### Why Tailwind CSS? 🎨

Tailwind CSS was chosen as the styling framework for PumpkinPal for its inline styling approach, AI compatibility, and overall developer experience.

- **Inline Styling Approach**: Tailwind CSS's inline styling approach, where styles are applied directly to HTML elements, is a game-changer for AI-assisted development. It allows the entire context, including the HTML structure and styles, to be visible in a single snippet, eliminating the need to reference separate CSS files. This approach simplifies the task for AI tools like ChatGPT, making it easier to ask for help or use AI tools to generate or modify styles.

- **AI Compatibility**: The popularity of Tailwind CSS also plays a significant role in its compatibility with AI tools. As a widely-used framework, AI tools like large language models (LLMs) are well-versed in it. This familiarity allows LLMs to provide accurate and useful assistance when working with Tailwind CSS, enhancing the AI-assisted development experience.

- **Developer Experience**: Tailwind CSS provides a highly efficient and flexible way to style applications. Its utility-first approach allows for highly customizable designs without leaving your HTML. This makes it a joy to work with, even for self-taught, novice developers like myself.

### Error Handling and Notifications 🚦

The application employs `react-hot-toast` to manage notifications and provide feedback to the user about the success or failure of various operations. This library provides a simple and intuitive API for creating toast notifications from anywhere within the application.

![Toast GIF](https://raw.githubusercontent.com/ryanmio/PumpkinPal/main/public/images/toastdemo.gif)

### Calculating OTT

The estimated weight of the pumpkin is calculated based on the Over-the-Top (OTT) method, which involves adding the measurements from end to end, side to side, and around the circumference of the pumpkin.

The calculation is made by first adding the three measurements together to get the OTT. The OTT value is then fed into a two-part formula that estimates the weight of the pumpkin based on various growth factors.

The first part of the formula ((14.2 / (1 + 7.3 * Math.pow(2, -(ott) / 96))) ** 3 + (ott / 51) ** 2.91) - 8 is an empirically derived relationship between OTT and pumpkin weight. The second part * 0.993 applies a slight correction factor to the weight.

If the computed weight turns out to be less than 0 (which can happen if someone measures a small/young pumpkin), we set the weight to 0. The result is then rounded to two decimal places to give a more readable weight estimate.

```javascript
const calculateEstimatedWeight = (endToEnd, sideToSide, circumference, measurementUnit) => {
    let ott = parseFloat(endToEnd) + parseFloat(sideToSide) + parseFloat(circumference);
    if (measurementUnit === 'cm') {
      ott /= 2.54;  // Convert cm to inches
    }
    let weight = (((14.2 / (1 + 7.3 * Math.pow(2, -(ott) / 96))) ** 3 + (ott / 51) ** 2.91) - 8) * 0.993;

    // If weight is less than 0, set it to 0
    if (weight < 0) {
      weight = 0;
    }

    return weight.toFixed(2);  // round to 2 decimal places
};
```

This formula is the crux of the PumpkinPal app and what enables pumpkin growers to track and predict their pumpkins' weight throughout the growing season based on their measurements.

### Field-Friendly Features
The PumpkinPal app incorporates several design principles to ensure ease of use in a field environment, especially while wearing gloves. 

1. **Big inputs and touch targets:** Recognizing that our users may be interacting with the app with gloves on, we've designed our input fields and touch targets to be large enough to accommodate these circumstances. This is achieved through custom CSS rules that boost the default size attributes of the HTML input elements.

2. **Smart defaults for data entry:** The app intelligently fetches the most recent measurement for each pumpkin from the Firebase backend and prepopulates the fields with these values whenever a new measurement is being entered. This functionality is implemented via a useEffect hook in the AddMeasurement component that triggers whenever the selectedPumpkin state changes, so the user can select any pumpkin from the dropdown to have the defaults update automatically.

3. **Dynamic measurement unit selection:** The app pulls the user's preferred measurement unit from Firebase and uses it as the default unit. However, the user also has the option to override this default on-the-fly for individual measurements, providing flexibility when it's needed.

Here's what it looks like in action:<br>
<img src="https://raw.githubusercontent.com/ryanmio/PumpkinPal/main/public/images/entrydemo.gif" width="50%" alt="Data Entry GIF">

### Future Development

Several enhancements and new features are planned, including improvements to the UI, additional data features, enhancements to the dashboard, new features like a chatbot and a to-do list functionality, integration with BigPumpkins.com, and user experience improvements.


## 📁 Current Project Directory

```plaintext
.
├── firebase-debug.log
├── firebase.json
├── functions
│   └── index.js
├── node_modules
├── package-lock.json
├── package.json
├── public
│   ├── _redirects
│   ├── apple-touch-icon.png
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── favicon.ico
│   ├── images
│   │   ├── addpumpkinicon.png
│   │   ├── addpumpkinicon.webp
│   │   ├── logowide.png
│   │   ├── logowide.webp
│   │   ├── metashare.png
│   │   ├── screenmock-details-mobile.png
│   │   ├── screenmock-details-mobile.webp
│   │   ├── screenmockup-details.png
│   │   └── screenmockup-details.webp
│   ├── index.html
│   ├── logo.png
│   ├── logo.webp
│   ├── logo192.png
│   ├── logo192.webp
│   ├── logo512.png
│   ├── logowide.png
│   ├── logowide.webp
│   ├── manifest.json
│   └── robots.txt
├── README.md
└── src
    ├── App.css
    ├── App.js
    ├── App.test.js
    ├── components
    │   ├── AddMeasurement.js
    │   ├── AutoComplete.js
    │   ├── DarkModeContext.js
    │   ├── Dashboard.js
    │   ├── DateInput.js
    │   ├── Dropdown.js
    │   ├── EditMeasurement.js
    │   ├── EditPumpkin.js
    │   ├── GraphCard.js
    │   ├── Header.js
    │   ├── Homepage.js
    │   ├── icons
    │   │   ├── CalendarIcon.js
    │   │   ├── PlusIcon.js
    │   │   └── TableCellsIcon.js
    │   ├── InstructionsModal.js
    │   ├── Login.js
    │   ├── Logout.js
    │   ├── MeasurementInput.js
    │   ├── MeasurementsCard.js
    │   ├── PumpkinDetail.js
    │   ├── PumpkinForm.js
    │   ├── Register.js
    │   ├── Spinner.js
    │   └── UserProfile.js
    ├── firebase.js
    ├── index.css
    ├── index.js
    ├── logo.svg
    ├── tailwind.css
    └── tailwind.config.js
```

As I progress through development, this README will be updated with user instructions, contribution guidelines, and more. Please consider starring this repo and stay tuned!
