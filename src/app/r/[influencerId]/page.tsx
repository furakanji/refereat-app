"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getReferralPageData, createReferralBooking } from "@/services/firestore"
import { Loader2, CheckCircle, Calendar, Users, Utensils, Store, Clock } from "lucide-react"

export default function PublicBookingPage() {
    const params = useParams()
    const influencerId = params.influencerId as string

    const [influencerName, setInfluencerName] = useState("")
    const [influencerImage, setInfluencerImage] = useState<string | undefined>(undefined)
    const [restaurantName, setRestaurantName] = useState("")
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    // Form State
    const [guestName, setGuestName] = useState("")
    const [date, setDate] = useState("")
    const [time, setTime] = useState("")
    const [guests, setGuests] = useState("2")
    const [phone, setPhone] = useState("")

    const generateTimeSlots = (start: string, end: string) => {
        const slots = []
        let current = new Date(`2000-01-01T${start}:00`)
        const endTime = new Date(`2000-01-01T${end}:00`)

        while (current <= endTime) {
            const timeString = current.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
            slots.push(timeString)
            current.setMinutes(current.getMinutes() + 30)
        }
        return slots
    }

    const lunchSlots = generateTimeSlots("12:00", "14:30")
    const aperitifSlots = generateTimeSlots("18:00", "19:30")
    const dinnerSlots = generateTimeSlots("20:00", "22:30")

    useEffect(() => {
        if (influencerId) {
            getReferralPageData(influencerId).then(data => {
                if (data && data.influencer) {
                    setInfluencerName(data.influencer.name || "an Influencer")
                    setInfluencerImage(data.influencer.profilePicture)

                    if (data.restaurant) {
                        setRestaurantName(data.restaurant.name)
                    } else {
                        setRestaurantName("Partner Restaurant")
                    }
                } else {
                    setInfluencerName("a Friend")
                    setRestaurantName("ReferEat Restaurant")
                }
            })
                .catch(console.error)
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [influencerId])

    const handleBook = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!guestName || !date || !time || !phone) return

        setSubmitting(true)
        try {
            await createReferralBooking({
                influencerId,
                guestName,
                date: `${date}T${time}`, // Combine date and time
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
                        We've received your booking request for <strong>{restaurantName}</strong>, recommended by <strong>{influencerName}</strong>.
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
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm mb-2 border border-orange-100">
                        <Store className="h-8 w-8 text-orange-600" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Book at {restaurantName}</h1>
                    <p className="text-gray-500">
                        Official Reservation Page
                    </p>

                    <div className="flex flex-col items-center gap-2 mt-4 p-3 bg-white/50 rounded-xl border border-orange-100 w-full max-w-xs backdrop-blur-sm">
                        <span className="text-xs uppercase tracking-wider font-semibold text-orange-600">Hosted by</span>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                <AvatarImage src={influencerImage} alt={influencerName} />
                                <AvatarFallback className="bg-orange-200 text-orange-800">
                                    {influencerName.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-gray-900">{influencerName}</span>
                        </div>
                    </div>
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

                            {/* Date and Guests Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
                                        <Input
                                            id="date"
                                            type="date"
                                            className="pl-8"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="guests">Guests</Label>
                                    <div className="relative">
                                        <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
                                        <Input
                                            id="guests"
                                            type="number"
                                            className="pl-8"
                                            min="1"
                                            max="6"
                                            value={guests}
                                            onChange={(e) => setGuests(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Time Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="time">Time</Label>
                                <Select value={time} onValueChange={setTime} required>
                                    <SelectTrigger className="w-full pl-8 relative">
                                        <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                        <SelectValue placeholder="Select a time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Lunch</SelectLabel>
                                            {lunchSlots.map(slot => (
                                                <SelectItem key={`lunch-${slot}`} value={slot}>{slot}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                        <SelectGroup>
                                            <SelectLabel>Aperitif</SelectLabel>
                                            {aperitifSlots.map(slot => (
                                                <SelectItem key={`aperitif-${slot}`} value={slot}>{slot}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                        <SelectGroup>
                                            <SelectLabel>Dinner</SelectLabel>
                                            {dinnerSlots.map(slot => (
                                                <SelectItem key={`dinner-${slot}`} value={slot}>{slot}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
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
