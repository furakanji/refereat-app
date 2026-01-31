import { WalletManager } from "@/components/dashboard/restaurant/WalletManager";

export default function WalletPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Wallet Manager</h2>
                <p className="text-muted-foreground mt-2">
                    Manage influencer credits. Redeem them when the influencer dines at your restaurant.
                </p>
            </div>

            <WalletManager />
        </div>
    );
}
