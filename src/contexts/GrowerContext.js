import React, { createContext, useState, useContext } from 'react';

const GrowerContext = createContext();

const GrowerProvider = ({ children }) => {
  const [growerData, setGrowerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <GrowerContext.Provider value={{ growerData, setGrowerData, loading, setLoading, error, setError }}>
      {children}
    </GrowerContext.Provider>
  );
};

export { GrowerProvider, GrowerContext };
