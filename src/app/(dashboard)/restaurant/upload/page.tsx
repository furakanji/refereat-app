import { VerificationUpload } from "@/components/dashboard/restaurant/VerificationUpload";

export default function UploadPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Report Verification</h2>
                <p className="text-muted-foreground mt-2">
                    Upload a screenshot of your POS system or a receipt to automatically confirm bookings and assign credits.
                </p>
            </div>

            <div className="flex justify-center mt-8">
                <VerificationUpload />
            </div>
        </div>
    );
}
