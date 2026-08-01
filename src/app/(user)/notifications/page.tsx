import { getUserNotifications, markAllNotificationsAsRead } from "@/actions/notificationActions";
import { 
    Check, 
    X, 
    Send, 
    Clock, 
    AlertTriangle, 
    Building, 
    Ban, 
    PackageCheck, 
    RotateCcw, 
    AlertCircle, 
    ShieldAlert, 
    CheckCircle2, 
    PlusCircle 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function NotificationsPage() {
    const notifications = await getUserNotifications();

    const handleMarkAllAsRead = async (_formData: FormData) => {
        "use server";
        await markAllNotificationsAsRead();
    };

    // Helper function mapping all enum types to matching icons and theme classes
    const getNotificationStyles = (type: string) => {
        switch (type) {
            case "booking_approved":
                return { icon: <Check className="w-5 h-5" />, bgClass: "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400 dark:border dark:border-green-800/50" };
            case "booking_denied":
                return { icon: <X className="w-5 h-5" />, bgClass: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 dark:border dark:border-red-800/50" };
            case "booking_cancelled":
                return { icon: <Ban className="w-5 h-5" />, bgClass: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:border dark:border-zinc-700" };
            case "booking_submitted":
                return { icon: <Send className="w-4 h-4" />, bgClass: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 dark:border dark:border-blue-800/50" };
            case "checkout_active":
                return { icon: <PackageCheck className="w-5 h-5" />, bgClass: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border dark:border-indigo-800/50" };
            case "checkout_returned":
                return { icon: <RotateCcw className="w-5 h-5" />, bgClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border dark:border-emerald-800/50" };
            case "checkout_late":
                return { icon: <AlertCircle className="w-5 h-5" />, bgClass: "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 dark:border dark:border-orange-800/50" };
            case "return_reminder":
                return { icon: <Clock className="w-5 h-5" />, bgClass: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 dark:border dark:border-amber-800/50" };
            case "damage_reported":
                return { icon: <AlertTriangle className="w-5 h-5" />, bgClass: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 dark:border dark:border-rose-800/50" };
            case "damage_investigating":
                return { icon: <ShieldAlert className="w-5 h-5" />, bgClass: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-400 dark:border dark:border-yellow-800/50" };
            case "damage_resolved":
                return { icon: <CheckCircle2 className="w-5 h-5" />, bgClass: "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 dark:border dark:border-teal-800/50" };
            case "equipment_added":
                return { icon: <PlusCircle className="w-5 h-5" />, bgClass: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-400 dark:border dark:border-cyan-800/50" };
            case "system":
            default:
                return { icon: <Building className="w-5 h-5" />, bgClass: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 dark:border dark:border-purple-800/50" };
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Notifications</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Stay updated on your equipment requests and activity.</p>
                </div>
                {notifications.length > 0 && (
                    <form action={handleMarkAllAsRead}>
                        <button 
                            type="submit" 
                            className="inline-flex items-center text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg border border-blue-200/50 dark:border-blue-900/50"
                        >
                            Mark all as read
                        </button>
                    </form>
                )}
            </div>

            {/* Notification List Feed */}
            <div className="flex flex-col gap-3.5">
                {notifications.length === 0 ? (
                    <div className="text-center py-16 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                        <Clock className="w-10 h-10 mx-auto text-zinc-400 dark:text-zinc-600 mb-3 stroke-[1.5]" />
                        <p className="text-zinc-600 dark:text-zinc-400 font-medium">You have no new notifications.</p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">We&apos;ll notify you when something important happens.</p>
                    </div>
                ) : (
                    notifications.map((notif) => {
                        const styles = getNotificationStyles(notif.type);
                        
                        return (
                            <div 
                                key={notif.id} 
                                className={`group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-200 shadow-sm ${
                                    notif.isRead 
                                        ? 'bg-white/80 dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-800/80 opacity-75 hover:opacity-100' 
                                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 border-l-4 border-l-blue-500 shadow-md dark:shadow-zinc-950/50'
                                }`}
                            >
                                <div className="flex items-start gap-3.5 w-full sm:w-auto flex-1 min-w-0">
                                    {/* Icon Badge */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${styles.bgClass}`}>
                                        {styles.icon}
                                    </div>
                                    
                                    {/* Title and Message Content */}
                                    <div className="flex-1 min-w-0 pr-0 sm:pr-4">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className={`text-sm tracking-tight text-zinc-900 dark:text-zinc-100 ${notif.isRead ? 'font-medium' : 'font-semibold'}`}>
                                                {notif.title}
                                            </h3>
                                            {!notif.isRead && (
                                                <span className="inline-block w-2 h-2 rounded-full bg-blue-500" title="Unread notification" />
                                            )}
                                        </div>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                                            {notif.message}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Timestamp Metadata */}
                                <div className="shrink-0 self-end sm:self-center text-xs text-zinc-400 dark:text-zinc-500 font-mono bg-zinc-100 dark:bg-zinc-800/60 px-2.5 py-1 rounded-md border border-zinc-200/50 dark:border-zinc-700/50">
                                    {formatDistanceToNow(notif.createdAt, { addSuffix: true })}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}