'use client';

import { useState } from 'react';

interface ColoredOverlayProps {
    enabled: boolean;
    color?: string;
    opacity?: number;
}

export default function ColoredOverlay({ enabled, color = '#FFE5B4', opacity = 0.3 }: ColoredOverlayProps) {
    if (!enabled) return null;

    return (
        <div
            className="fixed inset-0 pointer-events-none z-40"
            style={{
                backgroundColor: color,
                opacity: opacity,
                mixBlendMode: 'multiply',
            }}
        />
    );
}

