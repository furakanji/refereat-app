"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: "credit" | "redeemed";
    status: "completed" | "pending";
}

const mockTransactions: Transaction[] = [
    { id: "1", date: "2024-01-28", description: "Commission - Table 4 (Rossi)", amount: 20, type: "credit", status: "completed" },
    { id: "2", date: "2024-01-25", description: "Redemption at 'Da Mario'", amount: -50, type: "redeemed", status: "completed" },
    { id: "3", date: "2024-01-20", description: "Commission - Table 2 (Bianchi)", amount: 15, type: "credit", status: "completed" },
    { id: "4", date: "2024-01-19", description: "Commission - Table 8", amount: 35, type: "credit", status: "pending" },
]

export function WalletHistory() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockTransactions.map((tx) => (
                            <TableRow key={tx.id}>
                                <TableCell>{tx.date}</TableCell>
                                <TableCell>{tx.description}</TableCell>
                                <TableCell>
                                    {tx.status === "pending" ? (
                                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>
                                    )}
                                </TableCell>
                                <TableCell className={`text-right font-medium ${tx.type === 'redeemed' ? 'text-red-600' : 'text-green-600'}`}>
                                    {tx.type === 'redeemed' ? '-' : '+'}€{Math.abs(tx.amount)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
