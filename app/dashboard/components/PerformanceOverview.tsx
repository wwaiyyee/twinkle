import React from 'react';
import Image from 'next/image';
import DashboardCard from './DashboardCard';
import starImg from './star.png';

const PerformanceRow = ({ label, stars, status, color }: { label: string, stars: number, status: string, color: string }) => (
    <div className="flex items-center gap-2 mb-3">
        <span className="w-24 text-base font-bold text-[#5D4037] text-right">{label}:</span>

        {/* Stars */}
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="relative w-5 h-5">
                    <Image
                        src={starImg}
                        alt="star"
                        fill
                        className={`object-contain ${i <= stars ? 'opacity-100' : 'opacity-30 grayscale'}`}
                    />
                </div>
            ))}
        </div>

        {/* Progress Bar / Status Pill */}
        <div className="flex-1 h-6 rounded-full border-2 border-[#5D4037]/10 overflow-hidden relative flex items-center px-2 ml-1">
            <div
                className="absolute left-0 top-0 bottom-0 opacity-40"
                style={{ width: '100%', backgroundColor: color }}
            ></div>
            <span className="relative z-10 text-xs font-bold text-[#5D4037] truncate">{status}</span>
        </div>
    </div>
);

export default function PerformanceOverview() {
    return (
        <DashboardCard title="Performance Overview">
            <div className="flex flex-col justify-center h-full py-2">
                <PerformanceRow label="Audio" stars={4} status="Excellent (5 stars)" color="#E57373" />
                <PerformanceRow label="Tracing" stars={3} status="Good (4 stars)" color="#AED581" />
                <PerformanceRow label="Speaking" stars={2} status="Fair (3 stars)" color="#FFD54F" />
            </div>
        </DashboardCard>
    );
}
