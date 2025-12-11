'use client';

import { useState, Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader, useVideoTexture } from '@react-three/drei';
import { BookScene } from './components/BookScene';
import { BookPageLayout } from './components/BookPageLayout';
import LearnWordNavbar from './components/LearnWordNavbar';
import ColoredOverlay from './components/ColoredOverlay';
import VisualTrackingMagnifier, { WordWrapper } from './components/VisualTrackingMagnifier';
import Button from './components/Button';

function VideoComponent() {
    const texture = useVideoTexture('/hellokitty/real.mp4');
    return (
        <mesh rotation={[0, 0, 0]} scale={[0.9, 0.9, 1]}>
            <planeGeometry args={[5, 7]} />
            <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
    );
}

export default function DyslexiaPage() {
    const [flippedIndex, setFlippedIndex] = useState(0);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [dyslexiaModeEnabled, setDyslexiaModeEnabled] = useState(true);
    const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

    // Text to display on page 2
    const text = "Here is apple. I like apple.";
    const words = text.split(' ');

    // Reset word index when page changes
    useEffect(() => {
        if (flippedIndex >= 1) {
            setCurrentWordIndex(0);
            // Reset word refs array
            wordRefs.current = new Array(words.length).fill(null);
        }
    }, [flippedIndex, words.length]);

    const handleNextWord = () => {
        if (currentWordIndex < words.length - 1) {
            setCurrentWordIndex(prev => prev + 1);
        }
    };

    const handleWordRef = (ref: HTMLSpanElement | null, index: number) => {
        wordRefs.current[index] = ref;
    };

    // Simple pages for the book - no learning functions
    const pages = [
        {
            left: (
                <group position={[0, 0, 0]}>
                    {/* Empty left page */}
                </group>
            ),
            right: (
                <BookPageLayout pageNumber={1}>
                    <div className="w-full h-full flex flex-col justify-center items-center relative">
                        <div className="relative bg-white p-6 rounded-2xl shadow-xl border-2 border-pink-200 animate-bounce mb-8" style={{ animationDuration: '3s' }}>
                            <div className="text-2xl font-bold text-[#3E2723] text-center font-comic">
                                Hi! lets learn some words today!
                            </div>
                            {/* Bubble tail */}
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-b-2 border-r-2 border-pink-200 transform rotate-45"></div>
                        </div>
                        <img
                            src="/chatbox/hello_kitty_no_background.png"
                            alt="Hello Kitty"
                            className="w-64 h-64 object-contain"
                        />
                    </div>
                </BookPageLayout>
            )
        },
        {
            left: (
                <group position={[0, 0, 0]}>
                    <VideoComponent />
                </group>
            ),
            right: (
                <BookPageLayout pageNumber={2}>
                    <div className="w-full h-full flex flex-col justify-center items-center gap-6 px-8 relative">
                        {/* Visual Tracking Magnifier - Word highlighting only, no circle */}
                        {flippedIndex >= 1 && dyslexiaModeEnabled && (
                            <VisualTrackingMagnifier />
                        )}

                        {/* Text with word-by-word highlighting */}
                        <div className="text-center space-y-4 relative z-10">
                            <div className="text-3xl font-bold leading-relaxed flex flex-wrap justify-center items-center gap-2">
                                {words.map((word, index) => (
                                    <WordWrapper
                                        key={index}
                                        word={word}
                                        index={index}
                                        isCurrent={index === currentWordIndex}
                                        onRef={handleWordRef}
                                        dyslexiaModeEnabled={dyslexiaModeEnabled}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Controls */}
                        {flippedIndex >= 1 && (
                            <div className="flex flex-col gap-4 items-center mt-4 z-10">
                                {/* Dyslexia Mode Toggle */}
                                <Button
                                    onClick={() => setDyslexiaModeEnabled(!dyslexiaModeEnabled)}
                                    variant={dyslexiaModeEnabled ? 'primary' : 'secondary'}
                                >
                                    {dyslexiaModeEnabled ? '✓ Dyslexia Mode On' : 'Dyslexia Mode Off'}
                                </Button>

                                {/* Next Word Button */}
                                {currentWordIndex < words.length - 1 ? (
                                    <Button
                                        onClick={handleNextWord}
                                        variant="primary"
                                        className="mt-2"
                                    >
                                        Next Word →
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="text-green-600 font-bold text-xl">
                                            ✓ Finished Reading!
                                        </div>
                                        <Button
                                            onClick={() => setCurrentWordIndex(0)}
                                            variant="secondary"
                                            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full flex items-center gap-1"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" />
                                                <path d="M3 5v7h7" />
                                            </svg>
                                            Restart
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </BookPageLayout>
            )
        }
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden" style={{
            backgroundImage: 'url(/bg_book_room.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}>
            {/* Navbar */}
            <LearnWordNavbar />

            {/* Home Button */}
            <div className="absolute top-4 right-4 z-50">
                <Button
                    onClick={() => window.location.href = '/room'}
                    variant="secondary"
                    className="flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    Home
                </Button>
            </div>

            {/* Colored Overlay - Only show on page 2 when dyslexia mode is enabled */}
            <ColoredOverlay enabled={dyslexiaModeEnabled && flippedIndex >= 1} />

            {/* 3D Book */}
            <div
                className="fixed inset-0 z-0"
                onClick={(e) => {
                    // Only flip page if clicking on the book area, not on buttons or text
                    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.z-10')) {
                        return;
                    }
                    // Increment flippedIndex when clicked, but don't exceed the number of pages
                    setFlippedIndex(prev => Math.min(prev + 1, pages.length));
                }}
            >
                <Canvas shadows camera={{
                    position: [-0.5, 1, 4],
                    fov: 45,
                }}>
                    <group position-y={0}>
                        <Suspense fallback={null}>
                            <BookScene
                                pages={pages}
                                flippedIndex={flippedIndex}
                                isLevelComplete={false}
                            />
                        </Suspense>
                    </group>
                </Canvas>
                <Loader />
            </div>

            {/* Page Navigation Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4">
                <Button
                    onClick={() => setFlippedIndex(prev => Math.max(0, prev - 1))}
                    variant="secondary"
                    className={`flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg ${flippedIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={flippedIndex === 0}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                    Previous Page
                </Button>

                <Button
                    onClick={() => setFlippedIndex(prev => Math.min(pages.length, prev + 1))}
                    variant="secondary"
                    className={`flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg ${flippedIndex === pages.length ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={flippedIndex === pages.length}
                >
                    Next Page
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </Button>
            </div>
        </div>
    );
}
