'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

interface EndCallButtonProps {
    onEndCall: () => void;
    sessionId: string;
}

const IndEndCallButton = ({ onEndCall, sessionId }: EndCallButtonProps) => {
    const router = useRouter();
    const { user } = useUser();

    const handleEndSession = async () => {
        // Call cleanup function passed from parent
        onEndCall();
        
        // Trigger report generation with the session ID and user ID
        if (sessionId && user?.id) {
            fetch(`/api/individual_session/ind_report_gen?session_id=${sessionId}&host_id=${user.id}`)
                .catch(err => console.error('Failed to generate report:', err));
        }
        
        // Navigate to home page
        router.push('/');
    };

    return (
        <button
            onClick={handleEndSession}
            className="flex items-center justify-center px-6 py-4 rounded-xl transition-all duration-300 hover:scale-105"
            style={{ backgroundColor: '#ef4444' }}
        >
            <span className="text-white text-sm font-medium">End Session</span>
        </button>
    );
};

export default IndEndCallButton;