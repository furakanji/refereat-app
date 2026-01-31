"use client"

import { useEffect, useState } from "react"
import { LinkGenerator } from "@/components/dashboard/influencer/LinkGenerator"
import { StatsOverview } from "@/components/dashboard/influencer/StatsOverview"
import { getInfluencerStats } from "@/services/firestore"
import type { Influencer } from "@/types/firestore"

export default function InfluencerDashboard() {
    const [influencer, setInfluencer] = useState<Influencer | null>(null)

    // For MVP demo, we'll pick a hardcoded ID or just mock it if not found
    const demoId = "demo-influencer"

    useEffect(() => {
        // In a real app, this comes from auth context
        getInfluencerStats(demoId).then(data => {
            if (data) {
                setInfluencer(data)
            } else {
                // Set mock data if verified user logic isn't fully there yet
                setInfluencer({
                    id: "demo",
                    name: "Chiara F.",
                    email: "demo@refereat.com",
                    walletBalance: { available: 120, pending: 45, redeemed: 50 }
                } as Influencer)
            }
        })
    }, [])

    const stats = influencer ? {
        available: influencer.walletBalance?.available,
        pending: influencer.walletBalance?.pending,
        totalBookings: 14, // Mock
        totalClicks: 342 // Mock
    } : {}

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Welcome, {influencer?.name || "Influencer"}</h2>

            <StatsOverview stats={stats} />

            <div className="grid gap-4 md:grid-cols-2">
                <LinkGenerator influencerId={influencer?.id} />
                {/* We can add a "Recent Activity" card here later */}
            </div>
        </div>
    )
}
