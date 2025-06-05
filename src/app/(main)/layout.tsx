import { AdminSidebar } from '@/components/layout/admin-sidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_1fr]">
            <AdminSidebar />
            <main className="flex min-h-[100dvh] flex-col">
                <div className="flex-1">{children}</div>
            </main>
        </div>
    );
}