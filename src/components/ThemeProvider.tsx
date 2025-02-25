
import { createContext, useContext, useEffect, useState } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

const ThemeProviderContext = createContext({
  theme: "system" as "light" | "dark" | "system",
  setTheme: (theme: "light" | "dark" | "system") => {},
})

export function ThemeProvider({
  children,
  ...props
}: {
  children: React.ReactNode
}) {
  return (
    <NextThemesProvider {...props} attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  return context
}
