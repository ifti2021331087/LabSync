import { getAdminProfileDataAction } from '@/actions/adminActions';
import { Card } from '@/components/ui/card';
import { ShieldCheck, Lock, LogOut, Server, TerminalSquare } from 'lucide-react';
import { format } from 'date-fns';

export default async function AdminProfile() {
    const admin = await getAdminProfileDataAction();

    if (!admin) {
        return <div className="text-center py-20 text-zinc-500">Profile data not found or unauthorized.</div>;
    }

    // Safely get initials for the avatar
    const getInitials = (name: string) => {
        return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
    };

    return (
        <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto">
            
            {/* Page Header */}
            <div className="flex flex-col gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-5">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    Administrator Profile
                </h1>
                <p className="text-sm text-zinc-500">
                    Manage your system credentials and administrative access.
                </p>
            </div>

            {/* Responsive 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* LEFT COLUMN: Main Profile Info */}
                <div className="flex flex-col gap-6">
                    
                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden relative">
                        {/* Premium Dark Gradient Cover Photo for Admin */}
                        <div className="h-28 bg-gradient-to-br from-slate-800 to-zinc-950 w-full relative">
                            {/* Avatar */}
                            <div className="absolute -bottom-8 left-6 w-20 h-20 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center text-2xl font-bold border-4 border-white dark:border-zinc-950 shadow-sm">
                                {getInitials(admin.name)}
                            </div>
                        </div>
                        
                        {/* Profile Info Body */}
                        <div className="pt-12 p-6 flex flex-col gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                    {admin.name}
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                </h2>
                                <p className="text-sm font-mono text-zinc-500 capitalize tracking-wider mt-0.5">
                                    System {admin.role}
                                </p>
                            </div>

                            <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800 my-2"></div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Email Address</p>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{admin.email}</p>
                                    {admin.emailVerified && (
                                        <span className="inline-block mt-1 text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">Verified</span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Account Created</p>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        {format(new Date(admin.createdAt), "MMMM d, yyyy")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    );
}