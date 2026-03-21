import { AcademicCapIcon, SparklesIcon, ChartBarSquareIcon, ShieldCheckIcon, PlayIcon } from '@heroicons/react/24/solid';

interface IndStartScreenProps {
    onStart: () => void;
}

const IndStartScreen = ({ onStart }: IndStartScreenProps) => {
    return (
        <section className="relative flex w-full min-h-[85vh] flex-col items-center justify-center overflow-hidden py-12">
            {/* Animated Background Blobs in Novi Brand Colors (Cyan/Blue/Teal) */}
            <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-cyan-400/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-[30rem] h-[30rem] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-[30rem] h-[30rem] bg-teal-400/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>    

            <div className="z-10 flex flex-col items-center w-full max-w-3xl px-6">
                {/* Premium Glassmorphism Card */}
                <div className="w-full bg-white/5 dark:bg-gray-900/40 backdrop-blur-2xl border border-white/20 dark:border-gray-700/50 rounded-[2.5rem] shadow-2xl p-10 md:p-14 transform transition-all hover:shadow-purple-500/10">

                    <div className="flex justify-center mb-6">
                        <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 group">
                            <AcademicCapIcon className="w-12 h-12 text-white transform transition-transform group-hover:scale-110" />
                            <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1.5 shadow-lg animate-bounce">
                                <SparklesIcon className="w-4 h-4 text-yellow-900" />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4 tracking-tight">
                        <span className="bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-300 bg-clip-text text-transparent drop-shadow-sm">
                            Individual Learning
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 text-center mb-10 max-w-2xl mx-auto leading-relaxed">
                        Enter a highly focused, AI-monitored environment designed to maximize your productivity and track your attention in real-time.
                    </p>

                    {/* Feature Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10">
                            <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-xl">
                                <SparklesIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Deep Focus</span>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10">
                            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
                                <ChartBarSquareIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Live Analytics</span>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl">
                                <ShieldCheckIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Privacy First</span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={onStart}
                            className="group relative flex items-center justify-center gap-3 px-10 py-5 w-full md:w-auto text-lg font-bold text-white rounded-2xl shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                            style={{ backgroundImage: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
                        >
                            <span className="absolute inset-0 w-full h-full bg-white/20 group-hover:bg-transparent transition-colors duration-300"></span>
                            <span className="relative z-10 flex items-center gap-2">
                                Start Session
                                <svg className="w-5 h-5 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        </button>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default IndStartScreen;