import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useThemeStore } from './shared/store/themeStore'
import { AuthProvider } from './shared/providers/AuthProvider'
import { NodesProvider } from './shared/providers/NodesProvider'

function App() {
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <AuthProvider>
      <NodesProvider>
        <RouterProvider router={router} />
      </NodesProvider>
    </AuthProvider>
  )
}

export default App
