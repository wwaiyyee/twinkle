import React from 'react';
import Image from 'next/image';
import DashboardCard from './DashboardCard';
import bookImg from './book.png';

export default function WordsLearned() {
    return (
        <DashboardCard title="Words Learned">
            <div className="flex flex-col items-center justify-center h-full pb-2">
                <div className="relative flex flex-col items-center">
                    {/* Cloud Background (CSS shape) */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-28 bg-[#E3F2FD] rounded-full opacity-80 blur-sm -z-10"></div>

                    <div className="text-center z-10 -mt-2">
                        <span className="text-6xl font-black text-[#5D4037] block leading-none">125</span>
                        <span className="text-xl font-bold text-[#8D6E63]">Words</span>
                    </div>

                    <div className="relative w-20 h-20 -mt-2">
                        <Image
                            src={bookImg}
                            alt="Stack of books"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
            </div>
        </DashboardCard>
    );
}
