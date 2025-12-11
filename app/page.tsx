"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import ThreeScene from "../components/ThreeScene";
import Loader from "../components/Loader";
import ChatBox from "../components/ChatBox";
import GameLoader from "../components/GameLoader";

const Home: React.FC = () => {
  const router = useRouter();
  // State to track if the preloader is finished and 3D animations should start
  const [appStarted, setAppStarted] = useState(false);
  // State to track if chatbox should be open (open automatically when app starts)
  const [isChatboxOpen, setIsChatboxOpen] = useState(false);
  // State to track if the game loader should be shown
  const [showGameLoader, setShowGameLoader] = useState(false);

  const handlePromptSubmit = (prompt: string) => {
    // Close chatbox and show game loader instead of immediate redirect
    setIsChatboxOpen(false);
    setShowGameLoader(true);
  };

  const handleGameLoaderFinished = () => {
    router.push('/room');
  };

  return (
    <>
      <Head>
        <title>Twinkle</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Pinyon+Script&family=Inter:wght@300;400;500;600&family=Space+Mono&display=swap" rel="stylesheet" />
      </Head>

      <div className="relative w-full h-screen overflow-hidden">

        {/* RENDER THE 3D SCENE, PASSING THE START SIGNAL */}
        <ThreeScene start={appStarted} onStartJourney={() => setIsChatboxOpen(true)} />

        {/* --- LOADER --- */}
        <Loader onFinished={() => setAppStarted(true)} />

        {/* Game Loader Overlay */}
        {showGameLoader && (
          <div className="absolute inset-0 z-[200]">
            <GameLoader onFinished={handleGameLoaderFinished} slideUpOnFinish={false} loadingText="Generating the room......" />
          </div>
        )}

        {/* Corner Elements (Fade in when app starts) */}
        <div
          className="absolute top-8 left-8 text-sm font-bold tracking-widest text-black transition-opacity duration-1000"
          style={{ opacity: appStarted ? 0.8 : 0 }} // Fade in based on state
        >
          TWINKLE
        </div>
        <div
          className="absolute top-8 right-8 text-[12px] uppercase tracking-widest text-black transition-opacity duration-1000"
          style={{ opacity: appStarted ? 0.4 : 0 }}
        >
          © 2025 /
        </div>

        {/* ChatBox - Only show when app started and game loader is not showing */}
        {appStarted && !showGameLoader && (
          <ChatBox
            isOpen={isChatboxOpen}
            onClose={() => setIsChatboxOpen(false)}
            onSubmit={handlePromptSubmit}
          />
        )}

      </div>
    </>
  );
};

export default Home;