import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { Canvas, useFrame, RootState } from "@react-three/fiber";
import { Center, Float } from "@react-three/drei";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import HelloKitty3D from "../../components/room/HelloKitty3D";
import { BookshelfModel, BookshelfEnvironment } from "@/components/BookshelfScene";
import GameLoader from "../../components/GameLoader";

// Animated wrapper for the bookshelf
const BookshelfAnimatedGroup = ({ visible, onNavigate }: { visible: boolean, onNavigate: (path: string) => void }) => {
    const group = useRef<THREE.Group>(null);
    const targetScale = 0.8;

    useFrame((state: RootState, delta: number) => {
        if (group.current) {
            // Smoothly interpolate scale from 0 to targetScale
            // Using a simple lerp for smooth ease-out effect
            // alpha of ~0.1 at 60fps is good. Using delta to be frame-rate independent-ish.
            // damp formula: lerp(current, target, 1 - exp(-lambda * dt))
            const lambda = 4; // speed factor
            const alpha = 1 - Math.exp(-lambda * delta);

            group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), alpha);
        }
    });

    return (
        <group ref={group} position={[1.5, 0.2, -2]} scale={0} rotation={[0, -0.3, 0]}>
            <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
                <BookshelfModel onNavigate={onNavigate} />
            </Float>
        </group>
    );
};

