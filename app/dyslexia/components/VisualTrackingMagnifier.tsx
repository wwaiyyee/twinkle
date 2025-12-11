'use client';

// VisualTrackingMagnifier component - word tracking without visible circle
// The tracking is handled by WordWrapper highlighting the current word
export default function VisualTrackingMagnifier() {
    // This component is kept for API compatibility but doesn't render anything
    // The actual visual tracking is done through WordWrapper highlighting
    return null;
}

// Helper component to wrap words and provide refs
export function WordWrapper({
    word,
    index,
    isCurrent,
    onRef,
    dyslexiaModeEnabled
}: {
    word: string;
    index: number;
    isCurrent: boolean;
    onRef: (ref: HTMLSpanElement | null, index: number) => void;
    dyslexiaModeEnabled: boolean;
}) {
    // Bold specific letters in words
    const renderWord = () => {
        if (!dyslexiaModeEnabled) return word;

        const lowerWord = word.toLowerCase();
        const cleanWord = lowerWord.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");

        // Bold and vibrant deep green the "H" in "Here", orange for "ere"
        if (cleanWord === 'here' && word[0] === 'H') {
            return (
                <>
                    <span style={{ fontWeight: '900', color: '#15803d' }}>H</span>
                    <span style={{ color: '#ea580c' }}>ere</span>
                    {/* Render any remaining punctuation */}
                    {word.slice(4)}
                </>
            );
        }

        // Color all 'a' letters green in "apple", all 'p' letters orange, "le" pink
        if (cleanWord === 'apple') {
            // Split word into characters and color accordingly
            return (
                <>
                    {word.split('').map((char, idx) => {
                        const lowerChar = char.toLowerCase();
                        if (lowerChar === 'a') {
                            // All 'a' letters - green
                            return <span key={idx} style={{ fontWeight: '900', color: '#15803d' }}>{char}</span>;
                        } else if (lowerChar === 'p') {
                            // All 'p' letters - orange
                            return <span key={idx} style={{ color: '#ea580c' }}>{char}</span>;
                        } else if (lowerChar === 'l' || lowerChar === 'e' || char === '.') {
                            // "le" and "." - pink
                            return <span key={idx} style={{ fontWeight: '900', color: '#ec4899' }}>{char}</span>;
                        }
                        return <span key={idx}>{char}</span>;
                    })}
                </>
            );
        }

        // Vibrant deep green color for "is" (same as H in Here)
        if (cleanWord === 'is') {
            return (
                <>
                    <span style={{ color: '#15803d', fontWeight: '900' }}>is</span>
                    {/* Render any remaining punctuation */}
                    {word.slice(2)}
                </>
            );
        }

        // Color "li" green and "ke" orange in "like"
        if (cleanWord === 'like') {
            return (
                <>
                    {word.split('').map((char, idx) => {
                        const lowerChar = char.toLowerCase();
                        if (lowerChar === 'l' || lowerChar === 'i') {
                            return <span key={idx} style={{ fontWeight: '900', color: '#15803d' }}>{char}</span>;
                        } else if (lowerChar === 'k' || lowerChar === 'e') {
                            return <span key={idx} style={{ color: '#ea580c' }}>{char}</span>;
                        }
                        return <span key={idx}>{char}</span>;
                    })}
                </>
            );
        }

        // Make all 'a' and 'i' letters green in any word
        if (word.toLowerCase().includes('a') || word.toLowerCase().includes('i')) {
            return (
                <>
                    {word.split('').map((char, idx) => {
                        const lowerChar = char.toLowerCase();
                        if (lowerChar === 'a' || lowerChar === 'i') {
                            return <span key={idx} style={{ fontWeight: '900', color: '#15803d' }}>{char}</span>;
                        }
                        return <span key={idx}>{char}</span>;
                    })}
                </>
            );
        }

        return word;
    };

    // Check if word has custom colors
    const lowerWord = word.toLowerCase();
    const cleanWord = lowerWord.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
    const hasCustomColors = cleanWord === 'here' || cleanWord === 'apple' || cleanWord === 'is' || cleanWord === 'like';

    if (!dyslexiaModeEnabled) {
        return (
            <span
                ref={(ref) => {
                    onRef(ref, index);
                }}
                className="inline-block px-1 py-1 text-gray-800 text-3xl"
            >
                {word}
            </span>
        );
    }

    return (
        <span
            ref={(ref) => {
                onRef(ref, index);
            }}
            className={`inline-block px-3 py-2 transition-all duration-300 ${isCurrent
                ? 'bg-blue-200 font-bold'
                : ''
                }`}
            style={{
                borderRadius: '6px',
                fontSize: isCurrent ? '2.5rem' : '1.875rem', // Larger font for current word
                transform: isCurrent ? 'scale(1.4)' : 'scale(1)', // More magnification
                zIndex: isCurrent ? 20 : 1,
                textShadow: isCurrent ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
                // Only set default color if word doesn't have custom colors
                ...(hasCustomColors ? {} : { color: isCurrent ? '#1e3a8a' : '#1f2937' }),
            }}
        >
            {renderWord()}
        </span>
    );
}

