export type UserRole = 'restaurant' | 'influencer';

export interface Restaurant {
    id: string;
    name: string;
    email: string;
    address?: string;
    logo?: string;
    createdAt: Date;
    defaultCommissionPercentage?: number; // e.g. 10 for 10%
    // ROI Analytics can be computed or stored here
    totalCreditsSpent: number;
    totalRevenueGenerated: number;
}

export interface Influencer {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    profilePicture?: string;
    restaurantId?: string; // Links influencer to a specific restaurant program

    // Ambassador Specifics
    instagramHandle?: string;
    tiktokHandle?: string;
    commissionPercentage?: number; // Overrides restaurant default
    blackoutDates?: Date[]; // Simplification: using Date[] instead of Timestamp[] for type definition, conversion happens in service

    // Aggregate Stats
    totalBookings?: number;
    totalSpendGenerated?: number;
    totalCreditsEarned?: number;

    walletBalance: {
        pending: number;
        available: number;
        redeemed: number;
    };
}

export type BookingStatus = 'pending' | 'confirmed' | 'redeemed';

export interface Booking {
    id: string;
    restaurantId: string;
    influencerId: string;
    guestName: string; // Extracted from report
    bookingDate: Date;
    covers: number; // Number of people
    totalSpend?: number; // Optional until confirmed
    status: BookingStatus;
    createdAt: Date;
    proofImageUrl?: string; // URL to the uploaded screenshot
}

export interface CreditLog {
    id: string;
    influencerId: string;
    bookingId: string;
    amount: number;
    type: 'earned' | 'redeemed';
    createdAt: Date;
    description: string;
}
