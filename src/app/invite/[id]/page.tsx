"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getInvitation, acceptInvite } from "@/services/firestore"
import { Loader2, CheckCircle, Store } from "lucide-react"

export default function InviteLandingPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [invite, setInvite] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Registration State
    const [name, setName] = useState("")
    const [password, setPassword] = useState("") // Mock password for MVP

    useEffect(() => {
        if (id) {
            getInvitation(id).then(data => {
                if (data) {
                    setInvite(data)
                } else {
                    setError("Invitation not found or invalid.")
                }
            }).catch(() => setError("Error loading invitation.")).finally(() => setLoading(false))
        }
    }, [id])

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !password) return

        setSubmitting(true)
        try {
            await acceptInvite(id, { name, email: invite.email })
            // In real app, we would log the user in here.
            router.push("/influencer")
        } catch (e) {
            console.error(e)
            alert("Failed to accept invitation.")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error || !invite) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-50 px-4">
                <Card className="w-full max-w-md text-center py-8">
                    <CardContent>
                        <p className="text-red-500 font-medium">{error || "Invalid Invite"}</p>
                        <Button variant="link" onClick={() => router.push("/")}>Go Home</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-zinc-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <Store className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">You've been invited!</CardTitle>
                    <CardDescription>
                        Join the <strong>ReferEat</strong> program for this restaurant.
                        <br />
                        Invitation for: <span className="font-semibold text-zinc-900">{invite.email}</span>
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleJoin}>
                    <CardContent className="space-y-4">
                        {invite.status === "accepted" ? (
                            <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm text-center">
                                This invitation has already been used.
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Chiara Ferragni"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Create Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </>
                        )}
                    </CardContent>
                    <CardFooter>
                        {invite.status !== "accepted" ? (
                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Join & Start Earning
                            </Button>
                        ) : (
                            <Button variant="outline" className="w-full" asChild>
                                <a href="/influencer">Go to Dashboard</a>
                            </Button>
                        )}
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
