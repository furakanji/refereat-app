import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp,
    increment,
    runTransaction
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Booking, Influencer, Restaurant, CreditLog } from "@/types/firestore";

// --- Restaurants ---

export async function getRestaurantStats(restaurantId: string) {
    // In a real app, we might store aggregated stats in the restaurant document
    // or calculate them on the fly from bookings/logs. 
    // For MVP, we'll fetch aggregated data if available, or mock it with a mix of real data.

    const docRef = doc(db, "restaurants", restaurantId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as Restaurant;
    } else {
        // If not found, return null or default
        return null;
    }
}

// --- Influencers ---

export async function getInfluencers() {
    const q = query(collection(db, "influencers"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Influencer));
}

export async function getInfluencerStats(influencerId: string) {
    const docRef = doc(db, "influencers", influencerId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Influencer;
    }
    return null;
}

// --- Bookings ---

// --- Ambassadors (Refactor 2.0) ---

export async function addAmbassador(data: {
    name: string;
    email?: string;
    instagramHandle?: string;
    tiktokHandle?: string;
    restaurantId: string
}) {
    try {
        // Firestore doesn't accept 'undefined' values, so we sanitize the input
        const cleanData = Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v !== undefined)
        );

        const docRef = await addDoc(collection(db, "influencers"), {
            ...cleanData,
            walletBalance: { available: 0, pending: 0, redeemed: 0 },
            totalBookings: 0,
            totalSpendGenerated: 0,
            totalCreditsEarned: 0,
            createdAt: Timestamp.now()
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding ambassador:", e);
        throw e;
    }
}

export async function updateAmbassadorSettings(id: string, settings: {
    commissionPercentage?: number;
    blackoutDates?: Date[]
}) {
    const docRef = doc(db, "influencers", id);
    // Convert Date[] to Timestamp[] if needed, or store as ISO strings/timestamps
    // For simplicity, let's assume we store them as Timestamps or use the library conversion
    // if using "Date" type in interface, Firestore client usually handles Date -> Timestamp conversion on write
    await updateDoc(docRef, settings);
}

// --- Bookings (Refactor 2.0) ---

export async function createBooking(bookingData: Omit<Booking, "id" | "createdAt" | "status"> & { totalSpend?: number }) {
    try {
        // 1. Fetch Influencer to get custom commission or use default
        const influencerRef = doc(db, "influencers", bookingData.influencerId);
        const influencerSnap = await getDoc(influencerRef);
        if (!influencerSnap.exists()) throw "Influencer not found";

        const influencerData = influencerSnap.data() as Influencer;

        // 2. Fetch Restaurant for default commission
        const restaurantRef = doc(db, "restaurants", bookingData.restaurantId);
        const restaurantSnap = await getDoc(restaurantRef);
        const restaurantData = restaurantSnap.exists() ? restaurantSnap.data() as Restaurant : null;

        const defaultCommission = restaurantData?.defaultCommissionPercentage || 10; // Default 10%
        const commissionRate = influencerData.commissionPercentage ?? defaultCommission;

        // 3. Calculate Credits
        // Logic: specific % of totalSpend. If spend not provided (e.g. initial booking request), credit is pending/0 until confirmation.
        // For verify flow (upload receipt), we assume totalSpend IS provided.
        const spend = bookingData.totalSpend || 0;
        const creditAmount = spend > 0 ? (spend * (commissionRate / 100)) : 0;

        const docRef = await addDoc(collection(db, "bookings"), {
            ...bookingData,
            totalSpend: spend,
            status: "confirmed", // Auto-confirming for Verified Upload
            createdAt: Timestamp.now(),
        });

        if (creditAmount > 0) {
            await runTransaction(db, async (transaction) => {
                const infRef = doc(db, "influencers", bookingData.influencerId);
                const infDoc = await transaction.get(infRef);
                if (!infDoc.exists()) throw "Influencer does not exist!";

                const currentData = infDoc.data() as Influencer;
                const newAvailable = (currentData.walletBalance?.available || 0) + creditAmount;
                const newTotalSpend = (currentData.totalSpendGenerated || 0) + spend;
                const newTotalCredits = (currentData.totalCreditsEarned || 0) + creditAmount;
                const newTotalBookings = (currentData.totalBookings || 0) + 1;

                transaction.update(infRef, {
                    "walletBalance.available": newAvailable,
                    "totalSpendGenerated": newTotalSpend,
                    "totalCreditsEarned": newTotalCredits,
                    "totalBookings": newTotalBookings
                });

                const logRef = doc(collection(db, "credit_logs"));
                transaction.set(logRef, {
                    influencerId: bookingData.influencerId,
                    bookingId: docRef.id,
                    amount: creditAmount,
                    type: "earned",
                    description: `Commission (${commissionRate}%) on €${spend} spend`,
                    createdAt: Timestamp.now()
                });
            });
        }

        return docRef.id;
    } catch (e) {
        console.error("Error creating booking:", e);
        throw e;
    }
}

// --- Wallet / Credits ---

