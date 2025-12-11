import React, { useEffect, useState } from 'react';
import styles from './Loader.module.css';

interface LoaderProps {
    onFinished: () => void;
}

const Loader: React.FC<LoaderProps> = ({ onFinished }) => {
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [canStart, setCanStart] = useState(false);

    // Delay start of loading to match text animation
    useEffect(() => {
        const timer = setTimeout(() => {
            setCanStart(true);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!canStart) return;

        let animationFrameId: number;

        const simulateLoad = () => {
            setProgress((prev) => {
                // Random increment for organic, "editorial" look
                // Increased speed: random between 2 and 7
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
    }, [progress, canStart]);

    // Triggers the curtain to slide up
    useEffect(() => {
        if (progress >= 100 && !isComplete) {
            setIsComplete(true);
            // Wait 200ms for the typography animations to finish before lifting the curtain
            setTimeout(() => {
                onFinished();
            }, 200);
        }
    }, [progress, isComplete, onFinished]);

    return (
        <div className={`${styles.container} ${isComplete ? styles.slideUp : ''}`}>
            <div className={styles.inner}>
                <div className={`${styles.bigText} ${styles.line1}`}>
                    <span>TWINKLE</span>
                </div>

                <div className={styles.scriptText}>
                    is loading...
                </div>

                <div className={styles.loaderProgress}>
                    <div
                        className={styles.loaderBar}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Loader;