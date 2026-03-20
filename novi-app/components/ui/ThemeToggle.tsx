//This component provides a dark/light theme toggle button for the application using next-themes.
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const [mounted, setMounted] = React.useState(false)

React.useEffect(() => {
  setMounted(true)
}, [])

if (!mounted) {
  return (
    <button className="relative flex items-center justify-center p-2.5 rounded-full hover:bg-gray-200 dark:hover:bg-sidebar-accent transition-colors">
      <div className="h-5 w-5 bg-transparent" />
    </button>
  )
}

return (
  <button
    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    className="relative flex items-center justify-center p-2.5 rounded-full text-foreground hover:bg-gray-200 dark:hover:bg-sidebar-accent transition-colors"
    title="Toggle Dark Mode"
  >
    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    <span className="sr-only">Toggle theme</span>
  </button>
)
}