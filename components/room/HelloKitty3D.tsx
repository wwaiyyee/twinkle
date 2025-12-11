import React, { useEffect, useState, useRef } from "react";
import { useFBX, useAnimations, Html } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface HelloKitty3DProps {
    onHelloComplete?: () => void;
    onLoad?: () => void;
    showSecondBubble?: boolean;
}

export default function HelloKitty3D({ onHelloComplete, onLoad, showSecondBubble = false }: HelloKitty3DProps = {}) {
    const group = useRef<any>(null);
    const waveFbx = useFBX("/hellokitty/helloModel/chatboxwave.fbx");
    const idleFbx = useFBX("/hellokitty/helloModel/dwarf Idle.fbx");
    const { viewport } = useThree();

    // Trigger onLoad when component mounts (meaning FBX is loaded)
    useEffect(() => {
        if (onLoad) {
            onLoad();
        }
    }, [onLoad]);

    // Prepare animations
    const animations: THREE.AnimationClip[] = [];
    if (waveFbx.animations && waveFbx.animations.length > 0) {
        waveFbx.animations[0].name = "Wave";
        animations.push(waveFbx.animations[0]);
    }
    if (idleFbx.animations && idleFbx.animations.length > 0) {
        idleFbx.animations[0].name = "Idle";
        animations.push(idleFbx.animations[0]);
    }

    const { actions, mixer } = useAnimations(animations, group);

    const [currentVariant, setCurrentVariant] = useState<"center" | "corner">("center");

    // Animation state
    const targetState = useRef({
        scale: 0.015,
        x: 0,
        y: -1.8,
        z: 0,
        rotateY: 0,
    });

    const currentState = useRef({
        scale: 0.015,
        x: 0,
        y: -1.8,
        z: 0,
        rotateY: 0,
    });

    useEffect(() => {
        if (!actions || !actions["Wave"] || !actions["Idle"]) {
            console.warn("HelloKitty3D: Missing required actions (Wave or Idle)");
            return;
        }

        const waveAction = actions["Wave"];
        const idleAction = actions["Idle"];

        // Setup Wave: Play once, clamp at end
        waveAction.reset().setLoop(THREE.LoopOnce, 1).play();
        waveAction.clampWhenFinished = true;

        // Setup Idle: Loop forever
        idleAction.setLoop(THREE.LoopRepeat, Infinity);

        // Listener for when Wave finishes
        const onFinished = (e: any) => {
            if (e.action === waveAction) {
                // Crossfade to Idle
                waveAction.fadeOut(0.5);
                idleAction.reset().fadeIn(0.5).play();

                // Trigger move to corner
                setCurrentVariant("corner");

                // Call the completion callback if provided
                if (onHelloComplete) {
                    onHelloComplete();
                }
            }
        };

        mixer.addEventListener("finished", onFinished);

        return () => {
            mixer.removeEventListener("finished", onFinished);
        };
    }, [actions, mixer, onHelloComplete]);

    // Update target state when variant changes
    useEffect(() => {
        if (currentVariant === "center") {
            targetState.current = {
                scale: 0.015,
                x: 0,
                y: -1.8,
                z: 0,
                rotateY: 0,
            };
        } else {
            targetState.current = {
                scale: 0.015, // Keep same scale as center
                x: -2.0, // More to the left
                y: -1.8, // Keep same Y position
                z: 0,
                rotateY: 0.2, // Slight turn to the right
            };
        }
    }, [currentVariant, viewport.width, viewport.height]);

    // Animate towards target state
    useFrame(() => {
        if (!group.current) return;

        const lerpSpeed = 0.05; // Adjust for animation speed

        currentState.current.scale = THREE.MathUtils.lerp(
            currentState.current.scale,
            targetState.current.scale,
            lerpSpeed
        );
        currentState.current.x = THREE.MathUtils.lerp(
            currentState.current.x,
            targetState.current.x,
            lerpSpeed
        );
        currentState.current.y = THREE.MathUtils.lerp(
            currentState.current.y,
            targetState.current.y,
            lerpSpeed
        );
        currentState.current.z = THREE.MathUtils.lerp(
            currentState.current.z,
            targetState.current.z,
            lerpSpeed
        );
        currentState.current.rotateY = THREE.MathUtils.lerp(
            currentState.current.rotateY,
            targetState.current.rotateY,
            lerpSpeed
        );

        group.current.scale.setScalar(currentState.current.scale);
        group.current.position.set(
            currentState.current.x,
            currentState.current.y,
            currentState.current.z
        );
        group.current.rotation.y = currentState.current.rotateY;
    });

    return (
        <group ref={group}>
            <primitive object={waveFbx} />
            {/* Add a light specifically for the model if needed */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1.5} />

            {/* Chat Bubble - Only visible in center */}
            {currentVariant === "center" && (
                <Html position={[0, 180, 0]} center>
                    <div style={{
                        background: 'white',
                        padding: '16px 24px', // Increased padding
                        borderRadius: '20px', // Increased radius
                        borderBottomLeftRadius: '0',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        fontFamily: 'sans-serif',
                        fontSize: '24px', // Increased font size
                        fontWeight: 'bold',
                        color: '#333',
                        whiteSpace: 'nowrap',
                        position: 'relative',
                        marginBottom: '20px'
                    }}>
                        Hello my friend !
                        <div style={{
                            position: 'absolute',
                            left: '0',
                            bottom: '-10px',
                            width: '0',
                            height: '0',
                            borderLeft: '10px solid white',
                            borderBottom: '10px solid transparent',
                            borderTop: '0'
                        }} />
                    </div>
                </Html>
            )}

            {/* Second Chat Bubble - Visible in corner when triggered */}
            {currentVariant === "corner" && showSecondBubble && (
                <Html position={[0, 180, 0]} center>
                    <div style={{
                        background: 'white',
                        padding: '16px 24px',
                        borderRadius: '20px',
                        borderBottomLeftRadius: '0',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        fontFamily: 'sans-serif',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#333',
                        whiteSpace: 'nowrap',
                        position: 'relative',
                        marginBottom: '20px'
                    }}>
                        What is the materials you want to choose?
                        <div style={{
                            position: 'absolute',
                            left: '0',
                            bottom: '-10px',
                            width: '0',
                            height: '0',
                            borderLeft: '10px solid white',
                            borderBottom: '10px solid transparent',
                            borderTop: '0'
                        }} />
                    </div>
                </Html>
            )}
        </group>
    );
}

// Preload the models
useFBX.preload("/hellokitty/helloModel/chatboxwave.fbx");
useFBX.preload("/hellokitty/helloModel/dwarf Idle.fbx");
