'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useFBX, useAnimations, Text, Environment, OrbitControls, Cloud, useTexture } from '@react-three/drei';

import * as THREE from 'three';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// --- Constants ---
const LANE_WIDTH = 2; // Width of each lane
const RUN_SPEED = 15; // Units per second
const LANE_SWITCH_SPEED = 20; // Speed of lateral movement

// --- Types ---
type Lane = -1 | 0 | 1; // Left, Middle, Right

// --- Components ---

function Player({
    lane,
    setZPosition,
    active
}: {
    lane: Lane,
    setZPosition: (z: number) => void,
    active: boolean
}) {
    const group = useRef<THREE.Group>(null);
    // Load Model and Animation from the same file
    const fbx = useFBX('/hellokitty/helloModel/FastRun-2.fbx');

    // Extract animations from the loaded FBX
    const { actions } = useAnimations(fbx.animations, group);

    useEffect(() => {
        // Play the first animation available
        if (actions) {
            const actionName = Object.keys(actions)[0];
            const action = actions[actionName];

            if (action) {
                // Fix: Remove position tracks to prevent root motion (snapping back)
                // Use a more robust regex to catch all position-related tracks
                const clip = action.getClip();
                clip.tracks = clip.tracks.filter(track => !track.name.match(/position/i));

                // Ensure the action loops
                action.setLoop(THREE.LoopRepeat, Infinity);
                action.clampWhenFinished = false;

                action.reset().fadeIn(0.5).play();
            }
            return () => {
                action?.fadeOut(0.5);
            };
        }
    }, [actions]);

    useFrame((state, delta) => {
        if (!group.current) return;

        if (active) {
            // 1. Forward Movement (Negative Z)
            group.current.position.z -= RUN_SPEED * delta;
            setZPosition(group.current.position.z);

            // 2. Lateral Movement (Lerp to target lane)
            const targetX = lane * LANE_WIDTH;
            group.current.position.x = THREE.MathUtils.lerp(
                group.current.position.x,
                targetX,
                LANE_SWITCH_SPEED * delta
            );
        }

        // 3. Camera Follow
        // Keep camera behind and slightly above player
        state.camera.position.z = group.current.position.z + 8;
        state.camera.position.x = group.current.position.x / 2; // Slight parallax
        state.camera.lookAt(group.current.position.x, group.current.position.y + 1, group.current.position.z - 5);
    });

    return (
        <group ref={group} dispose={null} scale={0.01}>
            <primitive object={fbx} rotation={[0, Math.PI, 0]} />
        </group>
    );
}

function Rock({ position, scale = 1, visible = true }: { position: [number, number, number], scale?: number, visible?: boolean }) {
    if (!visible) return null;
    return (
        <mesh position={position} scale={scale} castShadow receiveShadow>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#808080" roughness={0.9} />
        </mesh>
    );
}

function Explosion({ position, onComplete }: { position: [number, number, number], onComplete: () => void }) {
    const particles = useMemo(() => {
        return new Array(15).fill(0).map(() => ({
            velocity: [
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10 + 5, // Upward bias
                (Math.random() - 0.5) * 10
            ] as [number, number, number],
            scale: Math.random() * 0.3 + 0.1,
            offset: [
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5
            ] as [number, number, number]
        }));
    }, []);

    const group = useRef<THREE.Group>(null);
    const [time, setTime] = useState(0);

    useFrame((state, delta) => {
        setTime(t => t + delta);
        if (time > 1.5) {
            onComplete();
            return;
        }

        if (group.current) {
            group.current.children.forEach((child, i) => {
                const p = particles[i];
                child.position.x += p.velocity[0] * delta;
                child.position.y += p.velocity[1] * delta;
                child.position.z += p.velocity[2] * delta;

                // Gravity
                p.velocity[1] -= 20 * delta;

                // Rotation
                child.rotation.x += delta * 2;
                child.rotation.z += delta * 2;
            });
        }
    });

    return (
        <group ref={group} position={position}>
            {particles.map((p, i) => (
                <mesh key={i} position={p.offset} scale={p.scale}>
                    <dodecahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial color="#606060" />
                </mesh>
            ))}
        </group>
    );
}

function AnswerGate({
    position,
    text,
    color = "#ff0000",
    showRock = true
}: {
    position: [number, number, number],
    text: string,
    color?: string,
    showRock?: boolean
}) {
    return (
        <group position={position}>
            {/* Rock behind text - Moved further back */}
            <Rock position={[0, 1, -1.5]} scale={1.5} visible={showRock} />
            {/* Gate Frame Removed */}

            {/* Answer Text - Moved slightly forward */}
            <Text
                position={[0, 2, 0.5]}
                fontSize={1}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.05}
                outlineColor={color}
            >
                {text}
            </Text>
        </group>
    );
}

