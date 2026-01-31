import { LinkGenerator } from "@/components/dashboard/influencer/LinkGenerator";

export default function InfluencerLinksPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Referral Links</h2>
                <p className="text-muted-foreground mt-2">
                    Manage your tracking links.
                </p>
            </div>

            <div className="max-w-xl">
                <LinkGenerator />
            </div>
        </div>
    );
}
