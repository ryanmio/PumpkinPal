import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
const AddPumpkinCard = () => {
  const router = useRouter();

  return (
    <Card className="mb-4 flex flex-col items-center justify-center text-center cursor-pointer border-2 border-dashed border-gray-300 bg-white bg-opacity-80 hover:bg-gray-50 hover:bg-opacity-80" onClick={() => router.push('/add-pumpkin')}>
      <img src="/images/addpumpkinicon.webp" alt="Add pumpkin" className="mt-4 w-12 h-12 opacity-30" />
      <CardHeader>
        <CardTitle className="-mt-4 text-gray-400">Add a new pumpkin</CardTitle>
      </CardHeader>
    </Card>
  );
};


export default AddPumpkinCard;