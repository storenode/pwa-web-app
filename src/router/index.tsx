import { createBrowserRouter } from 'react-router-dom'
import publicRoutes from '../modules/public/public.routes'
import dashboardRoutes from '../modules/dashboard/dashboard.routes'

export const router = createBrowserRouter([...publicRoutes, ...dashboardRoutes])
