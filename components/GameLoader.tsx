import React, { useEffect, useState } from 'react';
import styles from './GameLoader.module.css';
import { useFBX } from "@react-three/drei";
import * as PIXI from "pixi.js";

interface GameLoaderProps {
    onFinished: () => void;
    slideUpOnFinish?: boolean;
    loadingText?: string;
}

const GameLoader: React.FC<GameLoaderProps> = ({ onFinished, slideUpOnFinish = true, loadingText = "Generating the room......" }) => {
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    // Simple state to ensure we don't start progress until video is at least ready to play
    // (Optional for video, but good practice to avoid black box)
    const [videoReady, setVideoReady] = useState(false);

    // Preload Assets
    useEffect(() => {
        // Preload 3D Models
        useFBX.preload("/hellokitty/helloModel/chatboxwave.fbx");
        useFBX.preload("/hellokitty/helloModel/dwarf Idle.fbx");

        // Preload PIXI Textures
        const preloadPixiAssets = async () => {
            try {
                await PIXI.Assets.load([
                    "/room/tiny_room.png",
                    "/room/blade_blade.png",
                    "/room/lleft_curtain.png",
                    "/room/rright_curtain.png"
                ]);
            } catch (e) {
                console.warn("Failed to preload PIXI assets", e);
            }
        };
        preloadPixiAssets();
    }, []);

    useEffect(() => {
        if (!videoReady) return;

        let animationFrameId: number;

        const simulateLoad = () => {
            setProgress((prev) => {
                // Faster increment: random between 2 and 7
                const next = prev + Math.random() * 5 + 2;
                if (next >= 100) {
                    return 100;
                }
                return next;
            });

            if (progress < 100) {
                animationFrameId = requestAnimationFrame(simulateLoad);
            }
        };

        animationFrameId = requestAnimationFrame(simulateLoad);

        return () => cancelAnimationFrame(animationFrameId);
    }, [progress, videoReady]);

    useEffect(() => {
        if (progress >= 100 && !isComplete) {
            setIsComplete(true);
            setTimeout(() => {
                onFinished();
            }, 200); // Reduced delay from 800ms to 200ms
        }
    }, [progress, isComplete, onFinished]);

    return (
        <div className={`${styles.container} ${isComplete && slideUpOnFinish ? styles.slideUp : ''}`}>

            {/* Video Layer */}
            <div className={styles.videoContainer}>
                <video
                    src="/hellokitty/helloModel/dancing.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    onCanPlay={() => setVideoReady(true)}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                />
            </div>

            <div className={styles.inner}>
                <div
                    className={styles.loaderProgress}
                    style={{ opacity: videoReady ? 1 : 0, transition: 'opacity 0.3s' }}
                >
                    <div
                        className={styles.loaderBar}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className={styles.loadingText}>
                    {loadingText}
                </div>
            </div>
        </div>
    );
};

export default GameLoader;
