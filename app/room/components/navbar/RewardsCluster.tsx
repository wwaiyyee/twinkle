"use client";

import React from "react";
import { motion } from "framer-motion";

export default function RewardsCluster() {
    return (
        <div className="pointer-events-auto flex items-center gap-4 mt-4">
            {/* Stars */}
            <div className="flex items-center gap-2 bg-[#FFF5E1] border-4 border-[#5C3A21] shadow-[0_4px_0_#4A2E1A] py-0 pr-6 pl-8 rounded-3xl ml-6 relative">
                <motion.div
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.2, rotate: 180 }}
                    className="w-16 h-16 flex items-center justify-center -ml-14 z-10"
                >
                    <img src="/Navbar/Star.png" alt="Star" className="w-full h-full object-contain drop-shadow-sm" />
                </motion.div>
                <span className="font-black text-2xl text-[#5C3A21] font-mono">62</span>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-2 bg-[#FFF5E1] border-4 border-[#5C3A21] shadow-[0_4px_0_#4A2E1A] py-0 pr-6 pl-8 rounded-3xl ml-6 relative">
                <motion.div
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.2, rotate: 20 }}
                    className="w-16 h-16 flex items-center justify-center -ml-14 z-10"
                >
                    <img src="/Navbar/Coins.png" alt="Coins" className="w-full h-full object-contain drop-shadow-sm" />
                </motion.div>
                <span className="font-black text-2xl text-[#5C3A21] font-mono">13,960</span>
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm cursor-pointer hover:bg-green-600 transition-colors">
                    +
                </div>
            </div>
        </div>
    );
}
