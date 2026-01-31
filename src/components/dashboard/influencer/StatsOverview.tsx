"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, Wallet, Users, MousePointerClick } from "lucide-react"

interface StatsProps {
    stats: {
        pending?: number;
        available?: number;
        totalClicks?: number;
        totalBookings?: number;
    }
}

export function StatsOverview({ stats = {} }: StatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available to Redeem</CardTitle>
                    <Wallet className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">€{stats.available || 0}</div>
                    <p className="text-xs text-muted-foreground">Ready for payout/use</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Credits</CardTitle>
                    <ArrowUpRight className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">€{stats.pending || 0}</div>
                    <p className="text-xs text-muted-foreground">Waiting for check-in</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalBookings || 0}</div>
                    <p className="text-xs text-muted-foreground">+2 since last week</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Link Clicks</CardTitle>
                    <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalClicks || 0}</div>
                    <p className="text-xs text-muted-foreground">+12% conversion rate</p>
                </CardContent>
            </Card>
        </div>
    )
}
