import React, { useEffect, useState } from 'react';
import { BsPeopleFill, BsClipboardData } from 'react-icons/bs';
import { GiPumpkin } from 'react-icons/gi';
import { db } from '../firebase';
import { doc, getDoc } from "firebase/firestore";
import Spinner from './Spinner';

const StatCard = ({ Icon, label, count }) => (
  <div className="flex flex-col items-center justify-center space-y-2 bg-white shadow-md p-4 rounded-lg">
    <div className="text-4xl text-green-600">
      <Icon />
    </div>
    <div className="text-2xl font-bold">{count}</div>
    <div>{label}</div>
  </div>
);

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const userSnap = await getDoc(doc(db, 'Stats', 'userStats'));
      const pumpkinSnap = await getDoc(doc(db, 'Stats', 'pumpkinStats'));
      const measurementSnap = await getDoc(doc(db, 'Stats', 'measurementStats'));

      setStats({
        userCount: userSnap.data()?.userCount || 0,
        pumpkinCount: pumpkinSnap.data()?.pumpkinCount || 0,
        measurementCount: measurementSnap.data()?.measurementCount || 0,
      });

      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return <Spinner />; // Render your Spinner component while data is loading
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full px-4 sm:px-8 -mx-4 sm:-mx-8 my-8">
      <StatCard Icon={BsPeopleFill} label="Users" count={stats.userCount} />
      <StatCard Icon={GiPumpkin} label="Pumpkins" count={stats.pumpkinCount} />
      <StatCard Icon={BsClipboardData} label="Measurements" count={stats.measurementCount} />
    </div>
  );
};

export default Stats;
