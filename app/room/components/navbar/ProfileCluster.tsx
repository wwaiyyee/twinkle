"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ProfileCluster() {
    return (
        <div className="pointer-events-auto flex items-center relative">
            <div className="w-28 h-28 flex-shrink-0 z-10 -mr-12 mt-0">
                {/* Avatar */}
                <img
                    src="/Navbar/Avatar.png"
                    alt="Avatar"
                    className="w-full h-full object-contain drop-shadow-md"
                />
            </div>
            <div className="flex flex-col bg-[#FFF5E1] border-4 border-[#5C3A21] shadow-[0_4px_0_#4A2E1A] py-0 pl-14 pr-0 rounded-3xl">
                <span className="font-bold text-[#5C3A21] text-2xl leading-tight ml-1">Twinkle</span>
                <div className="flex items-center -mt-1 -ml-2 relative scale-75 origin-left">
                    {/* Level Number */}
                    <div className="relative z-20 flex items-center justify-center w-10 h-10 -mr-3">
                        <span
                            className="font-black -mr-3 text-5xl text-[#FFE4B5] drop-shadow-[0_1px_0_rgba(0,0,0,0.1)]"
                            style={{
                                WebkitTextStroke: '2px #5C3A21',
                                textShadow: '0 2px 0 #5C3A21'
                            }}
                        >
                            2
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-50 h-4 bg-[#FFF5E1] rounded-full border-4 border-[#5C3A21] overflow-hidden relative shadow-[0_2px_0_#4A2E1A]">
                        {/* Fill */}
                        <div className="w-[70%] h-full bg-gradient-to-b from-[#FFC048] to-[#FFA801] rounded-r-full relative">
                            {/* Shine effect */}
                            <div className="absolute top-0.5 left-0 w-full h-[2px] bg-white/40 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
