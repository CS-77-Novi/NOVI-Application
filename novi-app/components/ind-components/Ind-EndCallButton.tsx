'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { PowerIcon } from '@heroicons/react/24/solid';

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
            className="flex flex-col items-center justify-center w-28 h-24 gap-3 
            rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{ backgroundColor: '#ef4444' }}
        >
            <PowerIcon className="w-8 h-8 text-white drop-shadow-sm" />
            <span className="text-white text-sm font-semibold tracking-wide drop-shadow-sm">End Call</span>
        </button>
    );
};

export default IndEndCallButton;
