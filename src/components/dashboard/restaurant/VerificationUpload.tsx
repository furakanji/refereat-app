import { useState, useEffect } from "react"
import { Loader2, Upload, FileText, CheckCircle, AlertCircle, User, Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { createBooking, getInfluencers, findReferral } from "@/services/firestore"
import type { Influencer } from "@/types/firestore"

export function VerificationUpload() {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [matchedReferral, setMatchedReferral] = useState<any>(null)

    const [influencers, setInfluencers] = useState<Influencer[]>([])
    const [selectedInfluencer, setSelectedInfluencer] = useState<string>("")



    useEffect(() => {
        getInfluencers().then(setInfluencers).catch(console.error)
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setResult(null)
            setError(null)
        }
    }

    const handleAnalyze = async () => {
        if (!file) return

        setAnalyzing(true)
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

                // Smart Matching: Check if this guest booked via referral
                if (data.data.guestName) {
                    const referral = await findReferral(data.data.guestName)
                    if (referral) {
                        setMatchedReferral(referral)
                        setSelectedInfluencer(referral.influencerId)
                    }
                }
            } else {
                setError(data.error || "Failed to analyze document.")
            }
        } catch (err) {
            setError("An error occurred. Please try again.")
        } finally {
            setAnalyzing(false)
        }
    }

    const handleConfirm = async () => {
        if (!result || !selectedInfluencer) return

        setLoading(true)
        try {
            await createBooking({
                restaurantId: "demo-restaurant", // Hardcoded for MVP
                influencerId: selectedInfluencer,
                guestName: result.guestName || "Unknown Guest",
                bookingDate: result.bookingDate ? new Date(result.bookingDate) : new Date(),
                covers: result.covers || 2, // Default to 2 if not found
                totalSpend: result.totalSpend || 0,
                proofImageUrl: "skipped-for-mvp" // We would upload to Storage here
            })
            alert("Booking confirmed and credits assigned!")
            setFile(null)
            setResult(null)
            setSelectedInfluencer("")
        } catch (e) {
            console.error("Error creating booking:", e)
            alert("Failed to create booking.")
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
                {/* Step 1: Select Influencer (MVP Attribution) */}
                {!result && (
                    <div className="space-y-2">
                        <Label>Attributed Influencer</Label>
                        {matchedReferral ? (
                            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-md flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-indigo-600" />
                                    <span className="font-medium text-indigo-900">
                                        {influencers.find(i => i.id === matchedReferral.influencerId)?.name || "Matching Influencer"}
                                    </span>
                                </div>
                                <Badge variant="secondary" className="bg-indigo-200 text-indigo-800 hover:bg-indigo-200">
                                    Smart Match
                                </Badge>
                            </div>
                        ) : (
                            <Select value={selectedInfluencer} onValueChange={setSelectedInfluencer}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select influencer..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {influencers.map(inf => (
                                        <SelectItem key={inf.id} value={inf.id}>{inf.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {matchedReferral && (
                            <p className="text-xs text-indigo-600 flex items-center gap-1 mt-1">
                                <Check className="h-3 w-3" />
                                Matched booking for <strong>{matchedReferral.guestName}</strong>
                            </p>
                        )}
                    </div>
                )}

                {/* Step 2: Upload File */}
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="picture">Receipt / Report Image</Label>
                    <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} disabled={!selectedInfluencer} />
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
                                <span className="font-medium text-zinc-900">{result.guestName || "N/A"}</span>
                            </div>
                            <div>
                                <span className="text-zinc-500 block">Date</span>
                                <span className="font-medium text-zinc-900">{result.bookingDate ? new Date(result.bookingDate).toLocaleDateString() : "N/A"}</span>
                            </div>
                            <div>
                                <span className="text-zinc-500 block">Covers</span>
                                <span className="font-medium text-zinc-900">{result.covers || "N/A"}</span>
                            </div>
                            <div>
                                <span className="text-zinc-500 block">Total Spend</span>
                                <span className="font-medium text-zinc-900">{result.totalSpend ? `€${result.totalSpend}` : "N/A"}</span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                {!result ? (
                    <Button onClick={handleAnalyze} disabled={!file || analyzing || !selectedInfluencer} className="w-full">
                        {analyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {analyzing ? "Analyzing..." : "Analyze & Verify"}
                    </Button>
                ) : (
                    <div className="flex gap-2 w-full">
                        <Button variant="outline" onClick={() => setResult(null)} className="flex-1">Cancel</Button>
                        <Button onClick={handleConfirm} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm & Credit
                        </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}
