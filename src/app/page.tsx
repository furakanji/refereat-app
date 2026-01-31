import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white p-4">
      <main className="max-w-4xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            ReferEat
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            The first influencer marketing platform that turns restaurant bookings into monetizable credits.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
          <Card className="bg-zinc-900 border-zinc-800 text-white hover:border-indigo-500 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl">For Restaurants</CardTitle>
              <CardDescription className="text-zinc-400">
                Turn tables 3x faster with influencer-driven bookings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Link href="/restaurant">Restaurant Login</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 text-white hover:border-purple-500 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl">For Creators</CardTitle>
              <CardDescription className="text-zinc-400">
                Monetize your audience with every booking you drive.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                <Link href="/influencer">Creator Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <footer className="pt-12 text-sm text-zinc-600">
          © {new Date().getFullYear()} ReferEat Inc. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