function Mushroom({ position }: { position: [number, number, number] }) {
    const fbx = useFBX('/gardenAssets/mushroom.fbx');
    return <primitive object={fbx.clone()} position={position} scale={0.05} />;
}

import { Tree } from '@/components/garden/Tree';

function BeachEnvironment() {
    const sandTexture = useTexture('/hellokitty/sand.png');
    const grassTexture = useTexture('/gardenAssets/grasstexture.png');

    // Configure texture repeating
    sandTexture.wrapS = THREE.RepeatWrapping;
    sandTexture.wrapT = THREE.RepeatWrapping;
    sandTexture.repeat.set(1, 100);

    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(20, 100);

    // Generate some random decorations along the track
    const decorations = useMemo(() => {
        const items = [];
        for (let z = 0; z > -1000; z -= 10) {
            // Left side trees
            if (Math.random() > 0.3) {
                items.push(<Tree key={`l-${z}`} position={[-5 - Math.random() * 5, 0, z]} />);
            }

            // Right side trees
            if (Math.random() > 0.3) {
                items.push(<Tree key={`r-${z}`} position={[5 + Math.random() * 5, 0, z]} />);
            }

            // Mushrooms
            if (Math.random() > 0.7) {
                items.push(<Mushroom key={`m-l-${z}`} position={[-4 - Math.random() * 3, 0, z]} />);
            }
            if (Math.random() > 0.7) {
                items.push(<Mushroom key={`m-r-${z}`} position={[4 + Math.random() * 3, 0, z]} />);
            }
        }
        return items;
    }, []);

    return (
        <group>
            {/* Grass Ground (Base) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, -500]} receiveShadow>
                <planeGeometry args={[200, 1000]} />
                <meshStandardMaterial map={grassTexture} />
            </mesh>

            {/* Runway with Sand Texture */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, -500]} receiveShadow>
                <planeGeometry args={[8, 1000]} />
                <meshStandardMaterial map={sandTexture} />
            </mesh>

            {decorations}

            {/* Floating Clouds Background */}
            <Cloud opacity={0.5} scale={4} position={[0, -20, -100]} speed={0.2} segments={40} />
            <Cloud opacity={0.5} scale={4} position={[-50, 10, -80]} speed={0.2} segments={40} />
            <Cloud opacity={0.5} scale={4} position={[50, 10, -80]} speed={0.2} segments={40} />
            <Cloud opacity={0.3} scale={5} position={[0, 30, -150]} speed={0.1} segments={40} />
            <Cloud opacity={0.4} scale={3} position={[-30, -10, -60]} speed={0.3} segments={30} />
            <Cloud opacity={0.4} scale={3} position={[30, -10, -60]} speed={0.3} segments={30} />
        </group>
    );
}


function StartScreen({ onStart }: { onStart: () => void }) {
    return (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 mb-6">
                    Math Runner
                </h1>
                <p className="text-slate-600 mb-8 text-lg font-medium">Solve the math, choose the lane!</p>
                <button
                    onClick={onStart}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xl font-bold rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all active:scale-95"
                >
                    Start Game
                </button>
            </div>
        </div>
    );
}

function Sparkles() {
    const [exploded, setExploded] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setExploded(true));
    }, []);

    const sparkles = useMemo(() => Array.from({ length: 40 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const radius = 200 + Math.random() * 200; // Explode radius
        return {
            id: i,
            endX: Math.cos(angle) * radius,
            endY: Math.sin(angle) * radius,
            color: ['#FFD700', '#FFA500', '#FFFFFF'][Math.floor(Math.random() * 3)],
            delay: Math.random() * 0.2,
            scale: 0.5 + Math.random() * 1
        };
    }), []);

    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible">
            {sparkles.map(s => (
                <div
                    key={s.id}
                    className={`absolute rounded-full transition-all duration-1000 ease-out ${exploded ? 'opacity-0' : 'opacity-100'}`}
                    style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: s.color,
                        transform: exploded
                            ? `translate(${s.endX}px, ${s.endY}px) scale(0)`
                            : `translate(0px, 0px) scale(${s.scale})`,
                        transitionDelay: `${s.delay}s`
                    }}
                />
            ))}
        </div>
    );
}

