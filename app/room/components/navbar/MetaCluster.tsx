"use client";

import Link from "next/link";

export default function MetaCluster() {
    return (
        <div className="pointer-events-auto flex flex-col gap-3 items-end mt-4">
            <div className="flex items-center gap-3">
                {/* Dashboard Button */}
                <Link href="/dashboard" className="bg-[#FFF5E1] border-4 border-[#5C3A21] shadow-[0_4px_0_#4A2E1A] py-0 pr-6 pl-8 rounded-3xl ml-6 relative flex items-center gap-2 hover:bg-[#FFE4B5] transition-colors group">
                    <div className="w-16 h-16 flex items-center justify-center -ml-14 z-10">
                        <img src="/Navbar/Dashboard.png" alt="Dashboard" className="w-full h-full object-contain drop-shadow-sm" />
                    </div>
                    <span className="font-bold text-[#5C3A21] text-xl">Dashboard</span>
                </Link>

                {/* Attention Meter */}
                <div className="bg-[#FFF5E1] border-4 border-[#5C3A21] shadow-[0_4px_0_#4A2E1A] py-0 pr-6 pl-8 rounded-3xl ml-6 relative flex items-center gap-3 w-48">
                    <div className="w-16 h-16 flex items-center justify-center -ml-14 z-10">
                        <img src="/Navbar/Time.png" alt="Focus Time" className="w-full h-full object-contain drop-shadow-sm" />
                    </div>
                    <div className="flex flex-col flex-1 py-2">
                        <span className="text-s font-bold text-[#5C3A21] uppercase">Focus Time</span>
                        <div className="w-full h-2 bg-[#FFE4B5] rounded-full mt-1 overflow-hidden border border-[#5C3A21]">
                            <div className="w-3/4 h-full bg-gradient-to-r from-orange-300 to-yellow-400 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                {/* Parent Survey */}
                <button className="bg-[#FFF5E1] w-12 h-12 rounded-2xl border-4 border-[#5C3A21] shadow-[0_4px_0_#4A2E1A] flex items-center justify-center text-xl hover:bg-[#FFE4B5] transition-colors relative group">
                    <img src="/Navbar/Survey.png" alt="Survey" className="w-9 h-9 object-contain" />
                </button>

                {/* Shop */}
                <button className="bg-[#FFF5E1] w-12 h-12 rounded-2xl border-4 border-[#5C3A21] shadow-[0_4px_0_#4A2E1A] flex items-center justify-center text-xl hover:bg-[#FFE4B5] transition-colors relative group">
                    <img src="/Navbar/Shop.png" alt="Shop" className="w-9 h-9 object-contain" />
                </button>

                {/* Notifications */}
                <button className="bg-[#FFF5E1] w-12 h-12 rounded-2xl border-4 border-[#5C3A21] shadow-[0_4px_0_#4A2E1A] flex items-center justify-center text-xl hover:bg-[#FFE4B5] transition-colors relative">
                    <img src="/Navbar/Noti.png" alt="Notifications" className="w-9 h-9 object-contain" />
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse" />
                </button>
            </div>
        </div>
    );
}