export default function Room() {
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [showGameLoader, setShowGameLoader] = useState(false);
    const [loadingText, setLoadingText] = useState("Loading...");
    const [targetPath, setTargetPath] = useState<string | null>(null);

    useEffect(() => {
        // ... (existing Pixi logic - unchanged)
        if (!containerRef.current) return;
        const app = new PIXI.Application();
        let isMounted = true;
        let resizeListener: (() => void) | null = null;
        const initApp = async () => { /* ... */             try {
            // Wait for init
            await app.init({
                resizeTo: window,
                backgroundColor: 0xffffff,
            });

            // If unmounted during init, destroy and return
            if (!isMounted) {
                app.destroy(true, { children: true, texture: true });
                return;
            }

            // Append canvas
            if (containerRef.current) {
                containerRef.current.appendChild(app.canvas);
            }

            // Load textures - Use absolute paths for Next.js public folder
            // Use the new background without the blade and curtain
            const bgTexture = await PIXI.Assets.load("/room/tiny_room.png");
            if (!isMounted) return; // Check again after await

            const bg = new PIXI.Sprite(bgTexture);
            bg.anchor.set(0.5);
            app.stage.addChild(bg);

            // Fan Blade
            let fanBlade: PIXI.Sprite | null = null;
            try {
                const fanTexture = await PIXI.Assets.load("/room/blade_blade.png?v=" + Date.now());
                if (isMounted) {
                    fanBlade = new PIXI.Sprite(fanTexture);
                    fanBlade.anchor.set(0.5); // Center anchor for rotation
                    fanBlade.tint = 0xE6D2B5; // Warm beige tint to harmonize with background
                    app.stage.addChild(fanBlade);
                }
            } catch (e) {
                console.warn("Could not load blade_blade.png");
            }

            // Left Curtain
            let leftCurtain: PIXI.Mesh | null = null;
            try {
                const curtainTexture = await PIXI.Assets.load("/room/lleft_curtain.png");
                if (isMounted) {
                    const geometry = new PIXI.PlaneGeometry({
                        width: curtainTexture.width,
                        height: curtainTexture.height,
                        verticesX: 10,
                        verticesY: 10
                    });
                    leftCurtain = new PIXI.Mesh({
                        geometry: geometry,
                        texture: curtainTexture
                    });
                    app.stage.addChild(leftCurtain);
                }
            } catch (e) {
                console.warn("Could not load left curtain.png", e);
            }

            // Right Curtain
            let rightCurtain: PIXI.Mesh | null = null;
            try {
                const rightCurtainTexture = await PIXI.Assets.load("/room/rright_curtain.png");
                if (isMounted) {
                    const geometry = new PIXI.PlaneGeometry({
                        width: rightCurtainTexture.width,
                        height: rightCurtainTexture.height,
                        verticesX: 10,
                        verticesY: 10
                    });
                    rightCurtain = new PIXI.Mesh({
                        geometry: geometry,
                        texture: rightCurtainTexture
                    });
                    app.stage.addChild(rightCurtain);
                }
            } catch (e) {
                console.warn("Could not load right_curtain.png", e);
            }

            // Resize Logic
            const resize = () => {
                if (!isMounted) return;
                const screenWidth = app.screen.width;
                const screenHeight = app.screen.height;

                const bgRatio = bgTexture.width / bgTexture.height;
                const screenRatio = screenWidth / screenHeight;
                let bgScale = 1;

                if (screenRatio > bgRatio) {
                    bg.width = screenWidth;
                    bg.height = screenWidth / bgRatio;
                    bgScale = screenWidth / bgTexture.width;
                } else {
                    bg.height = screenHeight;
                    bg.width = screenHeight * bgRatio;
                    bgScale = screenHeight / bgTexture.height;
                }
                bg.x = screenWidth / 2;
                bg.y = screenHeight / 2;

                if (fanBlade) {
                    const originalWidth = bgTexture.width;
                    const originalHeight = bgTexture.height;
                    const targetX = originalWidth * 0.839;
                    const targetY = originalHeight * 0.440;
                    const offsetX = (targetX - originalWidth / 2) * bgScale;
                    const offsetY = (targetY - originalHeight / 2) * bgScale;
                    fanBlade.x = bg.x + offsetX;
                    fanBlade.y = bg.y + offsetY;
                    fanBlade.scale.set(bgScale * 0.18);
                }

                if (leftCurtain) {
                    const originalWidth = bgTexture.width;
                    const originalHeight = bgTexture.height;
                    const targetX = originalWidth * 0.40;
                    const targetY = originalHeight * 0.05;
                    const offsetX = (targetX - originalWidth / 2) * bgScale;
                    const offsetY = (targetY - originalHeight / 2) * bgScale;
                    const curScale = bgScale * 0.35;
                    leftCurtain.scale.set(curScale);
                    (leftCurtain as any).baseScale = curScale;
                    leftCurtain.x = (bg.x + offsetX) - (leftCurtain.width / 2);
                    leftCurtain.y = (bg.y + offsetY);
                    if (!(leftCurtain as any).originalBuffer) {
                        const buffer = leftCurtain.geometry.getAttribute('aPosition').buffer;
                        (leftCurtain as any).originalBuffer = Float32Array.from(buffer.data as Float32Array);
                    }
                }

                if (rightCurtain) {
                    const originalWidth = bgTexture.width;
                    const originalHeight = bgTexture.height;
                    const targetX = originalWidth * 0.70;
                    const targetY = originalHeight * 0.02;
                    const offsetX = (targetX - originalWidth / 2) * bgScale;
                    const offsetY = (targetY - originalHeight / 2) * bgScale;
                    const curScale = bgScale * 0.35;
                    rightCurtain.scale.set(curScale);
                    (rightCurtain as any).baseScale = curScale;
                    rightCurtain.x = (bg.x + offsetX) - (rightCurtain.width / 2);
                    rightCurtain.y = (bg.y + offsetY);
                    if (!(rightCurtain as any).originalBuffer) {
                        const buffer = rightCurtain.geometry.getAttribute('aPosition').buffer;
                        (rightCurtain as any).originalBuffer = Float32Array.from(buffer.data as Float32Array);
                    }
                }
            };

            resize();
            resizeListener = resize;
            window.addEventListener('resize', resize);

            app.ticker.add((ticker) => {
                if (!isMounted) return;
                const t = ticker.lastTime / 600;

                if (fanBlade) {
                    fanBlade.rotation += 0.15;
                }

                if (leftCurtain && (leftCurtain as any).originalBuffer) {
                    const buffer = leftCurtain.geometry.getAttribute('aPosition').buffer;
                    const original = (leftCurtain as any).originalBuffer;
                    const data = buffer.data as Float32Array;
                    const texHeight = leftCurtain.texture.height;
                    for (let i = 0; i < data.length; i += 2) {
                        const x = original[i];
                        const y = original[i + 1];
                        const heightFactor = y / texHeight;
                        const intensity = Math.pow(heightFactor, 2);
                        const wave = Math.sin(x * 0.02 + t * 4) * 10 + Math.cos(y * 0.05 + t * 3) * 10;
                        data[i] = x + wave * intensity;
                    }
                    buffer.update();
                }

                if (rightCurtain && (rightCurtain as any).originalBuffer) {
                    const buffer = rightCurtain.geometry.getAttribute('aPosition').buffer;
                    const original = (rightCurtain as any).originalBuffer;
                    const data = buffer.data as Float32Array;
                    const texHeight = rightCurtain.texture.height;
                    for (let i = 0; i < data.length; i += 2) {
                        const x = original[i];
                        const y = original[i + 1];
                        const heightFactor = y / texHeight;
                        const intensity = Math.pow(heightFactor, 2);
                        const wave = Math.sin(x * 0.02 + t * 4 + 2.0) * 10 + Math.cos(y * 0.05 + t * 3 + 1.0) * 10;
                        data[i] = x + wave * intensity;
                    }
                    buffer.update();
                }
            });
        } catch (error) {
            console.error("Error initializing Pixi:", error);
        }
        };

        initApp();

        return () => {
            isMounted = false;
            if (resizeListener) {
                window.removeEventListener('resize', resizeListener);
            }
            try {
                if (app.renderer) {
                    app.destroy(true, { children: true, texture: true });
                }
            } catch (e) { }
        };
    }, []);

    const [showBookshelf, setShowBookshelf] = useState(false);
    const [isHelloKittyLoaded, setIsHelloKittyLoaded] = useState(false);
    const [helloFinished, setHelloFinished] = useState(false);

    // Show bookshelf 3 seconds after HelloKitty appears
    useEffect(() => {
        if (!isHelloKittyLoaded) return;

        const delaySeconds = 3;
        const timer = setTimeout(() => {
            setShowBookshelf(true);
        }, delaySeconds * 1000);

        return () => clearTimeout(timer);
    }, [isHelloKittyLoaded]);

    const handleNavigate = (path: string) => {
        setTargetPath(path);
        if (path === '/learnword') {
            setLoadingText("Opening the book......");
        } else if (path === '/game') {
            setLoadingText("Creating the scene......");
        } else {
            setLoadingText("Loading......");
        }
        setShowGameLoader(true);
    };

    const handleGameLoaderFinished = () => {
        if (targetPath) {
            router.push(targetPath);
        }
    };

    return (
        <div className="relative w-full h-full">
            {/* Pixi Container */}
            <div
                ref={containerRef}
                className="fixed inset-0 w-full h-full bg-white"
                style={{
                    backgroundImage: 'url(/room/tiny_room.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            {/* 3D Overlay */}
            <div className="fixed inset-0 pointer-events-none z-10">
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ alpha: true }} style={{ background: 'transparent' }}>
                    {/* Environment and Effects - Always rendered to prevent blinking */}
                    <BookshelfEnvironment showShadows={false} />

                    {/* Note: ambientLight might be duplicated if inside BookshelfEnvironment,
                        but we removed the standalone one here to be safe.
                        BookshelfEnvironment has ambientLight(0.15) and directionalLight.
                        HelloKitty might need more light if she was relying on the previous ambient(0.5).
                        Let's add a dedicated light for her if needed, or trust the environment.
                    */}
                    <ambientLight intensity={0.4} />

                    <HelloKitty3D
                        onLoad={() => setIsHelloKittyLoaded(true)}
                        onHelloComplete={() => setHelloFinished(true)}
                        showSecondBubble={showBookshelf}
                    />

                    {/* Bookshelf Model - Always rendered, visibility controlled by prop */}
                    <BookshelfAnimatedGroup visible={showBookshelf} onNavigate={handleNavigate} />
                </Canvas>
            </div>

            {/* Game Loader Overlay */}
            {showGameLoader && (
                <div className="absolute inset-0 z-[200] pointer-events-auto">
                    <GameLoader onFinished={handleGameLoaderFinished} slideUpOnFinish={false} loadingText={loadingText} />
                </div>
            )}
        </div>
    );
}
