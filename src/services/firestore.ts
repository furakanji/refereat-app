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

export async function createBooking(bookingData: Omit<Booking, "id" | "createdAt" | "status">) {
    try {
        const docRef = await addDoc(collection(db, "bookings"), {
            ...bookingData,
            status: "confirmed", // Auto-confirming for MVP as it comes from Restaurant upload
            createdAt: Timestamp.now(),
        });

        // Also update Influencer's pending balance (assuming logic: 2€ per cover)
        // For MVP, if it's confirmed immediately, maybe goes to available? 
        // Let's say it goes to 'available' immediately for simplicity in this flow,
        // or 'pending' if we want a manual check-in step.
        // The requirements said: "Pending: Registrata dopo la prenotazione... Confirmed: Crediti sbloccati solo dopo verifica."
        // Since the RESTAURANT is uploading the proof, this IS the verification. So it should go to AVAILABLE.

        const creditAmount = bookingData.covers * 2; // Simple logic: 2€ per cover

        // Transaction to update booking and influencer wallet securely
        await runTransaction(db, async (transaction) => {
            const influencerRef = doc(db, "influencers", bookingData.influencerId);
            const influencerDoc = await transaction.get(influencerRef);

            if (!influencerDoc.exists()) {
                throw "Influencer does not exist!";
            }

            const newAvailable = (influencerDoc.data().walletBalance?.available || 0) + creditAmount;

            transaction.update(influencerRef, {
                "walletBalance.available": newAvailable
            });

            // Log credit transaction
            const logRef = doc(collection(db, "credit_logs"));
            transaction.set(logRef, {
                influencerId: bookingData.influencerId,
                bookingId: docRef.id,
                amount: creditAmount,
                type: "earned",
                description: `Commission for booking: ${bookingData.guestName}`,
                createdAt: Timestamp.now()
            });
        });

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
