"use client";

import React from "react";
import ProfileCluster from "./navbar/ProfileCluster";
import RewardsCluster from "./navbar/RewardsCluster";
import MetaCluster from "./navbar/MetaCluster";

export default function RoomNavbar() {
    return (
        <div className="absolute top-0 left-0 w-full px-6 pt-0 grid grid-cols-3 items-start pointer-events-none z-50 font-dynapuff" style={{ fontFamily: 'var(--font-dynapuff)' }}>
            {/* Left Cluster - Profile */}
            <div className="justify-self-start">
                <ProfileCluster />
            </div>

            {/* Middle Cluster - Global Rewards */}
            <div className="justify-self-center">
                <RewardsCluster />
            </div>

            {/* Right Cluster - Meta Controls */}
            <div className="justify-self-end">
                <MetaCluster />
            </div>
        </div>
    );
}
