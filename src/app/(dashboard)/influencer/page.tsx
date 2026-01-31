import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InfluencerDashboard() {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Creator Dashboard</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">€0.00</div>
                        <p className="text-xs text-muted-foreground">Ready to redeem</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">€0.00</div>
                        <p className="text-xs text-muted-foreground">Waiting for check-in</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
