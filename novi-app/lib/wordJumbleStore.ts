// Import the WordEntry interface from the wordBank constants
import { WordEntry } from '@/constants/wordBank';

// Define the interface for the global state of the Word Jumble game
export interface WordJumbleState {
    // Array of WordEntry objects representing the words loaded for the current session
    words: WordEntry[];
    // The index of the current word being played in the words array
    wordIdx: number;
    // The player's current total score
    score: number;
    // The player's current consecutive correct answers
    streak: number;
    // The total number of words successfully solved in this session
    solved: number;
    // The current word and its clue the player is trying to guess
    currentEntry: WordEntry | null;
    // Array of single characters representing the scrambled version of the current target word
    scrambled: string[];
    // Array of indices tracking which scrambled letters have been selected by the player
    selected: number[];
    // The amount of time remaining in seconds for the current word
    timeLeft: number;
    // A flag indicating whether the clue for the current word is currently shown
    showClue: boolean;
    // A flag tracking if a hint has been used for the current word
    hintUsed: boolean;
    // The current visual feedback state: 'correct', 'wrong', or null (no feedback)
    feedback: 'correct' | 'wrong' | null;
}

// Global variable to hold the persistent state of the word jumble game in memory
export let globalWordJumbleState: WordJumbleState | null = null;

// Function to save the current word jumble state to the global variable
export const saveWordJumbleState = (state: WordJumbleState) => {
    // Overwrite the global variable with the newly provided state object
    globalWordJumbleState = state;
};

// Function to retrieve the current saved state of the word jumble game
export const getWordJumbleState = () => {
    // Return the current stored object or null if it hasn't been set
    return globalWordJumbleState;
};

// Function to clear or reset the globally saved state
export const clearWordJumbleState = () => {
    // Set the global state variable explicitly to null
    globalWordJumbleState = null;
};