"use client";

import React from "react";
import Link from "next/link";

export default function LearnWordNavbar() {
    return (
        <div className="absolute top-0 left-0 w-full px-6 pt-0 flex justify-between items-start z-50 pointer-events-none">
            {/* Left - Title */}
            <div className="pointer-events-auto">
                <img
                    src="/Navbar/LearnwordTitle.png"
                    alt="Learn Word"
                    className="h-20 object-contain drop-shadow-md"
                />
            </div>

            {/* Right - Home Button */}
            <div className="pointer-events-auto">
                <Link href="/room">
                    <div className="w-16 h-16 transition-transform hover:scale-110 active:scale-95 cursor-pointer">
                        <img
                            src="/Navbar/Home.png"
                            alt="Home"
                            className="w-full h-full object-contain drop-shadow-md"
                        />
                    </div>
                </Link>
            </div>
        </div>
    );
}
