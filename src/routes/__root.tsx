import { createRootRoute, Outlet } from '@tanstack/react-router'

const RootLayout = () => (
  <div className="h-screen w-screen flex flex-col bg-[#f5f5f5] overflow-hidden font-sans antialiased">
    <Outlet />
  </div>
)

export const Route = createRootRoute({ component: RootLayout })
