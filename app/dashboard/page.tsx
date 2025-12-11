import React from 'react';
import WordsLearned from './components/WordsLearned';
import PlayFrequency from './components/PlayFrequency';
import PerformanceOverview from './components/PerformanceOverview';
import Insights from './components/Insights';
import Image from 'next/image';
import dashboardImg from './components/dashboard.png';

import Link from 'next/link';

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-[#FDF6E3]/50 p-4 font-dynapuff flex items-center justify-center backdrop-blur-sm" style={{ fontFamily: 'var(--font-dynapuff)' }}>
            <div className="w-full max-w-6xl aspect-[16/9] max-h-[90vh] bg-[#FFF9E5] border-[8px] border-[#5D4037] rounded-[3rem] p-8 shadow-2xl relative flex flex-col">
                {/* Home Button */}
                <Link href="/room" className="absolute top-4 right-8 z-50 transition-transform hover:scale-110 active:scale-95">
                    <div className="w-16 h-16">
                        <img
                            src="/Navbar/Home.png"
                            alt="Home"
                            className="w-full h-full object-contain drop-shadow-md"
                        />
                    </div>
                </Link>

                {/* Header */}
                <div className="flex items-center justify-center mb-4 relative shrink-0 gap-4">
                    <div className="relative w-12 h-12">
                        <Image
                            src={dashboardImg}
                            alt="Dashboard Icon"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-center tracking-wide text-[#5D4037]">
                        Dashboard
                    </h1>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
                    {/* Top Row */}
                    <WordsLearned />
                    <PlayFrequency />

                    {/* Bottom Row */}
                    <PerformanceOverview />
                    <Insights />
                </div>
            </div>
        </div>
    );
}
