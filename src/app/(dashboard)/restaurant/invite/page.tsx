"use client"

import { useEffect, useState } from "react"
import { InviteInfluencer } from "@/components/dashboard/restaurant/InviteInfluencer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getInvites } from "@/services/firestore"
import { Loader2 } from "lucide-react"

export default function InvitePage() {
    const [invites, setInvites] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Poll for updates or just fetch once for MVP
        getInvites("demo-restaurant").then(setInvites).finally(() => setLoading(false))
    }, [])

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Invite Influencers</h2>
                <p className="text-muted-foreground mt-2">
                    Grow your network by inviting influencers directly.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <InviteInfluencer />

                <Card>
                    <CardHeader>
                        <CardTitle>Sent Invitations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : invites.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No pending invitations.</p>
                        ) : (
                            <ul className="space-y-4">
                                {invites.map((invite) => (
                                    <li key={invite.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium">{invite.email}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(invite.createdAt.toDate()).toLocaleDateString()}</p>
                                        </div>
                                        <Badge variant="secondary">{invite.status}</Badge>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
