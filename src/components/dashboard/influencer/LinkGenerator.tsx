"use client"

import { useState } from "react"
import { Copy, Check, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LinkGenerator({ influencerId = "demo-user" }: { influencerId?: string }) {
    const [copied, setCopied] = useState(false)
    const link = `https://refereat.com/r/${influencerId}`

    const handleCopy = () => {
        navigator.clipboard.writeText(link)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Referral Link</CardTitle>
                <CardDescription>Share this link to track your bookings automatically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex space-x-2">
                    <Input value={link} readOnly className="font-mono bg-zinc-50" />
                    <Button size="icon" onClick={handleCopy} variant="outline">
                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
