"use client"

import { useState } from "react"
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function VerificationUpload() {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setResult(null)
            setError(null)
        }
    }

    const handleUpload = async () => {
        if (!file) return

        setLoading(true)
        setError(null)

        const formData = new FormData()
        formData.append("file", file)

        try {
            const response = await fetch("/api/verify-booking", {
                method: "POST",
                body: formData,
            })

            const data = await response.json()

            if (response.ok) {
                setResult(data.data)
            } else {
                setError(data.error || "Failed to analyze document.")
            }
        } catch (err) {
            setError("An error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Verify Booking</CardTitle>
                <CardDescription>Upload a receipt or report to verify a booking.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="picture">Receipt / Report Image</Label>
                    <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} />
                </div>

                {file && (
                    <div className="flex items-center gap-2 text-sm text-zinc-600 bg-zinc-100 p-2 rounded-md">
                        <FileText className="h-4 w-4" />
                        <span className="truncate">{file.name}</span>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                )}

                {result && (
                    <div className="bg-green-50 p-4 rounded-md space-y-2 border border-green-200">
                        <div className="flex items-center gap-2 text-green-700 font-semibold">
                            <CheckCircle className="h-4 w-4" />
                            <span>Verification Successful</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-zinc-500 block">Guest Name</span>
                                <span className="font-medium">{result.guestName || "N/A"}</span>
                            </div>
                            <div>
                                <span className="text-zinc-500 block">Date</span>
                                <span className="font-medium">{result.bookingDate ? new Date(result.bookingDate).toLocaleDateString() : "N/A"}</span>
                            </div>
                            <div>
                                <span className="text-zinc-500 block">Covers</span>
                                <span className="font-medium">{result.covers || "N/A"}</span>
                            </div>
                            <div>
                                <span className="text-zinc-500 block">Total Spend</span>
                                <span className="font-medium">{result.totalSpend ? `€${result.totalSpend}` : "N/A"}</span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button onClick={handleUpload} disabled={!file || loading} className="w-full">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? "Analyzing..." : "Analyze & Verify"}
                </Button>
            </CardFooter>
        </Card>
    )
}
