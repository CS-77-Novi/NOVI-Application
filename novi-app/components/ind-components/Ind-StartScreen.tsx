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

            <div className="z-10 w-full max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">

                {/* Left Column: Text and CTA */}
                <div className="flex flex-col items-start text-left xl:pl-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 font-semibold text-sm mb-8 border border-cyan-200 dark:border-cyan-800 shadow-sm shadow-cyan-100 dark:shadow-none">
                        <SparklesIcon className="w-4 h-4" /> NOVI Individual Learning           
                    </div>

                    <h1 className="text-5xl md:text-6xl xl:text-7xl font-extrabold mb-8 tracking-tight leading-[1.15]">
                    Master your focus with <span className="bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-
                    transparent drop-shadow-sm">AI-Assisted</span> precision.
                    </h1>

                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-xl leading-relaxed">
                    Enter a highly focused, distraction-free environment designed to maximize your productivity. NOVI tracks your attention in real-time to provide actionable intelligence.
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