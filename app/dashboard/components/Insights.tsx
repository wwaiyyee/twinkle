import React from 'react';
import DashboardCard from './DashboardCard';

export default function Insights() {
    return (
        <DashboardCard title="Insights">
            <div className="flex flex-col justify-center h-full space-y-6 px-4 relative py-4">
                <div className="space-y-2 text-center mt-2">
                    <p className="text-xl font-bold text-[#5D4037]">
                        Needs Focus: <span className="text-[#E57373]">Consonant Blends</span>
                    </p>
                    <p className="text-xl font-bold text-[#5D4037]">
                        Next Steps: <span className="text-[#4DB6AC]">Advanced Vocabulary</span>
                    </p>
                </div>

                {/* Decorative ABCs */}
                <div className="absolute bottom-1 right-3 flex flex-col items-end opacity-60 pointer-events-none scale-75 origin-bottom-right">
                    <span className="text-4xl font-black text-[#9575CD] transform rotate-12">C</span>
                    <span className="text-4xl font-black text-[#FFD54F] transform -rotate-12 mr-4">B</span>
                    <span className="text-5xl font-black text-[#E57373] transform rotate-6">A</span>
                </div>
            </div>
        </DashboardCard>
    );
}
