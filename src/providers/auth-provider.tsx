'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { jwtVerify } from 'jose'

type User = {
    role: 'user' | 'admin' | null
    userId: string | null
    isAuthenticated: boolean
}

const AuthContext = createContext<{
    user: User
    loading: boolean
}>({
    user: { role: null, userId: null, isAuthenticated: false },
    loading: true
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User>({ role: null, userId: null, isAuthenticated: false })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
                if (!token) throw new Error('No token')

                const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET!))
                setUser({
                    role: payload.role as 'user' | 'admin',
                    userId: payload.userId as string,
                    isAuthenticated: true
                })
            } catch (error) {
                console.error('Token verification failed:', error)
                setUser({ role: null, userId: null, isAuthenticated: false })
            } finally {
                setLoading(false)
            }
        }

        verifyToken()
    }, [])

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
