"use client"

import { useState } from "react"
import { Search, CreditCard, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data for influencers who are currently checked in or have pending credits
const initialInfluencers = [
    { id: "1", name: "Chiara Ferragni", credits: 150, checkedIn: true, avatar: "" },
    { id: "2", name: "Fedez", credits: 80, checkedIn: false, avatar: "" },
    { id: "3", name: "Luis Sal", credits: 45, checkedIn: true, avatar: "" },
]

export function WalletManager() {
    const [searchTerm, setSearchTerm] = useState("")
    const [influencers, setInfluencers] = useState(initialInfluencers)

    const filteredInfluencers = influencers.filter((inf) =>
        inf.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleRedeem = (id: string, amount: number) => {
        // In a real app, this would call an API/Firestore transaction
        alert(`Redeeming €${amount} for influencer ID: ${id}`)
        setInfluencers(influencers.map(inf =>
            inf.id === id ? { ...inf, credits: 0 } : inf
        ))
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
                    {filteredInfluencers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No influencers found.
                        </div>
                    ) : (
                        filteredInfluencers.map((influencer) => (
                            <div
                                key={influencer.id}
                                className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-zinc-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={influencer.avatar} />
                                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium leading-none">{influencer.name}</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {influencer.checkedIn ? (
                                                <span className="text-green-600 flex items-center gap-1">● Checked In</span>
                                            ) : (
                                                <span>Not in venue</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Available Credits</p>
                                        <p className="font-bold text-lg">€{influencer.credits}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={influencer.credits > 0 ? "default" : "secondary"}
                                        disabled={influencer.credits === 0}
                                        onClick={() => handleRedeem(influencer.id, influencer.credits)}
                                    >
                                        <CreditCard className="mr-2 h-3.5 w-3.5" />
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
