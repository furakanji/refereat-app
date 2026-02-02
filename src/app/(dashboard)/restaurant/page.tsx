"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AmbassadorManager } from "@/components/dashboard/restaurant/AmbassadorManager";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

export default function RestaurantDashboard() {
    const { user } = useAuth();
    const RESTAURANT_ID = user?.uid;

    if (!RESTAURANT_ID) return null; // Should be handled by ProtectedRoute but good for type safety

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Ambassador Program</h2>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue Generated</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">€15,600.00</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Ambassadors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">+3 new this month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Ambassador Management Section */}
            <AmbassadorManager restaurantId={RESTAURANT_ID} />
        </div>
    );
}