export async function redeemCredits(influencerId: string, amount: number) {
    try {
        await runTransaction(db, async (transaction) => {
            const influencerRef = doc(db, "influencers", influencerId);
            const influencerDoc = await transaction.get(influencerRef);

            if (!influencerDoc.exists()) {
                throw "Influencer does not exist!";
            }

            const currentBalance = influencerDoc.data().walletBalance?.available || 0;
            if (currentBalance < amount) {
                throw "Insufficient funds";
            }

            const newAvailable = currentBalance - amount;
            const newRedeemed = (influencerDoc.data().walletBalance?.redeemed || 0) + amount;

            transaction.update(influencerRef, {
                "walletBalance.available": newAvailable,
                "walletBalance.redeemed": newRedeemed
            });

            // Log redemption
            const logRef = doc(collection(db, "credit_logs"));
            transaction.set(logRef, {
                influencerId: influencerId,
                bookingId: "redemption", // No specific booking for redemption
                amount: amount,
                type: "redeemed",
                description: "Credits redeemed at restaurant",
                createdAt: Timestamp.now()
            });
        });
    } catch (e) {
        console.error("Error redeeming credits:", e);
        throw e;
    }
}

// --- Invitations ---

export async function sendInvite(restaurantId: string, email: string) {
    try {
        const docRef = await addDoc(collection(db, "invitations"), {
            restaurantId,
            email,
            status: "pending",
            createdAt: Timestamp.now()
        });
        return docRef.id;
    } catch (e) {
        console.error("Error sending invite:", e);
        throw e;
    }
}

export async function getInvites(restaurantId: string) {
    const q = query(
        collection(db, "invitations"),
        where("restaurantId", "==", restaurantId),
        orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getInvitation(id: string) {
    const docRef = doc(db, "invitations", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
}

export async function acceptInvite(inviteId: string, userData: { name: string, email: string }) {
    try {
        // 0. Get the invite to find the restaurantId
        const inviteRef = doc(db, "invitations", inviteId);
        const inviteSnap = await getDoc(inviteRef);

        if (!inviteSnap.exists()) {
            throw new Error("Invitation not found");
        }

        const restaurantId = inviteSnap.data().restaurantId;

        // 1. Create Influencer Profile
        const influencerRef = await addDoc(collection(db, "influencers"), {
            name: userData.name,
            email: userData.email,
            restaurantId: restaurantId, // Link to restaurant
            walletBalance: { available: 0, pending: 0, redeemed: 0 },
            createdAt: Timestamp.now()
        });

        // 2. Mark invite as accepted
        await updateDoc(inviteRef, {
            status: "accepted",
            acceptedBy: influencerRef.id,
            acceptedAt: Timestamp.now()
        });

        return influencerRef.id;
    } catch (e) {
        console.error("Error accepting invite:", e);
        throw e;
    }
}

// --- Referrals ---

export async function getReferralPageData(influencerId: string) {
    try {
        // 1. Fetch Influencer
        const influencerRef = doc(db, "influencers", influencerId);
        const influencerSnap = await getDoc(influencerRef);

        if (!influencerSnap.exists()) return null;

        const influencerData = { id: influencerSnap.id, ...influencerSnap.data() } as Influencer;
        let restaurantData: Restaurant | null = null;

        // 2. Fetch Restaurant
        // Ideally, influencer has a restaurantId.
        if (influencerData.restaurantId) {
            restaurantData = await getRestaurantStats(influencerData.restaurantId);
        } else {
            // Fallback for legacy data: try to find an accepted invite
            // This is a bit expensive but necessary for backward compatibility in MVP
            const q = query(
                collection(db, "invitations"),
                where("acceptedBy", "==", influencerId),
                where("status", "==", "accepted")
            );
            const inviteSnap = await getDocs(q);
            if (!inviteSnap.empty) {
                const restaurantId = inviteSnap.docs[0].data().restaurantId;
                restaurantData = await getRestaurantStats(restaurantId);
            } else {
                console.log("No restaurant found for influencer");
                // Do not fallback to demo-restaurant anymore
            }
        }

        console.log("getReferralPageData result:", { influencer: influencerData, restaurant: restaurantData });

        return {
            influencer: influencerData,
            restaurant: restaurantData
        };

    } catch (e) {
        console.error("Error fetching referral page data:", e);
        return null;
    }
}

export async function createReferralBooking(data: { influencerId: string, guestName: string, date: string, guests: number, phone: string }) {
    try {
        const docRef = await addDoc(collection(db, "referral_bookings"), {
            ...data,
            status: "pending_visit",
            createdAt: Timestamp.now()
        });
        return docRef.id;
    } catch (e) {
        console.error("Error creating referral booking:", e);
        throw e;
    }
}

export async function findReferral(guestName: string) {
    // Simple verification: partial match on name (case insensitive for a real app, but exact for now)
    // In production, we'd use Algolia or more complex queries.
    // Here we just look for a pending referral with the same guest name.

    const q = query(
        collection(db, "referral_bookings"),
        where("guestName", "==", guestName),
        where("status", "==", "pending_visit")
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        // Return the first match
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as any;
    }
    return null;
}




