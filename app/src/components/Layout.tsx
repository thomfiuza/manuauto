import type { ReactNode } from 'react'
import { AppHeader } from './AppHeader'
import { AuthGate } from './AuthGate'

export function Layout({ children }: { children: ReactNode }) {
  return <AuthGate><AppHeader /><main className="page-shell">{children}</main></AuthGate>
}
