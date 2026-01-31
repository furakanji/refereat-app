"use client"

import { useState, useEffect } from "react"
import { Search, CreditCard, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInfluencers, redeemCredits } from "@/services/firestore"
import type { Influencer } from "@/types/firestore"

export function WalletManager() {
    const [searchTerm, setSearchTerm] = useState("")
    const [influencers, setInfluencers] = useState<Influencer[]>([])
    const [loading, setLoading] = useState(true)
    const [redeeming, setRedeeming] = useState<string | null>(null)

    useEffect(() => {
        fetchInfluencers()
    }, [])

    const fetchInfluencers = async () => {
        try {
            const data = await getInfluencers()
            setInfluencers(data)
        } catch (error) {
            console.error("Failed to fetch influencers:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredInfluencers = influencers.filter((inf) =>
        inf.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleRedeem = async (id: string, amount: number) => {
        if (!confirm(`Redeem €${amount} for this influencer?`)) return

        setRedeeming(id)
        try {
            await redeemCredits(id, amount)
            alert("Credits redeemed successfully!")
            // Refresh list
            await fetchInfluencers()
        } catch (error) {
            console.error("Redemption failed:", error)
            alert("Failed to redeem credits. Check console.")
        } finally {
            setRedeeming(null)
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Wallet Manager</CardTitle>
                <CardDescription>Search influencers and redeem their credits at checkout.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search influencer by name..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="space-y-4 mt-4">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredInfluencers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {searchTerm ? "No influencers found matching your search." : "No influencers found."}
                        </div>
                    ) : (
                        filteredInfluencers.map((influencer) => (
                            <div
                                key={influencer.id}
                                className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-zinc-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        {/* Avatar Image not yet in schema, using fallback */}
                                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium leading-none">{influencer.name}</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {/* Mocking Check-in status for now as it's not in schema */}
                                            {influencer.walletBalance?.available > 0 ? (
                                                <span className="text-green-600 flex items-center gap-1">● Active</span>
                                            ) : (
                                                <span>No credits</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Available Credits</p>
                                        <p className="font-bold text-lg">€{influencer.walletBalance?.available || 0}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={influencer.walletBalance?.available > 0 ? "default" : "secondary"}
                                        disabled={!influencer.walletBalance?.available || influencer.walletBalance.available <= 0 || redeeming === influencer.id}
                                        onClick={() => handleRedeem(influencer.id, influencer.walletBalance.available)}
                                    >
                                        {redeeming === influencer.id ? (
                                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <CreditCard className="mr-2 h-3.5 w-3.5" />
                                        )}
                                        Redeem
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
