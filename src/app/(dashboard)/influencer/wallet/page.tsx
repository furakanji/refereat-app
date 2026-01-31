import { WalletHistory } from "@/components/dashboard/influencer/WalletHistory";

export default function InfluencerWalletPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Your Wallet</h2>
                <p className="text-muted-foreground mt-2">
                    Track your earnings and redemptions.
                </p>
            </div>

            <WalletHistory />
        </div>
    );
}
