"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
    {
        name: "Jan",
        totalSpend: 250,
        revenue: 1400,
    },
    {
        name: "Feb",
        totalSpend: 400,
        revenue: 2200,
    },
    {
        name: "Mar",
        totalSpend: 300,
        revenue: 1700,
    },
    {
        name: "Apr",
        totalSpend: 650,
        revenue: 3500,
    },
    {
        name: "May",
        totalSpend: 500,
        revenue: 2800,
    },
    {
        name: "Jun",
        totalSpend: 800,
        revenue: 4500,
    },
]

export function RoiChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>ROI Analytics</CardTitle>
                <CardDescription>
                    Compare marketing cost vs. generated revenue.
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `€${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                formatter={(value: number) => [`€${value}`, ""]}
                            />
                            <Legend />
                            <Bar dataKey="totalSpend" name="Cost of Credits" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="revenue" name="Revenue Generated" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
