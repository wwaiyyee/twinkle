import React from 'react';

export default function GameV2Page() {
    return (
        <div className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center">
            <div className="relative w-[90%] h-[90%] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
                <video
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    src="/audios/quiz.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                />
                {/* Content overlay can go here */}
                <div className="relative z-10 flex items-center justify-center w-full h-full">
                    <h1 className="text-4xl font-bold text-white drop-shadow-md">Game V2</h1>
                </div>
            </div>
        </div>
    );
}
