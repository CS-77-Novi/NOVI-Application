// Define an interface for a single word entry containing a word and its generated clue/definition
export interface WordEntry {
    // The actual target word in uppercase string format
    word: string;
    // A string providing a clue or dictionary definition for the word
    clue: string;
}


import dictionaryData from '@/data/dictionary.json';

/* ------------------------------------------------------------------ */
/*  Static fallback word bank (used when API is unreachable)          */
/* ------------------------------------------------------------------ */

// Define an array of fallback entries to use when the primary dictionary/API loading fails
const WORD_BANK: WordEntry[] = [
    { word: "VARIABLE", clue: "A container that stores data in programming" },
    { word: "FUNCTION", clue: "A reusable block of code that performs a task" },
    { word: "BOOLEAN", clue: "A data type with only true or false values" },
    { word: "ARRAY", clue: "An ordered collection of elements" },
    { word: "STRING", clue: "A sequence of characters in programming" },
    { word: "OBJECT", clue: "A collection of key-value pairs" },
    { word: "SYNTAX", clue: "The set of rules for writing code correctly" },
    { word: "LOOP", clue: "Repeats a block of code multiple times" },
    { word: "CLASS", clue: "A blueprint for creating objects" },
    { word: "MODULE", clue: "A self-contained unit of code" },
    { word: "SERVER", clue: "A computer that provides services to other computers" },
    { word: "CLIENT", clue: "The program or device that requests data from a server" },
    { word: "DATABASE", clue: "An organized collection of structured data" },
    { word: "NETWORK", clue: "A group of connected computers sharing resources" },
    { word: "COMPILE", clue: "Convert source code into machine code" },
    { word: "DEPLOY", clue: "Release software for use in production" },
    { word: "RENDER", clue: "Generate visual output from code or data" },
    { word: "BINARY", clue: "A number system using only 0 and 1" },
    { word: "PIXEL", clue: "The smallest unit of a digital image" },
    { word: "ROUTER", clue: "Directs data packets between networks" },
    { word: "KERNEL", clue: "The core part of an operating system" },
    { word: "CACHE", clue: "Temporary storage for fast data access" },
    { word: "THREAD", clue: "The smallest unit of processing in a program" },
    { word: "QUEUE", clue: "A data structure that follows first-in, first-out" },
    { word: "STACK", clue: "A data structure that follows last-in, first-out" },
    { word: "TOKEN", clue: "A small piece of data used for authentication" },
    { word: "BRANCH", clue: "A separate line of development in version control" },
    { word: "MERGE", clue: "Combine two branches of code together" },
    { word: "DEBUG", clue: "Find and fix errors in code" },
    { word: "STREAM", clue: "A continuous flow of data" },
];
/* ------------------------------------------------------------------ */
/*  Fetch a word's definition from the dictionary API                  */
/* ------------------------------------------------------------------ */
// Async function to request the definition of a given word from a third-party dictionary API
export async function fetchDefinition(word: string, apiUrl: string): Promise<string | null> {
    try {
        // Send a fetch request to the API, appending the properly encoded lowercased word to the URL
        const res = await fetch(`${apiUrl}/${encodeURIComponent(word.toLowerCase())}`);
        // If the HTTP response status is not "ok", stop and return null
        if (!res.ok) return null;

        // Parse the JSON response body
        const data = await res.json();

        // Navigate: data[0].meanings[0].definitions[0].definition
        // Use optional chaining to safely drill down into the potentially complex API response to grab the first definition
        const definition: string | undefined =
            data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition;

        // Return the definition if it exists, otherwise fall back to returning null
        return definition ?? null;
    } catch {
        // Catch any network errors completely and silently return null 
        return null;
    }
}

/* ------------------------------------------------------------------ */
/**
 * Fetches `count` random words from local dictionary.json
 * Returns them uppercased with empty clues; the component fetches
 * definitions via fetchDefinition.
 * Falls back to the static WORD_BANK on any error.
 */
// Async function to randomly select a batch of words to be used for the game round
export async function fetchRandomWords(count: number = 100): Promise<WordEntry[]> {
    
    try {
        // Load the array of strings directly from the imported dictionary JSON data
        const rawWords: string[] = dictionaryData;
        // Filter out words that are either too short (less than 4 letters) or too long (more than 10 letters)
        const validWords = rawWords.filter((w) => w.length >= 4 && w.length <= 10);
        
        // If there happen to be no words left after filtering, throw an error to trigger the fallback logic
        if (validWords.length === 0) {
            throw new Error('No words passed the length filter');
        }

        // Shuffle the valid words using Fisher-Yates algorithm
        // Initialize the array we will shuffle with a copy of valid words
        const shuffled = [...validWords];
        // Loop backward through the array
        for (let i = shuffled.length - 1; i > 0; i--) {
            // Pick a random index from 0 up to the current index i
            const j = Math.floor(Math.random() * (i + 1));
            // Swap the element at the random index with the current element
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
            // Once fully shuffled, simply grab the first `count` words (e.g., 100)
            const selected = shuffled.slice(0, count);

        // Map over the selected strings and transform them into WordEntry objects with empty clue strings
        return selected.map((w) => ({
            // Force words into UPPERCASE for visual consistency in the game UI
            word: w.toUpperCase(),
            // Set the clue explicitly to an empty string to indicate it needs to be fetched lazily later
            clue: '',   // filled by the component
        }));
       
    } catch (err) {
        // If any error occurs reading or processing the dictionary (like file not found), log it to the console
        console.error('Failed to get random words from dictionary, falling back to static bank:', err);
        // Gracefully resolve the error by returning the hardcoded WORD_BANK array instead
        return WORD_BANK;
    }
}

// Export the WORD_BANK as the default export of this module for general fallback usage
export default WORD_BANK;