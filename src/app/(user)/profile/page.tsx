import { getUserProfileDataAction } from '@/actions/userActions';
import { Card } from '@/components/ui/card';
import { Building, ShieldCheck, Lock, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import RoleRequestForm from '@/components/forms/RoleRequestForm';

export default async function Profile() {
    // 1. Extract the data from the array shown in your screenshot
    const profileArray = await getUserProfileDataAction();
    const user = profileArray?.[0];

    if (!user) {
        return <div className="text-center py-20 text-zinc-500">User data not found.</div>;
    }

    // Safely get initials for the avatar
    const getInitials = (name: string) => {
        return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
    };

    const roleName = user.role || 'student';

    return (
        <div className="space-y-6 animate-in fade-in max-w-8xl mx-auto">
            
            {/* Page Header */}
            <div className="flex flex-col gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-5">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    Profile & Account
                </h1>
                <p className="text-sm text-zinc-500">
                    Manage your personal information and access levels.
                </p>
            </div>

            {/* Responsive 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Visual Profile Card */}
                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden relative">
                        {/* Gradient Cover Photo */}
                        <div className="h-28 bg-gradient-to-br from-teal-600 to-blue-700 w-full relative">
                            {/* Avatar pushing up into the cover */}
                            <div className="absolute -bottom-8 left-6 w-20 h-20 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-2xl font-bold border-4 border-white dark:border-zinc-950 shadow-sm">
                                {getInitials(user.name)}
                            </div>
                        </div>
                        
                        {/* Profile Info Body */}
                        <div className="pt-12 p-6 flex flex-col gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                    {user.name}
                                </h2>
                                <p className="text-sm font-mono text-zinc-500 capitalize tracking-wider mt-0.5">
                                    {roleName}
                                </p>
                            </div>

                            <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800 my-2"></div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Email Address</p>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.email}</p>
                                    {user.emailVerified && (
                                        <span className="inline-block mt-1 text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full font-bold">Verified</span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Joined</p>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        {format(new Date(user.createdAt), "MMMM d, yyyy")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Role Request Interactive Form */}
                    <RoleRequestForm currentRole={roleName} />
            </div>
        </div>
    );
}