import { getPendingRoleRequestsAction } from '@/actions/adminActions';
import ReviewRoleButtons from '@/components/admin/ReviewRoleButtons';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ShieldAlert, ArrowRight, User } from 'lucide-react';

export default async function Role() {
  const requests = await getPendingRoleRequestsAction();

  // Helper to get initials
  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-indigo-500" />
          Role Requests
        </h1>
        <p className="text-sm text-zinc-500">
          Review and approve user requests for elevated system access.
        </p>
      </div>

      {/* List Container */}
      <div className="flex flex-col gap-4">
        {requests.length === 0 ? (
          <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed bg-zinc-50/50 dark:bg-zinc-900/10 shadow-none">
            <User className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mb-3" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No pending requests</h3>
            <p className="text-sm text-zinc-500 mt-1">When users request role upgrades, they will appear here.</p>
          </Card>
        ) : (
          requests.map((req) => (
            <Card key={req.id} className="p-5 border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">

              {/* User Info & Role Transition */}
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center min-w-0">
                {/* Avatar */}
                <div className="hidden sm:flex w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 items-center justify-center font-bold text-sm shrink-0">
                  {getInitials(req.userName)}
                </div>

                <div className="flex flex-col min-w-0 gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {req.userName || "Unknown User"}
                    </span>
                    <span className="text-xs text-zinc-500 truncate">
                      ({req.userEmail})
                    </span>
                  </div>

                  {/* Role Badges */}
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 capitalize">
                      {req.currentRole || "student"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 capitalize border border-indigo-200 dark:border-indigo-800">
                      {req.requestedRole}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reason Box & Actions */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full md:w-auto">

                {/* Reason Text */}
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 max-w-sm w-full md:w-64 text-xs text-zinc-600 dark:text-zinc-400 italic">
                  <span className="font-semibold not-italic block mb-1 text-zinc-700 dark:text-zinc-300">Reason:</span>
                  &quot;{req.reason}&quot;
                  <div className="text-[10px] text-zinc-400 not-italic mt-2">
                    Submitted {formatDistanceToNow(req.createdAt)} ago
                  </div>
                </div>

                {/* Interactive Client Buttons */}
                <div className="shrink-0">
                  <ReviewRoleButtons requestId={req.id} />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}