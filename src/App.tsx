import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { queryClient } from './lib/queryClient'
import { useThemeStore } from './shared/store/themeStore'
import { AuthProvider } from './shared/providers/AuthProvider'
import { NodesProvider } from './shared/providers/NodesProvider'

function App() {
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NodesProvider>
          <RouterProvider router={router} />
        </NodesProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
