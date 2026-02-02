import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function InfluencerLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            <aside className="w-full md:w-64 bg-indigo-600 text-white p-6 flex flex-col gap-4">
                <h1 className="text-xl font-bold mb-4">ReferEat Creator</h1>
                <nav className="flex flex-col gap-2">
                    <Button variant="ghost" className="justify-start text-white hover:text-indigo-600 hover:bg-white" asChild>
                        <Link href="/influencer">My Dashboard</Link>
                    </Button>
                    <Button variant="ghost" className="justify-start text-white hover:text-indigo-600 hover:bg-white" asChild>
                        <Link href="/influencer/links">My Links</Link>
                    </Button>
                    <Button variant="ghost" className="justify-start text-white hover:text-indigo-600 hover:bg-white" asChild>
                        <Link href="/influencer/wallet">Wallet & Payouts</Link>
                    </Button>
                </nav>
            </aside>
            <main className="flex-1 p-6 bg-gray-50">
                {children}
            </main>
        </div>
    );
}
