import type { ReactNode } from 'react'
import { Navigate } from '@tanstack/react-router'
import { useSession } from '../lib/auth-client'
export function AuthGate({children}:{children:ReactNode}){const{data,isPending}=useSession();if(isPending)return <main className="auth-loading">Validando sua sessão…</main>;if(!data?.user)return <Navigate to="/auth"/>;return <>{children}</>}
