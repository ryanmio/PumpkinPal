import React, { useEffect, useState } from 'react';
import { BsPeopleFill, BsClipboardData } from 'react-icons/bs';
import { GiPumpkin } from 'react-icons/gi';
import { db } from '../firebase';
import { doc, getDoc } from "firebase/firestore";
import { IconContext } from "react-icons";

const StatCard = ({ Icon, label, count }) => (
  <div className="flex flex-col items-center justify-center px-4 py-2 border-r border-gray-200 flex-1">
    <div className="flex items-center justify-center w-10 h-10 mb-3 rounded-full">
      <IconContext.Provider value={{ color: "#80876E", size: "2em" }}>
        <Icon />
      </IconContext.Provider>
    </div>
    <h6 className="text-4xl font-bold">{count !== null ? count : '--'}</h6>
    <p className="mb-2 font-bold text-md">{label}</p>
  </div>
);

const Stats = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const userSnap = await getDoc(doc(db, 'Stats', 'userStats'));
      const pumpkinSnap = await getDoc(doc(db, 'Stats', 'pumpkinStats'));
      const measurementSnap = await getDoc(doc(db, 'Stats', 'measurementStats'));

      setStats({
        userCount: userSnap.data()?.userCount,
        pumpkinCount: pumpkinSnap.data()?.pumpkinCount,
        measurementCount: measurementSnap.data()?.measurementCount,
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-4">
      <div className="flex w-full max-w-screen-lg bg-white shadow-md rounded-lg p-4">
        <StatCard Icon={BsPeopleFill} label="Users" count={stats?.userCount} />
        <StatCard Icon={GiPumpkin} label="Pumpkins" count={stats?.pumpkinCount} />
        <StatCard Icon={BsClipboardData} label="Measurements" count={stats?.measurementCount} />
      </div>
    </div>
  );
};

export default Stats;
