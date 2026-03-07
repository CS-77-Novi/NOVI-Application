// Ensure this component runs only on the client side in Next.js
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, Lightbulb, HelpCircle, SkipForward, Loader2 } from 'lucide-react';
import Draggable from 'react-draggable';
import { WordEntry, fetchRandomWords, fetchDefinition } from '@/constants/wordBank';
import { getWordJumbleState, saveWordJumbleState } from '@/lib/wordJumbleStore';

// Retrieve the dictionary API URL from environment variables, fallback to empty string
const DEF_API = process.env.NEXT_PUBLIC_WORD_DEF_API ?? '';

const WORDS_PER_SESSION = 10; // fetch this many words each time the game opens

/* ------------------------------------------------------------------ */
/*  Helper: shuffle an array (Fisher-Yates)                           */
/* ------------------------------------------------------------------ */
// Helper function to randomly shuffle an array using the Fisher-Yates algorithm
function shuffle<T>(arr: T[]): T[] {
    // Create a shallow copy of the incoming array to avoid mutating the original
    const a = [...arr];
    // Loop backward through the array and swap each element with a randomly chosen one before it
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    // Return the correctly shuffled array
    return a;
}

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */
// Interface defining the props expected by the WordJumble component
interface WordJumbleProps {
    onClose: () => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
// Main WordJumble functional component
const WordJumble = ({ onClose }: WordJumbleProps) => {

    /* — word list for this session — */
    // Array of words loaded for the current gameplay session
    const [words, setWords] = useState<WordEntry[]>([]);
    // Ref to synchronously access the current words array inside callbacks without triggering rerenders
    const wordsRef = useRef<WordEntry[]>([]);
    // Boolean state tracking whether words are actively being fetched or loaded
    const [isLoading, setIsLoading] = useState(true);
    // Ref tracking the current index in the word list, mimicking a round counter
    const wordIdx = useRef(0);

    /* — game-level state — */
    // The player's overall score
    const [score, setScore] = useState(0);
    // The player's current consecutive correct answers
    const [streak, setStreak] = useState(0);
    // Total count of words correctly identified and solved
    const [solved, setSolved] = useState(0);

    /* — round-level state — */
    // An object containing the current word and its clue/definition
    const [currentEntry, setCurrentEntry] = useState<WordEntry | null>(null);
    // Array of the current word's characters in a scrambled, randomized order
    const [scrambled, setScrambled] = useState<string[]>([]);
    // Array tracking the integer indices of the scrambled letters the user has tapped
    const [selected, setSelected] = useState<number[]>([]);
    // Current countdown timer remaining for the round, initially set to 30 seconds
    const [timeLeft, setTimeLeft] = useState(30);
    // State flag controlling whether the word's clue is visible to the player
    const [showClue, setShowClue] = useState(false);
    // State flag tracking if the player has used a hint for this specific word
    const [hintUsed, setHintUsed] = useState(false);
    // Presentational state indicating if the last entered answer was 'correct', 'wrong', or null entirely
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

    /* — derived answer string — */
    // Memoized computation of the user's current constructed answer using selected indices mapped to scrambled letters
    const answer = useMemo(
        // Map the array of selected indices to the characters in the scrambled string, joining them into a complete word
        () => selected.map((i) => scrambled[i]).join(''),
        // Recalculate whenever selected indices or scrambled letters change
        [selected, scrambled],
    );

    /* ---------------------------------------------------------------- */
    /*  Fetch new batch of words                                         */
    /* ---------------------------------------------------------------- */
    // Callback function to asynchronously fetch a new batch of 10 words and their definitions
    const loadNewBatch = useCallback(async (isCancelled: () => boolean = () => false) => {
        // Reset the interface to a loading state and wipe the current entry
        setIsLoading(true);
        setCurrentEntry(null);

        // Fetch a large pool of random words (e.g., 100 words), returning capitalized words and empty clues
        const rawWords = await fetchRandomWords(100);
        // Abort the fetch process execution prematurely if component unmounted or operation is cancelled
        if (isCancelled()) return;

        // If the fetch returns static fallback words (clue populated), directly use the first few items
        if (rawWords.length > 0 && rawWords[0].clue !== '') {
            // Slice off 10 words for a session batch
            const session = rawWords.slice(0, WORDS_PER_SESSION);
            // Update state and synchronous references
            setWords(session);
            wordsRef.current = session;
            wordIdx.current = 0;
            setIsLoading(false);
            return;
        }

        // Initialize empty array for words with successfully fetched definitions
        const ready: WordEntry[] = [];
        // Determine the chunk size for parallel parallel HTTP requests to the dictionary server
        const BATCH_SIZE = 10;
        
        // Loop over the raw words pool in sequence by incrementing via our specified chunk size
        for (let i = 0; i < rawWords.length; i += BATCH_SIZE) {
            // Break out of the fetch loop once we've successfully gathered 10 definitions
            if (ready.length >= WORDS_PER_SESSION) break;
            // Early return and stop fetching if operation is cancelled
            if (isCancelled()) return;

            // Take the 10-word slice for this batch
            const batch = rawWords.slice(i, i + BATCH_SIZE);
            // Initiate parallel network requests for the definitions of each word in the batch via the API
            const results = await Promise.allSettled(
                batch.map((entry) => fetchDefinition(entry.word, DEF_API)),
            );
            
            // Loop through the results of the batch fetch
            results.forEach((r, idx) => {
                // Return conditionally if the threshold has already been met
                if (ready.length >= WORDS_PER_SESSION) return;
                // Check if the request resolved fully and if a definition was returned properly
                if (r.status === 'fulfilled' && r.value) {
                    // Assemble a WordEntry and append it to our valid words pool
                    ready.push({ word: batch[idx].word, clue: r.value });
                }
            });
        }

        // Failsafe: if the loop completes but we lack 10 definition-validated words
        if (ready.length < WORDS_PER_SESSION) {
            // Calculate how many more words are required
            const needed = WORDS_PER_SESSION - ready.length;
            // Identify remaining words from rawWords that haven't been successfully added to 'ready'
            const remainingRaw = rawWords.filter(w => !ready.find(r => r.word === w.word));
            // Pad the required entries directly using a dummy placeholder clue error message
            for (let i = 0; i < needed && i < remainingRaw.length; i++) {
                ready.push({ word: remainingRaw[i].word, clue: 'Dictionary definition unavailable.' });
            }
        }

        // Synchronize local refs to prevent immediate re-renders causing state wipeout
        wordsRef.current = ready;
        wordIdx.current = 0;
        // Populate component state and toggle boolean to denote loading is finished
        setWords(ready);
        setIsLoading(false);
    }, []); // Only rebuild this function instance if explicit dependencies alter (none here)

    /* ---------------------------------------------------------------- */
    /*  Pick next word from the list                                     */
    /* ---------------------------------------------------------------- */
    // Callback function pulling the next word from the active session word sequence
    const pickWord = useCallback(() => {
        // Access up-to-date words synchronously via the reference
        const list = wordsRef.current;
        // Extract the current round's numeric index position
        const idx = wordIdx.current;
        // If the session words list has been entirely exhausted
        if (idx >= list.length) {
            // Fetch another fresh set of ten words
            loadNewBatch();
            return;
        }

        // Grab the corresponding word from the array using the index tracking
        const entry = list[idx];
        // Move the internal tracker pointer forward 1 spot for the subsequent round
        wordIdx.current = idx + 1;

        // Apply state for the new word
        setCurrentEntry(entry);
        // Take the letters from the incoming word and randomly shuffle them for the puzzle state
        setScrambled(shuffle(entry.word.split('')));
        // Wipe away previously selected answer characters
        setSelected([]);
        // Reset the countdown timer back to its max length (30s)
        setTimeLeft(30);
        // Make sure the visual clue banner is hidden for the new round
        setShowClue(false);
        // Allow the user to request a hint once on the new word
        setHintUsed(false);
        // Reset the feedback UI classes to default/normal
        setFeedback(null);
    }, [loadNewBatch]); // Dependent on the loadNewBatch implementation


    /* ---------------------------------------------------------------- */
    /*  Bootstrap: fetch random words + definitions in parallel          */
    /* ---------------------------------------------------------------- */
    // Initial mount hook handling loading pre-existing persisted data or initializing new batch fetch
    useEffect(() => {
        // Control flag safely aborting any in-flight asynchronous operations if unmounted early
        let cancelled = false;
        // Instant-invoked anonymous async function
        (async () => {
            // Initiate the loading splash screen visuals explicitly
            setIsLoading(true);

            try {
                // Check local memory/store for a saved state record for Word Jumble
                const parsed = getWordJumbleState();
                if (parsed) {
                    // Define conditions that signal a session is completely finished. Reached 10 and explicitly finished or failed.
                    const isFinished = parsed.wordIdx >= WORDS_PER_SESSION && (parsed.timeLeft <= 0 || parsed.feedback === 'correct');

                    // If a valid saved list exists and the session is not explicitly finished yet
                    if (!isFinished && parsed.words && parsed.words.length > 0) {
                        // Resurrect all saved component state values fully to match historical state exactly
                        setWords(parsed.words);
                        wordsRef.current = parsed.words;
                        wordIdx.current = parsed.wordIdx;
                        setScore(parsed.score ?? 0);
                        setStreak(parsed.streak ?? 0);
                        setSolved(parsed.solved ?? 0);
                        setCurrentEntry(parsed.currentEntry ?? null);
                        setScrambled(parsed.scrambled ?? []);
                        setSelected(parsed.selected ?? []);
                        setTimeLeft(parsed.timeLeft ?? 30);
                        setShowClue(parsed.showClue ?? false);
                        setHintUsed(parsed.hintUsed ?? false);
                        setFeedback(parsed.feedback ?? null);
                        // Exit the loading state cleanly— no new batch is necessary
                        setIsLoading(false);
                        return;
                    } else if (isFinished) {
                        // Persist game-level score parameters if resurrecting after a completed round of ten
                        setScore(parsed.score ?? 0);
                        setStreak(parsed.streak ?? 0);
                        setSolved(parsed.solved ?? 0);
                    }
                }
            } catch (err) {
                // Catch corruption issues when attempting to read the persistent store gently
                console.error('Failed to parse word jumble state', err);
            }

            // Since there isn't active state to resurrect (or finished), load the next 10 new words completely fresh
            await loadNewBatch(() => cancelled);
        })();
        // Optional return function used as a cleanup callback natively to indicate this component unmounted
        return () => { cancelled = true; };
    }, []); // Hook only runs exactly once during mounting due to the empty array deps

    /* pick the first word once words are loaded */
    // Small reaction hook initializing the game properly once words have populated following network loads
    useEffect(() => {
        // Check if loading has finished, we actually do have words, and the very first entry is null still
        if (!isLoading && words.length > 0 && !currentEntry) {
            // Triggers the cycle loop that randomly shuffles text and sets up actual gameplay elements properly
            pickWord();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [words, currentEntry, isLoading]);

    /* Save State */
    // Reaction hook that effectively serializes the gameplay elements to persistent storage whenever values change
    useEffect(() => {
        // Halt attempts to write incomplete data state definitions (e.g., during active loader)
        if (!isLoading && words.length > 0) {
            // Bundle up everything about our ongoing instance manually
            const stateToSave = {
                words,
                wordIdx: wordIdx.current,
                score,
                streak,
                solved,
                currentEntry,
                scrambled,
                selected,
                timeLeft,
                showClue,
                hintUsed,
                feedback,
            };
            // Forward bundle dictionary specifically to the external persistence service mapping
            saveWordJumbleState(stateToSave);
        }
    }, [
        // Specify individual local reactive dependencies requiring a new persist serialization iteration
        words,
        score,
        streak,
        solved,
        currentEntry,
        scrambled,
        selected,
        timeLeft,
        showClue,
        hintUsed,
        feedback,
        isLoading,
    ]);

    /* ---------------------------------------------------------------- */
    /*  Timer                                                            */
    /* ---------------------------------------------------------------- */
    // Effect handling the countdown behavior mechanism each second iteratively over time
    useEffect(() => {
        // Do not enable the timer when null game loops present an unloaded board
        if (!currentEntry) return;
        // Verify if user actually exhausted their 30 second timeline
        if (timeLeft <= 0) {
            // time up → skip
            // Assess penalty— penalize the streak tracker value if not appropriately answered prior
            if (feedback !== 'correct') {
                setStreak(0);
            }
            // Transition word cycle forward automatically based on exact timeouts natively
            pickWord();
            return;
        }
        // Spawn browser interval callback pushing one digit off our remaining visual countdown total
        const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        // Clear underlying interval process whenever state is forcefully mutated interrupting cycle cleanly
        return () => clearInterval(id);
    }, [timeLeft, currentEntry, pickWord, feedback]);

    /* ---------------------------------------------------------------- */
    /*  Auto-check answer                                                */
    /* ---------------------------------------------------------------- */
    // Hooks handling visual validation of word match checking against correct results natively
    useEffect(() => {
        // Short-circuit checking processes when components effectively unmount or cycle empty parameters
        if (!currentEntry) return;
        // Ignore the check completely if word size mismatches total target requirements exactly
        if (answer.length !== currentEntry.word.length) return;

        // Verify if properly sequenced constructed answer matches real result identical strings check properly
        if (answer === currentEntry.word) {
            // Display visually appealing styling modifications specifically to signal correct matching parameter
            setFeedback('correct');
            // Deduct exact point distributions contextually on utilizing hint interactions dynamically 
            const points = hintUsed ? 3 : 5;
            // Elevate underlying game states cumulatively based entirely on success criteria explicitly parameter
            setScore((s) => s + points);
            setStreak((s) => s + 1);
            setSolved((s) => s + 1);
            // Throttle specific timeout explicitly waiting 900ms delaying immediate transitions contextually to let UX display 
            setTimeout(() => pickWord(), 900);
        } else {
            // Show clearly identifiable style representations representing incorrect selections dynamically fully 
            setFeedback('wrong');
            // Hard wipe streak immediately upon any single failure event.
            setStreak(0);
            // After visual red displays cleanly, wait 700ms to visually return back baseline normal styles automatically
            setTimeout(() => {
                setSelected([]);
                setFeedback(null);
            }, 700);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [answer]);

    /* ---------------------------------------------------------------- */
    /*  Actions                                                          */
    /* ---------------------------------------------------------------- */
    // Callback logic executing on bottom bank individual character inputs physically
    const handleLetterClick = (idx: number) => {
        // Disallow overlapping selections explicitly targeting currently pressed items 
        if (selected.includes(idx) || feedback) return;
        // Insert character pointer into trailing selection lists array dynamically
        setSelected((prev) => [...prev, idx]);
    };

    // Removal logic returning top bank selections
    const handleAnswerLetterClick = (pos: number) => {
        // Deny input manipulations manually whenever locked checking state active specifically 
        if (feedback) return;
        // Pop selected parameter precisely using contextual explicit filtering
        setSelected((prev) => prev.filter((_, i) => i !== pos));
    };

    const handleHint = () => {
        // Check state boundaries structurally
        if (!currentEntry || hintUsed || feedback) return;
        // Ensure flag toggles locking secondary uses correctly
        setHintUsed(true);
        // reveal the first un-placed correct letter
        // Pull reference explicit word
        const word = currentEntry.word;
        // Sweep iteratively looking systematically
        for (let i = answer.length; i < word.length; i++) {
            // Explicit assignment targeting character
            const letter = word[i];
            // Hunt scrambled equivalent
            const scrambledIdx = scrambled.findIndex(
                (l, idx) => l === letter && !selected.includes(idx),
            ); 
            if (scrambledIdx !== -1) {
                // Populate
                setSelected((prev) => [...prev, scrambledIdx]);
                break;
            }
        }
    };

    // Explicit manual cycle request cleanly
    const handleSkip = () => {
        // Destroy streak completely
        setStreak(0);
        // Triggers cycle
        pickWord();
    };

    /* ---------------------------------------------------------------- */
    /*  Format timer                                                     */
    /* ---------------------------------------------------------------- */
    // Formatter algorithm slicing minutes
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const timerStr = `${mins}:${secs.toString().padStart(2, '0')}`;

    // Elements ref logically handling Draggable
    const dragRefLoading = useRef<HTMLDivElement>(null);
    const dragRefGame = useRef<HTMLDivElement>(null);

    /* ---------------------------------------------------------------- */
    /*  Render                                                           */
    /* ---------------------------------------------------------------- */
    // Fallback UI to display a loading spinner when data is not ready
    if (isLoading || !currentEntry) {
        return (
            // Wrap the loading state in a Draggable container
            <Draggable nodeRef={dragRefLoading} bounds="parent">
                {/* Visual loading interface with a spinner */}
                <div ref={dragRefLoading} className="fixed top-4 right-4 z-50 w-[300px] rounded-2xl bg-[#1a1e25] cursor-grab active:cursor-grabbing shadow-2xl border border-gray-700/50 flex flex-col items-center justify-center font-sans text-white p-10 gap-3">
                    <Loader2 size={28} className="animate-spin text-[#5162F6]" />
                    <span className="text-sm text-gray-400">Loading words…</span>
                </div>
            </Draggable>
        );
    }

    // Main render interface for the game board
    return (
        // Primary Draggable wrapper for the entire widget
        <Draggable nodeRef={dragRefGame} handle=".drag-handle" bounds="parent">
            {/* Main widget layout container */}
            <div ref={dragRefGame} className="fixed top-4 right-4 z-50 w-[300px] rounded-2xl bg-[#1a1e25] shadow-2xl border border-gray-700/50 flex flex-col font-sans text-white overflow-hidden select-none">
                {/* --- Header --- */}
                {/* Drag handle area for moving the widget */}
                <div className="drag-handle flex items-center justify-between px-4 py-3 border-b border-gray-700/40 cursor-grab active:cursor-grabbing">
                    <span className="font-bold text-base flex items-center gap-2">
                        🧩 Letter Puzzle
                    </span>
                    <button
                        onClick={onClose}
                        className="hover:bg-gray-700 rounded-full p-1 transition-colors z-10"
                    >
                        <X size={18} />
                    </button>
                </div>

            {/* --- Stats bar --- */}
            <div className="grid grid-cols-3 gap-2 px-4 pt-3 pb-2">
                {[
                    { label: 'SCORE', value: score },
                    { label: 'STREAK', value: streak, color: 'text-red-400' },
                    { label: 'TIME', value: timerStr },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="bg-[#252a33] rounded-xl text-center py-2"
                    >
                        <div className="text-[10px] tracking-widest text-gray-400">
                            {s.label}
                        </div>
                        <div className={`text-xl font-bold ${s.color ?? ''}`}>
                            {s.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* --- Answer slots --- */}
            <div className="px-4 pt-2">
                <p className="text-[10px] tracking-widest text-gray-400 text-center mb-1">
                    YOUR ANSWER
                </p>
                <div
                    className={`min-h-[42px] rounded-xl border-2 flex items-center justify-center gap-1 flex-wrap px-3 py-2 transition-colors ${feedback === 'correct'
                            ? 'border-green-500 bg-green-500/10'
                            : feedback === 'wrong'
                                ? 'border-red-500 bg-red-500/10'
                                : 'border-gray-600 bg-[#252a33]'
                        }`}
                >
                    {answer.length === 0 && (
                        <span className="text-gray-500 text-xs">Tap letters below</span>
                    )}
                    {selected.map((sIdx, pos) => (
                        <button
                            key={pos}
                            onClick={() => handleAnswerLetterClick(pos)}
                            className="w-8 h-8 rounded-lg bg-[#3a4150] flex items-center justify-center text-sm font-bold hover:bg-red-500/40 transition-colors"
                        >
                            {scrambled[sIdx]}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- Scrambled letters --- */}
            <div className="px-4 pt-3">
                <p className="text-[10px] tracking-widest text-gray-400 text-center mb-2">
                    SCRAMBLED LETTERS
                </p>
                <div className="flex flex-wrap justify-center gap-2 min-h-[88px] content-start">
                    {scrambled.map((letter, idx) => {
                        const used = selected.includes(idx);
                        return (
                            <button
                                key={idx}
                                disabled={used}
                                onClick={() => handleLetterClick(idx)}
                                className={`w-9 h-9 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${used
                                        ? 'opacity-20 cursor-default bg-[#252a33]'
                                        : 'bg-[#3a4150] hover:bg-[#5162F6] hover:scale-110 cursor-pointer'
                                    }`}
                            >
                                {letter}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* --- Clue text --- */}
            {showClue && (
                <div className="mx-4 mt-3 rounded-lg bg-[#252a33] p-2 text-xs text-gray-300 text-center animate-pulse">
                    💡 {currentEntry.clue}
                </div>
            )}

            {/* --- Action buttons --- */}
            <div className="flex justify-center gap-3 px-4 py-4">
                <button
                    onClick={handleHint}
                    disabled={hintUsed}
                    className={`flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${hintUsed
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-[#5162F6] hover:bg-[#6574ff] text-white'
                        }`}
                >
                    <Lightbulb size={14} /> Hint
                </button>
                <button
                    onClick={() => setShowClue(true)}
                    className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold bg-[#3a4150] hover:bg-[#4c5565] text-white transition-colors"
                >
                    <HelpCircle size={14} /> Clue
                </button>
                <button
                    onClick={handleSkip}
                    className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold bg-[#3a4150] hover:bg-[#4c5565] text-white transition-colors"
                >
                    <SkipForward size={14} /> Skip
                </button>
            </div>

            {/* --- Bottom stats --- */}
            <div className="grid grid-cols-3 border-t border-gray-700/40 text-center py-3 text-xs">
                <div>
                    <div className="text-gray-400 text-[10px] tracking-widest">
                        SOLVED
                    </div>
                    <div className="font-bold text-base">{solved}</div>
                </div>
                <div>
                    <div className="text-gray-400 text-[10px] tracking-widest">
                        SCORE
                    </div>
                    <div className="font-bold text-base">{score}</div>
                </div>
                <div>
                    <div className="text-gray-400 text-[10px] tracking-widest">
                        STREAK
                    </div>
                    <div className="font-bold text-base flex items-center justify-center gap-1">
                        {streak} {streak > 0 && '🔥'}
                    </div>
                </div>
            </div>
        </div>
        </Draggable>
    );
};

// Default export of the main component
export default WordJumble;