'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, MessageSquare, PackageOpen, Users } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Mock data - in a real app, this would come from your API/database
const contentSummary = [
    { name: 'Case Studies', value: 8, color: 'hsl(var(--chart-1))' },
    { name: 'Testimonials', value: 12, color: 'hsl(var(--chart-2))' },
    { name: 'Service Plans', value: 4, color: 'hsl(var(--chart-3))' },
];

const recentActivities = [
    { id: 1, type: 'Case Study', action: 'Created', title: 'New Enterprise Solution', date: '2 hours ago' },
    { id: 2, type: 'Testimonial', action: 'Updated', title: 'Feedback from ABC Corp', date: '1 day ago' },
    { id: 3, type: 'Service Plan', action: 'Updated', title: 'Premium Plan', date: '3 days ago' },
    { id: 4, type: 'Case Study', action: 'Updated', title: 'Healthcare Industry Case', date: '5 days ago' },
];

export default function DashboardPage() {
    return (
        <div className="container space-y-6 p-6 pb-16">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                    Welcome to your admin dashboard. Overview of your content and recent activities.
                </p>
            </div>
        </div>
    );
}