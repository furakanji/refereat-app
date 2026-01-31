import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RestaurantLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            <aside className="w-full md:w-64 bg-zinc-900 text-white p-6 flex flex-col gap-4">
                <h1 className="text-xl font-bold mb-4">ReferEat Business</h1>
                <nav className="flex flex-col gap-2">
                    <Button variant="ghost" className="justify-start text-white hover:text-zinc-900 hover:bg-white" asChild>
                        <Link href="/restaurant">Dashboard</Link>
                    </Button>
                    <Button variant="ghost" className="justify-start text-white hover:text-zinc-900 hover:bg-white" asChild>
                        <Link href="/restaurant/upload">Upload Report</Link>
                    </Button>
                    <Button variant="ghost" className="justify-start text-white hover:text-zinc-900 hover:bg-white" asChild>
                        <Link href="/restaurant/wallet">Wallet Manager</Link>
                    </Button>
                </nav>
            </aside>
            <main className="flex-1 p-6 bg-gray-50">
                {children}
            </main>
        </div>
    );
}
