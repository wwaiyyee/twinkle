'use client';

import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useFBX, useAnimations, OrbitControls, Environment, Html } from '@react-three/drei';

function TestModel() {
    const fbx = useFBX('/hellokitty/helloModel/dancingspin.fbx');
    const { actions, names } = useAnimations(fbx.animations, fbx);

    useEffect(() => {
        if (names.length > 0) {
            actions[names[0]]?.reset().fadeIn(0.5).play();
        }
    }, [actions, names]);

    return (
        <group scale={0.035}>
            <primitive object={fbx} />
        </group>
    );
}

export default function TestPage() {
    return (
        <div className="w-screen h-screen bg-black text-white">
            <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
                <ambientLight intensity={1} />
                <directionalLight position={[5, 10, 5]} intensity={1} />
                <Suspense fallback={null}>
                    <TestModel />
                    <Environment preset="city" />
                </Suspense>
                <OrbitControls />
            </Canvas>
        </div>
    );
}
