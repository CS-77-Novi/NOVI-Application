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
}