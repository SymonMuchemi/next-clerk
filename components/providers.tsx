'use client'

import { ThemeProvider, useTheme } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { ConvexClientProvider } from './convex-client-provider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexClientProvider>
      <ThemeProvider
        enableSystem
        attribute='class'
        defaultTheme='dark'
        disableTransitionOnChange
      >
        {children}
        <ToasterProvider />
      </ThemeProvider>
    </ConvexClientProvider>
  )
}

function ToasterProvider() {
  const { resolvedTheme } = useTheme()

  return (
    <Toaster
      richColors
      closeButton
      position='top-center'
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
    />
  )
}