function GameOverScreen({ result, onRestart }: { result: 'correct' | 'wrong', onRestart: () => void }) {
    const isWin = result === 'correct';
    const router = useRouter();

    useEffect(() => {
        if (isWin) {
            const timer = setTimeout(() => {
                router.push('/room');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isWin, router]);

    if (isWin) {
        return (
            <div
                onClick={onRestart}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md cursor-pointer"
            >
                <div className="relative flex items-center justify-center">
                    <Sparkles />
                    <div className="relative w-[700px] h-[700px] animate-in zoom-in duration-500">
                        <Image
                            src="/welldone.png"
                            alt="Well Done"
                            fill
                            className="object-contain drop-shadow-[0_0_50px_rgba(255,215,0,0.5)]"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="bg-white p-10 rounded-3xl shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-300 text-center">
                <div className="text-6xl mb-4">💥</div>
                <h2 className="text-4xl font-black mb-2 text-red-500">
                    Wrong Answer!
                </h2>
                <p className="text-slate-500 mb-8 text-lg">
                    Oops! Better luck next time.
                </p>
                <button
                    onClick={onRestart}
                    className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white text-xl font-bold rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all active:scale-95"
                >
                    Play Again
                </button>
            </div>
        </div>
    );
}

export default function GamePage() {
    const [lane, setLane] = useState<Lane>(0);
    const [playerZ, setPlayerZ] = useState(0);
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'correct' | 'wrong'>('menu');
    const [gameId, setGameId] = useState(0); // Used to reset the scene
    const [explosions, setExplosions] = useState<{ id: number, position: [number, number, number] }[]>([]);
    const [explodedGates, setExplodedGates] = useState<Set<number>>(new Set()); // Track which gates have exploded

    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

    // Quiz Configuration
    const quizzes = useMemo(() => [
        {
            question: "1 + 2 = ?",
            answers: [
                { text: "4", lane: -1, isCorrect: false }, // Left
                { text: "3", lane: 1, isCorrect: true },   // Right
            ],
            zDistance: -50
        },
        {
            question: "3 + 1 = ?",
            answers: [
                { text: "4", lane: -1, isCorrect: true }, // Left
                { text: "5", lane: 1, isCorrect: false }, // Right
            ],
            zDistance: -100
        }
    ], []);

    const currentQuiz = quizzes[currentQuizIndex] || quizzes[quizzes.length - 1];

    const startGame = () => {
        setGameState('playing');
    };

    const resetGame = () => {
        setGameId(prev => prev + 1);

        setLane(0);
        setPlayerZ(0);
        setCurrentQuizIndex(0);
        setExplosions([]);
        setExplodedGates(new Set());
        setGameState('playing'); // Restart immediately
    };

    // Handle Input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState !== 'playing') return;

            if (e.key === 'a' || e.key === 'A') {
                setLane(prev => Math.max(prev - 1, -1) as Lane);
            } else if (e.key === 'd' || e.key === 'D') {
                setLane(prev => Math.min(prev + 1, 1) as Lane);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState]);

    // Check Collision / Answer Logic
    useEffect(() => {
        if (gameState !== 'playing') return;

        // Check if player has passed the gate
        // Player moves in negative Z. Gate is at quiz.zDistance (e.g., -50).
        // When playerZ <= -50, they have passed/hit the gate.
        // Check if player has passed the current gate
        const activeQuiz = quizzes[currentQuizIndex];
        if (!activeQuiz) return;

        if (playerZ <= activeQuiz.zDistance + 1) { // +1 buffer
            // Determine which answer was chosen
            const chosenAnswer = activeQuiz.answers.find(a => a.lane === lane);

            if (chosenAnswer) {
                if (chosenAnswer.isCorrect) {
                    // Trigger explosion if not already exploded
                    const gateId = currentQuizIndex * 10 + activeQuiz.answers.indexOf(chosenAnswer);

                    if (!explodedGates.has(gateId)) {
                        setExplosions(prev => [...prev, {
                            id: Date.now(),
                            position: [chosenAnswer.lane * LANE_WIDTH, 0, activeQuiz.zDistance]
                        }]);
                        setExplodedGates(prev => new Set(prev).add(gateId));

                        // Move to next quiz if available, otherwise win or loop? 
                        // For now, let's just show "Correct" briefly or keep running?
                        // The original logic showed a "Correct" screen which stopped the game.
                        // If we want multiple questions, we shouldn't stop on the first one.

                        if (currentQuizIndex < quizzes.length - 1) {
                            // Advance to next question
                            setCurrentQuizIndex(prev => prev + 1);
                            // Don't show game over screen, just continue
                        } else {
                            // Final question answered correctly
                            setGameState('correct');
                        }
                    }
                } else {
                    setGameState('wrong');
                }
            } else {
                // Middle lane or empty lane - if they pass the gate without hitting an answer?
                // The original logic assumed they MUST hit something or it's wrong?
                // If they are in the middle (lane 0) and there is no answer there, they just run past?
                // But the gates are usually blocking.
                // Let's assume they must pick a side.
                setGameState('wrong');
            }
        }
    }, [playerZ, lane, gameState]);

    return (
        <div className="w-full h-screen bg-gradient-to-b from-sky-400 to-blue-200 relative overflow-hidden">
            {/* UI Overlay */}
            <div className="absolute top-0 left-0 w-full h-full z-10 flex flex-col items-center justify-center pointer-events-none">

                {/* Quiz Header - Always Visible */}
                <div className="absolute top-8 bg-white/90 backdrop-blur px-8 py-4 rounded-2xl shadow-xl transform transition-transform duration-500 hover:scale-105">
                    <h1 className="text-4xl font-bold text-slate-800 text-center">Quiz</h1>
                    <p className="text-6xl font-black text-indigo-600 mt-2 text-center">{currentQuiz.question}</p>
                </div>

                {/* Menu / Start Screen */}
                {gameState === 'menu' && (
                    <div className="pointer-events-auto bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl flex flex-col items-center space-y-6 animate-bounce-slight">
                        <h2 className="text-2xl font-bold text-slate-700">Ready to Race?</h2>
                        <button
                            onClick={() => setGameState('playing')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold py-4 px-12 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95"
                        >
                            Start Game
                        </button>
                    </div>
                )}

                {/* Game Over / Result Screen */}
                {(gameState === 'correct' || gameState === 'wrong') && (
                    <div className="pointer-events-auto bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl flex flex-col items-center space-y-6">
                        <h2 className={`text-4xl font-black ${gameState === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
                            {gameState === 'correct' ? 'Correct!' : 'Try Again!'}
                        </h2>
                        <p className="text-slate-600 text-lg">
                            {gameState === 'correct' ? 'Great job!' : 'Oops, that was the wrong answer.'}
                        </p>
                        <button
                            onClick={() => {
                                setPlayerZ(0);
                                setLane(0);
                                setCurrentQuizIndex(0);
                                setGameState('playing');
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold py-3 px-8 rounded-full shadow-lg transition-all hover:scale-105"
                        >
                            Play Again
                        </button>
                    </div>
                )}
            </div>

            {/* Screens */}
            {gameState === 'menu' && <StartScreen onStart={startGame} />}
            {
                (gameState === 'correct' || gameState === 'wrong') && (
                    <GameOverScreen result={gameState} onRestart={resetGame} />
                )
            }

            {/* Controls Hint */}
            <div className="absolute bottom-8 left-0 w-full text-center z-10 pointer-events-none transition-opacity duration-300" style={{ opacity: gameState === 'playing' ? 1 : 0 }}>
                <p className="text-white/80 text-sm font-mono font-bold drop-shadow-md">Press 'A' to move Left • Press 'D' to move Right</p>
            </div>

            {/* 3D Scene */}
            <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
                <ambientLight intensity={0.8} />
                <directionalLight
                    position={[50, 50, 25]}
                    intensity={1.5}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                />
                <Environment preset="sunset" />

                {/* Game Content - Reset on gameId change */}
                <group key={gameId}>
                    <Player lane={lane} setZPosition={setPlayerZ} active={gameState === 'playing'} />
                    <BeachEnvironment />

                    {/* Render Answer Gates for ALL quizzes */}
                    {quizzes.map((q, qIndex) => (
                        <group key={qIndex}>
                            {q.answers.map((ans, aIndex) => (
                                <AnswerGate
                                    key={`${qIndex}-${aIndex}`}
                                    position={[ans.lane * LANE_WIDTH, 0, q.zDistance]}
                                    text={ans.text}
                                    color={ans.isCorrect ? "#4ade80" : "#f87171"}
                                    showRock={!explodedGates.has(qIndex * 10 + aIndex)}
                                />
                            ))}
                        </group>
                    ))}

                    {/* Render Explosions */}
                    {explosions.map(expl => (
                        <Explosion
                            key={expl.id}
                            position={expl.position}
                            onComplete={() => setExplosions(prev => prev.filter(e => e.id !== expl.id))}
                        />
                    ))}
                </group>

                <fog attach="fog" args={['#87CEEB', 20, 100]} />
            </Canvas>
        </div >
    );
}