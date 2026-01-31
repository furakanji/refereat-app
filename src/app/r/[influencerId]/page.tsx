"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getInfluencerStats, createReferralBooking } from "@/services/firestore"
import { Loader2, CheckCircle, Calendar, Users, Utensils } from "lucide-react"

export default function PublicBookingPage() {
    const params = useParams()
    const influencerId = params.influencerId as string

    const [influencerName, setInfluencerName] = useState("")
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    // Form State
    const [guestName, setGuestName] = useState("")
    const [date, setDate] = useState("")
    const [guests, setGuests] = useState("2")
    const [phone, setPhone] = useState("")

    useEffect(() => {
        if (influencerId) {
            getInfluencerStats(influencerId).then(data => {
                if (data) {
                    setInfluencerName(data.name || "an Influencer")
                } else {
                    setInfluencerName("a Friend") // Fallback
                }
            }).finally(() => setLoading(false))
        }
    }, [influencerId])

    const handleBook = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!guestName || !date || !phone) return

        setSubmitting(true)
        try {
            await createReferralBooking({
                influencerId,
                guestName,
                date,
                guests: parseInt(guests),
                phone
            })
            setSuccess(true)
        } catch (e) {
            console.error(e)
            alert("Failed to submit booking request.")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-orange-50"><Loader2 className="animate-spin text-orange-600" /></div>
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-orange-50 p-4">
                <Card className="max-w-md w-full text-center py-10">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl mb-2">Request Sent!</CardTitle>
                    <CardDescription>
                        We've received your booking request recommended by <strong>{influencerName}</strong>.
                        The restaurant will confirm shortly.
                    </CardDescription>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-orange-50 flex flex-col items-center py-10 px-4">
            <div className="max-w-md w-full space-y-6">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600 mb-2">
                        <Utensils className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Book a Table</h1>
                    <p className="text-gray-500">
                        Recommended by <span className="font-semibold text-orange-600">{influencerName}</span>
                    </p>
                </div>

                <Card>
                    <form onSubmit={handleBook}>
                        <CardContent className="space-y-4 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Your Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Mario Rossi"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date & Time</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                        <Input
                                            id="date"
                                            className="pl-8"
                                            placeholder="Tomorrow 8PM"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="guests">Guests</Label>
                                    <div className="relative">
                                        <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                        <Input
                                            id="guests"
                                            type="number"
                                            className="pl-8"
                                            min="1"
                                            max="20"
                                            value={guests}
                                            onChange={(e) => setGuests(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+39 333 1234567"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={submitting}>
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Request Booking
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <p className="text-center text-xs text-gray-400">
                    Powered by ReferEat
                </p>
            </div>
        </div>
    )
}
