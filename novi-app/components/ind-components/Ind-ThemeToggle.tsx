'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';

const IndThemeToggle = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Provide a placeholder button of exactly the same dimensions before hydration
    if (!mounted) {
        return (
            <button className="flex flex-col items-center justify-center w-28 h-24 gap-3 rounded-2xl transition-all duration-300 bg-gray-800/80 cursor-default">
                <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
                <div className="w-16 h-3 rounded bg-gray-700 animate-pulse" />
            </button>
        );
    }

    const isDark = theme === 'dark';

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="group flex flex-col items-center justify-center w-28 h-24 gap-3 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-transparent text-gray-700 dark:text-white"
        >
            {isDark ? (
                <SunIcon className="w-8 h-8 text-yellow-400 drop-shadow-md transform transition-transform group-hover:rotate-45" />
            ) : (
                <MoonIcon className="w-8 h-8 text-blue-500 drop-shadow-md transform transition-transform group-hover:-rotate-12" />
            )}
                        <span className="text-sm font-semibold tracking-wide drop-shadow-sm transition-colors group-hover:text-cyan-600 dark:group-hover:text-yellow-100">
                {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
        </button>
    );
};

export default IndThemeToggle;