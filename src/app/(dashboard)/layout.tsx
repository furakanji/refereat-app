"use client"

import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { LogOut } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()

    const handleLogout = async () => {
        await signOut(auth)
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <header className="bg-white border-b h-16 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <div className="bg-orange-600 p-1.5 rounded-md">
                            <span className="text-white font-bold text-lg">R</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight">ReferEat</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 hidden md:inline-block">
                            {user?.email}
                        </span>
                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Log out
                        </Button>
                    </div>
                </header>
                <main className="flex-1 container mx-auto py-8 px-4 max-w-7xl">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    )
}
