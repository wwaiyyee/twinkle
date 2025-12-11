'use client';

import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { validateLearnWordData, processToChapters } from './processor';
import { mockAIResult } from './data';
import { LearningStep, LearningState } from './types';
import WordDisplay from './components/WordDisplay';
import SpeechRecognition from './components/SpeechRecognition';
import WordTracing from './components/WordTracing';
import { SpeakerIcon } from './components/Icons';
import { HelloKittyModel } from './components/HelloKitty3D';
import { BookScene } from './components/BookScene';
import { BookPageLayout } from './components/BookPageLayout';
import GameLoader from '../../components/GameLoader';
import LearnWordNavbar from './components/LearnWordNavbar';


export default function LearnWordPage() {
    const [appStarted, setAppStarted] = useState(false);
    const [state, setState] = useState<LearningState | null>(null);
    console.log('LearnWordPage rendered');
    const [currentStep, setCurrentStep] = useState<LearningStep>('SHOW');
    const [error, setError] = useState<string | null>(null);
    const [audioPlaying, setAudioPlaying] = useState(false);
    const [showUI, setShowUI] = useState(false);
    const [audioBlocked, setAudioBlocked] = useState(false);
    const [audioPlayCount, setAudioPlayCount] = useState(0);
    const [isSpeakingFeedback, setIsSpeakingFeedback] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");
    const [isLevelComplete, setIsLevelComplete] = useState(false);


    // Initialize state from mock data
    useEffect(() => {
        try {
            const validated = validateLearnWordData(mockAIResult);
            const chapters = processToChapters(validated);

            const initialState: LearningState = {
                levels: chapters
                    .filter(chapter => chapter.words.length > 0)
                    .map(chapter => ({
                        level: chapter.level,
                        words: chapter.words.map(word => ({
                            word,
                            currentStep: 'SHOW',
                            completed: false
                        })),
                        currentWordIndex: 0,
                        completed: false
                    })),
                currentLevelIndex: 0,
                allCompleted: false
            };

            setState(initialState);
        } catch (err) {
            setError('Failed to load learning data');
            console.error(err);
        }
    }, []);

    // Show UI after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowUI(true);
        }, 4500);
        return () => clearTimeout(timer);
    }, []);

    // Confetti effect when level is complete
    useEffect(() => {
        if (isLevelComplete) {
            const count = 200;
            const defaults = {
                origin: { y: 0.7 },
                zIndex: 1000, // Ensure it's on top
            };

            function fire(particleRatio: number, opts: any) {
                confetti({
                    ...defaults,
                    ...opts,
                    particleCount: Math.floor(count * particleRatio)
                });
            }

            fire(0.25, {
                spread: 26,
                startVelocity: 55,
            });
            fire(0.2, {
                spread: 60,
            });
            fire(0.35, {
                spread: 100,
                decay: 0.91,
                scalar: 0.8
            });
            fire(0.1, {
                spread: 120,
                startVelocity: 25,
                decay: 0.92,
                scalar: 1.2
            });
            fire(0.1, {
                spread: 120,
                startVelocity: 45,
            });
        }
    }, [isLevelComplete]);

    // Auto-play audio when entering SHOW step
    useEffect(() => {
        if (currentStep === 'SHOW' && state && !audioPlaying) {
            // Reset play count when entering SHOW step
            setAudioPlayCount(0);

            // Wait 1 second before attempting to play audio
            const timer = setTimeout(() => {
                // Try to play audio, if blocked due to autoplay policy, mark as blocked
                playAudio(getCurrentWord(), true).catch((err) => {
                    console.log('Auto-play blocked, waiting for user interaction', err);
                    // The audioBlocked state is already set in playAudio's catch block
                });
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [currentStep, state]);

    const getCurrentLevel = () => state?.levels[state.currentLevelIndex];
    const getCurrentWord = () => {
        const level = getCurrentLevel();
        return level?.words[level.currentWordIndex]?.word || '';
    };

    const playFeedback = async (text: string) => {
        try {
            setIsSpeakingFeedback(true);
            setFeedbackText(text);

            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) throw new Error('Failed to generate audio');

            const blob = await response.blob();
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);

            audio.onended = () => {
                setIsSpeakingFeedback(false);
                URL.revokeObjectURL(audioUrl);
            };

            audio.onerror = () => {
                console.error('Error playing feedback audio');
                setIsSpeakingFeedback(false);
                URL.revokeObjectURL(audioUrl);
            };

            await audio.play();
        } catch (error) {
            console.error('Error playing feedback:', error);
            setIsSpeakingFeedback(false);
        }
    };

    const [jumpTrigger, setJumpTrigger] = useState(0);

    const playAudio = async (word: string, isFirstPlay: boolean = false) => {
        setAudioPlaying(true);
        setAudioBlocked(false);
        try {
            let audio: HTMLAudioElement;

            if (word.toLowerCase() === 'jump') {
                // Use local file for "jump"
                audio = new Audio('/audios/jump.MP3');
                // Trigger jump animation
                setJumpTrigger(Date.now());
            } else {
                // Use API for other words
                const response = await fetch('/api/tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: word }),
                });

                if (!response.ok) throw new Error('Failed to generate audio');

                const blob = await response.blob();
                const audioUrl = URL.createObjectURL(blob);
                audio = new Audio(audioUrl);

                // Cleanup blob url after playing
                const originalOnEnded = audio.onended;
                audio.onended = (ev) => {
                    URL.revokeObjectURL(audioUrl);
                    if (originalOnEnded) originalOnEnded.call(audio, ev);
                };
            }

            audio.onended = () => {
                setAudioPlaying(false);
                // If it was a blob URL, it's revoked in the specific handler above or we can do it here if we saved the url

                // Increment play count
                const newCount = audioPlayCount + 1;
                setAudioPlayCount(newCount);

                // Auto-advance logic
                if (currentStep === 'SHOW') {
                    setCurrentStep('REPLAY');
                } else if (currentStep === 'REPLAY') {
                    // If we've played 2 times (1 initial + 1 replay), auto-advance
                    if (newCount >= 2) {
                        handleStepComplete();
                    }
                }
            };

            await audio.play();
        } catch (err: any) {
            console.error('Error playing audio:', err);
            setAudioPlaying(false);

            if (err.name === 'NotAllowedError') {
                // Browser blocked autoplay
                setAudioBlocked(true);
            } else {
                setError('Failed to play audio');
            }
        }
    };



    const handleReplay = () => {
        playAudio(getCurrentWord(), false); // Replay uses regular audio
    };

    const handleStepComplete = () => {
        if (currentStep === 'REPLAY') {
            playFeedback("Wow you did it well! Now let’s try to speak");
            setCurrentStep('SPEAK');
        } else if (currentStep === 'SPEAK') {
            playFeedback("Perfect! Now let’s try write it out");
            setCurrentStep('TRACE');
        } else if (currentStep === 'TRACE') {
            // Always trigger Level Complete when tracing is done for this demo
            setIsLevelComplete(true);
            playFeedback("Congratulations! You completed the first level!");
        }
    };

    const advanceToNextWord = () => {
        if (!state) return;

        const newState = { ...state };
        const currentLevel = newState.levels[newState.currentLevelIndex];

        // Mark current word as completed
        currentLevel.words[currentLevel.currentWordIndex].completed = true;

        // Move to next word
        if (currentLevel.currentWordIndex < currentLevel.words.length - 1) {
            currentLevel.currentWordIndex++;
            setCurrentStep('SHOW');
        } else {
            // Level completed
            currentLevel.completed = true;

            // Move to next level
            if (newState.currentLevelIndex < newState.levels.length - 1) {
                newState.currentLevelIndex++;
                setCurrentStep('SHOW');
            } else {
                // All levels completed
                newState.allCompleted = true;
            }
        }

        setState(newState);
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <div className="p-8 bg-white rounded-2xl shadow-lg">
                    <p className="text-red-600 text-xl font-semibold">{error}</p>
                </div>
            </div>
        );
    }

    // Logic to prepare pages - only if state exists
    let pages: any[] = [];
    let flippedIndex = -1;

    if (state) {
        const currentLevel = state.levels[state.currentLevelIndex];
        const currentWordIndex = currentLevel?.currentWordIndex || 0;

        // Calculate flipped index based on current word and step
        let stepOffset = 0;
        if (currentStep === 'SPEAK') stepOffset = 1;
        if (currentStep === 'TRACE') stepOffset = 2;

        flippedIndex = (currentWordIndex * 3) + stepOffset;

        if (currentLevel) {
            pages = currentLevel.words.flatMap((wordData, wordIndex) => {
                const isCurrentWord = wordIndex === currentLevel.currentWordIndex;

                // Helper to render common right-side layout
                const renderRightPage = (content: React.ReactNode, step: LearningStep, pageNum: number) => (
                    <BookPageLayout pageNumber={pageNum}>
                        <div className="w-full h-full flex flex-col justify-center">
                            {content}
                        </div>
                    </BookPageLayout>
                );

                // Page 1: Listen (SHOW/REPLAY)
                const listenContent = (
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <SpeakerIcon className="w-24 h-24" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800">Listen to the word</h2>
                        <WordDisplay
                            word={wordData.word}
                            onReplay={handleReplay}
                            canReplay={isCurrentWord ? (currentStep === 'REPLAY' ? !audioPlaying : audioBlocked) : false}
                        />

                        {isCurrentWord && currentStep === 'SHOW' && audioPlaying && (
                            <div className="mt-8 flex justify-center">
                                <div className="flex items-center gap-3 text-purple-600">
                                    <div className="w-4 h-4 bg-purple-600 rounded-full animate-pulse"></div>
                                    <span className="text-xl font-semibold">Playing audio...</span>
                                </div>
                            </div>
                        )}

                        {isCurrentWord && currentStep === 'SHOW' && audioBlocked && !audioPlaying && (
                            <div className="mt-8 flex justify-center">
                                <div className="flex items-center gap-3 text-orange-600 animate-bounce">
                                    <span className="text-lg font-semibold">👆 Click the word to play audio</span>
                                </div>
                            </div>
                        )}
                    </div>
                );

                // Page 2: Speak
                const speakContent = (
                    <div className="text-center">
                        <SpeechRecognition
                            targetWord={wordData.word}
                            onSuccess={isCurrentWord ? handleStepComplete : () => { }}
                            onRetry={() => { }}
                        />
                    </div>
                );

                // Page 3: Trace
                const traceContent = (
                    <div className="text-center">
                        <WordTracing
                            word={wordData.word}
                            onComplete={isCurrentWord ? handleStepComplete : () => { }}
                        />
                    </div>
                );

                // Calculate the global index for these pages
                const baseIndex = wordIndex * 4; // Now 4 pages per word

                // Determine speech bubble props
                const isTalking = (isCurrentWord && audioPlaying) || isSpeakingFeedback;
                const speechText = isSpeakingFeedback ? feedbackText : wordData.word;

                return [
                    {
                        left: (
                            <group position={[0, -2, 1.2]} rotation={[0, 0.4, 0]} scale={2.5}>
                                {baseIndex === flippedIndex && (
                                    <HelloKittyModel
                                        autoJump={wordIndex === 0 && currentStep === 'SHOW'}
                                        isTalking={isTalking}
                                        speechText={speechText}
                                        jumpTrigger={jumpTrigger}
                                    />
                                )}
                            </group>
                        ),
                        right: renderRightPage(listenContent, currentStep === 'REPLAY' ? 'REPLAY' : 'SHOW', baseIndex + 1)
                    },
                    {
                        left: (
                            <group position={[0, -2, 1.2]} rotation={[0, 0.4, 0]} scale={2.5}>
                                {(baseIndex + 1) === flippedIndex && (
                                    <HelloKittyModel
                                        isTalking={isTalking}
                                        speechText={speechText}
                                    />
                                )}
                            </group>
                        ),
                        right: renderRightPage(speakContent, 'SPEAK', baseIndex + 2)
                    },
                    {
                        left: (
                            <group position={[0, -2, 1.2]} rotation={[0, 0.4, 0]} scale={2.5}>
                                {(baseIndex + 2) === flippedIndex && (
                                    <HelloKittyModel
                                        isTalking={isTalking}
                                        speechText={speechText}
                                    />
                                )}
                            </group>
                        ),
                        right: renderRightPage(traceContent, 'TRACE', baseIndex + 3)
                    },
                    // Blank Page
                    {
                        left: (
                            <group position={[0, -2, 1.2]} rotation={[0, 0.5, 0]} scale={2.5}>
                                {(baseIndex + 3) === flippedIndex && (
                                    <HelloKittyModel
                                        isTalking={isTalking}
                                        speechText={speechText}
                                    />
                                )}
                            </group>
                        ),
                        right: (
                            <BookPageLayout pageNumber={baseIndex + 4}>
                                <div className="w-full h-full flex flex-col justify-center relative group">
                                    {/* Manual Navigation Arrow for the blank page */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleStepComplete();
                                        }}
                                        className="absolute bottom-4 right-4 p-3 text-purple-600 bg-purple-100 rounded-full transition-all hover:bg-purple-200"
                                        title="Next Page"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                        </svg>
                                    </button>
                                </div>
                            </BookPageLayout>
                        )
                    }
                ];
            });
        }
    }

    const [showExitLoader, setShowExitLoader] = useState(false);
    const [exitLoadingText, setExitLoadingText] = useState("");
    const router = useRouter(); // Ensure useRouter is imported if not already

    const handleHomeClick = () => {
        setExitLoadingText("Going back to room ...");
        setShowExitLoader(true);
    };

    const handleExitLoaderFinished = () => {
        router.push('/room');
    };

    return (
        <main className="bg-black min-h-screen">
            <GameLoader onFinished={() => setAppStarted(true)} loadingText="Opening the book......" />

            {/* Exit Loader */}
            {showExitLoader && (
                <div className="absolute inset-0 z-[200]">
                    <GameLoader onFinished={handleExitLoaderFinished} slideUpOnFinish={false} loadingText={exitLoadingText} />
                </div>
            )}

            {state && (
                <div
                    className={`min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden transition-opacity duration-1000 ${appStarted ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                        backgroundImage: 'url(/bg_book_room.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    {/* Navbar */}
                    <LearnWordNavbar onHomeClick={handleHomeClick} />

                    {/* 3D Book Background */}
                    <div className="fixed inset-0 z-0">
                        <Canvas shadows camera={{
                            position: [-0.5, 1, 4],
                            fov: 45,
                        }}>
                            <group position-y={0}>
                                <Suspense fallback={null}>
                                    <BookScene
                                        pages={pages}
                                        flippedIndex={isLevelComplete ? -1 : flippedIndex}
                                        isLevelComplete={isLevelComplete}
                                    />
                                </Suspense>
                            </group>
                        </Canvas>
                    </div>
                </div>
            )}
        </main>
    );
}
