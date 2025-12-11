"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, useFBX, OrbitControls, Environment, useAnimations } from "@react-three/drei";
import RoomNavbar from "../room/components/RoomNavbar";
import Link from "next/link";
import { useRouter } from "next/navigation";

function ChatboxModel() {
    const fbx = useFBX("/hellokitty/helloModel/chatboxwave.fbx");
    const { actions } = useAnimations(fbx.animations, fbx);

    useEffect(() => {
        if (actions) {
            const action = Object.values(actions)[0];
            if (action) {
                action.reset().fadeIn(0.5).play();
            }
        }
    }, [actions]);

    return (
        <primitive object={fbx} scale={0.02} position={[0, -2, 0]} />
    );
}

function FightModel() {
    const fbx = useFBX("/hellokitty/helloModel/fight.fbx");
    const { actions } = useAnimations(fbx.animations, fbx);

    useEffect(() => {
        if (actions) {
            const action = Object.values(actions)[0];
            if (action) {
                action.reset().fadeIn(0.5).play();
            }
        }
    }, [actions]);

    return (
        <primitive object={fbx} scale={0.02} position={[0, -2, 0]} />
    );
}

function ChatBubble({ text }: { text: React.ReactNode }) {
    return (
        <Html position={[0, 2, 0]} center>
            <div className="relative bg-white p-4 rounded-2xl shadow-lg w-96 text-center border-2 border-pink-300">
                <p className="text-lg font-bold text-gray-800 font-dynapuff">
                    {text}
                </p>
                {/* Bubble tail */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-pink-300 rotate-45"></div>
            </div>
        </Html>
    );
}

export default function TalkingSanaPage() {
    const [sceneStep, setSceneStep] = useState(0);
    const router = useRouter();

    useEffect(() => {
        // Switch to Fight after 2 seconds
        const waveTimer = setTimeout(() => {
            setSceneStep(1);
        }, 3000);

        return () => clearTimeout(waveTimer);
    }, []);

    useEffect(() => {
        if (sceneStep === 1) {
            // Navigate back to room after 5 seconds of fighting
            const navTimer = setTimeout(() => {
                router.push('/room');
            }, 5000);
            return () => clearTimeout(navTimer);
        }
    }, [sceneStep, router]);

    return (
        <main className="relative w-full h-screen overflow-hidden">
            {/* Background */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: 'url(/room_room.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            {/* Navbar */}
            <RoomNavbar />

            {/* Home Button */}
            <Link href="/room" className="absolute top-32 left-8 z-50 transition-transform hover:scale-110 active:scale-95">
                <div className="w-16 h-16">
                    <img
                        src="/Navbar/Home.png"
                        alt="Home"
                        className="w-full h-full object-contain drop-shadow-md"
                    />
                </div>
            </Link>

            {/* 3D Scene */}
            <div className="absolute inset-0 z-10">
                <Canvas camera={{ position: [0, -1, 6], fov: 50 }}>
                    <ambientLight intensity={0.7} />
                    <directionalLight position={[5, 5, 5]} intensity={1} />
                    <Environment preset="city" />

                    <Suspense fallback={<Html center>Loading...</Html>}>
                        <group position={[0, -0.5, 0]}>
                            {sceneStep === 0 ? <ChatboxModel /> : <FightModel />}
                            <ChatBubble
                                text={
                                    sceneStep === 0 ? (
                                        <>
                                            HI lets talk!!
                                            <br />
                                            What you want to know today
                                        </>
                                    ) : (
                                        "Should I defend myself or join your dojo?\nHi-yaaa!"
                                    )
                                }
                            />
                        </group>
                    </Suspense>

                    <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 1.8} />
                </Canvas>
            </div>
        </main>
    );
}
