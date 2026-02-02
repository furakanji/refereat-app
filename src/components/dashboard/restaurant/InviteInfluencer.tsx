"use client"

import { useState } from "react"
import { Send, Mail, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { sendInvite } from "@/services/firestore"
import { useAuth } from "@/context/AuthContext"

export function InviteInfluencer() {
    const { user } = useAuth()
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [lastInviteLink, setLastInviteLink] = useState<string | null>(null)

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !user) return

        setLoading(true)
        try {
            const inviteId = await sendInvite(user.uid, email)
            const link = `${window.location.origin}/invite/${inviteId}`
            setLastInviteLink(link)

            // Send Email via Server Action/API
            await fetch("/api/send-invite", {
                method: "POST",
                body: JSON.stringify({
                    email,
                    link,
                    restaurantName: "Your Restaurant" // TODO: Fetch real name from context/props
                })
            })

            setSuccess(true)
            setEmail("")
            // setSuccess(false) // Keep it visible to show the link
        } catch (error) {
            console.error("Failed to send invite:", error)
            alert("Failed to send invite.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="max-w-md">
            <CardHeader>
                <CardTitle>Invite Influencer</CardTitle>
                <CardDescription>Send an invitation to join your restaurant's program.</CardDescription>
            </CardHeader>
            <form onSubmit={handleInvite}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="influencer@example.com"
                                className="pl-8"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    {success && (
                        <div className="space-y-2 text-sm text-green-600 bg-green-50 p-2 rounded-md transition-all">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                <span>Invitation sent!</span>
                            </div>
                            {lastInviteLink && (
                                <div className="mt-2 p-2 bg-white rounded border border-green-200">
                                    <p className="text-xs text-zinc-500 mb-1">Simulated Email Link (Click to test):</p>
                                    <a href={lastInviteLink} target="_blank" className="font-mono text-xs text-primary underline break-all">
                                        {lastInviteLink}
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Send Invite
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
