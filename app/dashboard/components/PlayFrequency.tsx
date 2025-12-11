import React from 'react';
import Image from 'next/image';
import DashboardCard from './DashboardCard';
import smallBar from './smallbar.png';
import mediumBar from './mediumbar.png';
import longBar from './longbar.png';

const data = [
    { day: 'Mon', bar: mediumBar, height: '65%' },
    { day: 'Tue', bar: smallBar, height: '35%' },
    { day: 'Wed', bar: longBar, height: '85%' },
    { day: 'Thu', bar: mediumBar, height: '55%' },
    { day: 'Fri', bar: longBar, height: '95%' },
    { day: 'Sat', bar: smallBar, height: '45%' },
    { day: 'Sun', bar: mediumBar, height: '75%' },
];

export default function PlayFrequency() {
    return (
        <DashboardCard title="Play Frequency" subtitle="Daily Average: 20 mins">
            <div className="flex justify-between h-32 px-2 pt-4 pb-2">
                {data.map((item, index) => (
                    <div key={index} className="flex flex-col items-center justify-end h-full gap-2 group w-full">
                        <div
                            className="relative w-8 transition-all duration-300 group-hover:scale-105"
                            style={{ height: item.height }}
                        >
                            <Image
                                src={item.bar}
                                alt={`${item.day} usage`}
                                fill
                                className="object-fill" // Stretch to fill the height
                            />
                        </div>
                        <span className="text-sm font-bold text-[#5D4037]">{item.day}</span>
                    </div>
                ))}
            </div>
        </DashboardCard>
    );
}
