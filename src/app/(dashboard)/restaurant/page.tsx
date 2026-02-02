import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AmbassadorManager } from "@/components/dashboard/restaurant/AmbassadorManager";
import { useAuth } from "@/context/AuthContext";
import { getRestaurantStats, getInfluencers } from "@/services/firestore";
import { Loader2 } from "lucide-react";

export default function RestaurantDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ revenue: 0, activeAmbassadors: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                // Fetch Restaurant Data
                const restaurantData = await getRestaurantStats(user.uid);

                // Fetch Influencers (Ambassadors) count
                // Note: getInfluencers currently fetches ALL. Ideally we should filter by restaurantId.
                // But for MVP/Demo with 1 user, it's "okay" or we filter client side.
                // Let's filter client side for safety if the function returns all.
                const allInfluencers = await getInfluencers();
                // Filter logic: if influencer has 'restaurantId' matching user.uid
                const myAmbassadors = allInfluencers.filter(inf => inf.restaurantId === user.uid);

                setStats({
                    revenue: restaurantData?.totalRevenueGenerated || 0,
                    activeAmbassadors: myAmbassadors.length
                });
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (!user) return null;

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
                        <div className="text-2xl font-bold">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> :
                                new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(stats.revenue)}
                        </div>
                        <p className="text-xs text-muted-foreground">Lifetime revenue from referrals</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Ambassadors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : stats.activeAmbassadors}
                        </div>
                        <p className="text-xs text-muted-foreground">Influencers promoting your restaurant</p>
                    </CardContent>
                </Card>
            </div>

            {/* Ambassador Management Section */}
            <AmbassadorManager restaurantId={user.uid} />
        </div>
    );
}
