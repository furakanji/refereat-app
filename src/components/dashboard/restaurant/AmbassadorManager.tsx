"use client"

import { useState, useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Settings, Trash2, Instagram, Link as LinkIcon, AlertCircle, Euro } from "lucide-react"
import { addAmbassador, getInfluencers, updateAmbassadorSettings } from "@/services/firestore"
import type { Influencer } from "@/types/firestore"

export function AmbassadorManager({ restaurantId }: { restaurantId: string }) {
    const [ambassadors, setAmbassadors] = useState<Influencer[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [selectedAmbassador, setSelectedAmbassador] = useState<Influencer | null>(null)

    // Add Form State
    const [newAmbassadorName, setNewAmbassadorName] = useState("")
    const [newAmbassadorEmail, setNewAmbassadorEmail] = useState("")
    const [newAmbassadorIG, setNewAmbassadorIG] = useState("")
    const [newAmbassadorType, setNewAmbassadorType] = useState<"email" | "instagram">("email")
    const [adding, setAdding] = useState(false)

    // Settings Form State
    const [editCommission, setEditCommission] = useState("")
    const [savingSettings, setSavingSettings] = useState(false)

    useEffect(() => {
        fetchAmbassadors()
    }, [])

    const fetchAmbassadors = async () => {
        try {
            const data = await getInfluencers()
            // Filter only for this restaurant (in a real app, logic would be cleaner)
            // Assuming getInfluencers returns all, but we only want those linked to THIS restaurant
            // Or ideally getInfluencers should accept a filter. 
            // For MVP, we'll filter on client or server. Since Firestore rules aren't strict here yet:
            const filtered = data.filter(inf => inf.restaurantId === restaurantId || inf.restaurantId === undefined)
            setAmbassadors(filtered)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddAmbassador = async () => {
        if (!newAmbassadorName) return
        setAdding(true)
        try {
            await addAmbassador({
                name: newAmbassadorName,
                email: newAmbassadorType === "email" ? newAmbassadorEmail : undefined,
                instagramHandle: newAmbassadorType === "instagram" ? newAmbassadorIG : undefined,
                restaurantId: restaurantId
            })

            // Success: clear inputs and close dialog immediately
            setNewAmbassadorName("")
            setNewAmbassadorEmail("")
            setNewAmbassadorIG("")
            setAdding(false)
            setIsAddOpen(false)

            // Then refresh list
            await fetchAmbassadors()
        } catch (error) {
            console.error(error)
            setAdding(false) // Only stop loading on error here, forcing user to retry or cancel
            alert("Error adding ambassador. Check console.")
        }
    }

    const openSettings = (ambassador: Influencer) => {
        setSelectedAmbassador(ambassador)
        setEditCommission(ambassador.commissionPercentage?.toString() || "")
        setIsSettingsOpen(true)
    }

    const handleSaveSettings = async () => {
        if (!selectedAmbassador) return
        setSavingSettings(true)
        try {
            const commission = editCommission ? parseFloat(editCommission) : undefined
            await updateAmbassadorSettings(selectedAmbassador.id, {
                commissionPercentage: commission
            })
            setIsSettingsOpen(false)
            fetchAmbassadors()
        } catch (error) {
            console.error(error)
        } finally {
            setSavingSettings(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Ambassadors</h3>
                    <p className="text-sm text-gray-500">Manage your connected creators and their settings.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-orange-600 hover:bg-orange-700">
                            <Plus className="mr-2 h-4 w-4" /> Add Ambassador
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Ambassador</DialogTitle>
                            <DialogDescription>
                                Add a creator to your program. They will appear in your list immediately.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                    placeholder="e.g. Marco Rossi"
                                    value={newAmbassadorName}
                                    onChange={e => setNewAmbassadorName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Add via</Label>
                                <Select value={newAmbassadorType} onValueChange={(v: "email" | "instagram") => setNewAmbassadorType(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="email">Email Address</SelectItem>
                                        <SelectItem value="instagram">Instagram Handle</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {newAmbassadorType === "email" ? (
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        placeholder="marco@example.com"
                                        type="email"
                                        value={newAmbassadorEmail}
                                        onChange={e => setNewAmbassadorEmail(e.target.value)}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label>Instagram Handle</Label>
                                    <div className="relative">
                                        <Instagram className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                        <Input
                                            className="pl-8"
                                            placeholder="@marcorossi"
                                            value={newAmbassadorIG}
                                            onChange={e => setNewAmbassadorIG(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddAmbassador} disabled={adding}>
                                {adding ? "Adding..." : "Add Ambassador"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ambassador</TableHead>
                            <TableHead>Performance</TableHead>
                            <TableHead>Total Spend</TableHead>
                            <TableHead>Credits Earned</TableHead>
                            <TableHead className="text-right">Commission</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    Loading ambassadors...
                                </TableCell>
                            </TableRow>
                        ) : ambassadors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    No ambassadors yet. Add one to get started!
                                </TableCell>
                            </TableRow>
                        ) : (
                            ambassadors.map((amb) => (
                                <TableRow key={amb.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{amb.name}</span>
                                            <span className="text-xs text-gray-500">
                                                {amb.email || amb.instagramHandle || amb.tiktokHandle || "No contract info"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Badge variant="secondary">{amb.totalBookings || 0} Bookings</Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium">€{(amb.totalSpendGenerated || 0).toFixed(2)}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium text-orange-600">€{(amb.totalCreditsEarned || 0).toFixed(2)}</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="outline">
                                            {amb.commissionPercentage ?? 10}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => openSettings(amb)}>
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Settings Dialog */}
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ambassador Settings</DialogTitle>
                        <DialogDescription>
                            Configure settings for <strong>{selectedAmbassador?.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 text-sm">
                        <div className="bg-orange-50 p-4 rounded-lg flex gap-3 text-orange-800 border border-orange-100">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p>Modifying the commission percentage will only affect <strong>new future bookings</strong>. Past credits will remain unchanged.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Commission Percentage (%)</Label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="10"
                                value={editCommission}
                                onChange={e => setEditCommission(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Percentage of client spend that goes to ambassador credits. Default is 10%.
                            </p>
                        </div>
                        <div className="space-y-2 opacity-50 cursor-not-allowed">
                            <Label>Blackout Dates (Coming Soon)</Label>
                            <div className="border rounded-md p-2 bg-gray-50 text-gray-400 text-xs">
                                Calendar selection disabled for MVP
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveSettings} disabled={savingSettings}>
                            {savingSettings ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
