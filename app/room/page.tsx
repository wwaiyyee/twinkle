"use client";

import { useRouter } from "next/navigation";
import Room from "./Room";
import RoomNavbar from "./components/RoomNavbar";

export default function RoomPage() {
    const router = useRouter();

    return (
        <>
            <Room />
            <RoomNavbar />
            {/* Navigation Button 1 */}
            <button
                onClick={() => router.push('/talkingsana')}
                className="absolute top-32 left-8 z-50 w-12 h-12 bg-yellow-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold text-white hover:scale-110 transition-transform cursor-pointer"
                style={{ fontFamily: 'var(--font-dynapuff)' }}
            >
                1
            </button>
        </>
    );
}
