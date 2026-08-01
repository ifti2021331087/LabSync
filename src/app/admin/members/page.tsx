import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { Users, UserX, ChevronLeft, ChevronRight } from "lucide-react";
import { getAdminMemberAction } from "@/actions/adminActions";
import MemberActionsDropdown from "@/components/admin/memberActionDropdown";
import { userRolesEnum } from "@/utils/extraForSchema";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Members({ searchParams }: { searchParams: Promise<{ role?: string, page?: string }> }) {
    const params = await searchParams;
    const role = params.role || undefined;
    const currentPage = Number(params.page) || 1;
    const limit = 10; // Number of items per page
    const session=await auth.api.getSession({
        headers:await headers()
    })
    const currentUserId=session?.user.id;
    // Fetch paginated data
    const { members, totalPages } = await getAdminMemberAction(role, currentPage, limit);
    
    // Empty State Check
    if (!members || members.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-20 w-full border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-zinc-900/20 shadow-sm">
                <div className="bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-full mb-4">
                    <UserX className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No members found</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-xs">
                    {role ? `No users found with the ${role} role.` : "There are currently no registered members on the platform."}
                </p>
                {/* Reset filters button if a filter is active */}
                {role && (
                    <Button variant="outline" className="mt-6" asChild>
                        <Link href="/admin/members">Clear Filters</Link>
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                    <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-500" />
                    Manage Members
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    View, monitor, and manage account statuses for all registered members.
                </p>
            </div>

            {/* Category Filters */}
            <div className='flex gap-2 flex-wrap'>
                <Button variant={!role ? "default" : "outline"} className="rounded-full h-8 px-4 text-xs" asChild>
                    <Link href="/admin/members">All</Link>
                </Button>
                
                {userRolesEnum.enumValues.map((enumRole) => (
                    <Button
                        key={enumRole}
                        // FIX: Compare the URL 'role' param against the mapped 'enumRole'
                        variant={role === enumRole ? "default" : "outline"}
                        className="rounded-full h-8 px-4 text-xs capitalize"
                        asChild
                    >
                        {/* Notice we omit 'page' here, intentionally resetting back to page 1 on filter change */}
                        <Link href={`/admin/members?role=${enumRole}`}>
                            {enumRole}
                        </Link>
                    </Button>
                ))}
            </div>

            {/* Table Card */}
            <div className="w-full rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <Table className="w-full text-sm">
                        <TableHeader className="bg-zinc-50/80 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">User</TableHead>
                                <TableHead className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Email</TableHead>
                                <TableHead className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Role</TableHead>
                                <TableHead className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-center">Checkouts</TableHead>
                                <TableHead className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Status</TableHead>
                                <TableHead className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map((member) => {
                                const isBanned = member.status;
                                const memberRole = member.role?.toLowerCase();

                                return (
                                    <TableRow
                                        key={member.id}
                                        className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0"
                                    >
                                        <TableCell className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                                            {member.name}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                                            {member.email}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap">
                                            <Badge 
                                                variant="secondary" 
                                                className={`shadow-none capitalize
                                                    ${memberRole === 'admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : ''}
                                                    ${memberRole === 'faculty' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                                                    ${memberRole === 'student' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                                                `}
                                            >
                                                {memberRole || "Unknown"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <div className="flex flex-col gap-1.5 items-center justify-center">
                                                {member.activeEquipment > 0 && (
                                                    <span className="inline-flex items-center justify-center min-w-[4.5rem] rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30">
                                                        {member.activeEquipment} active
                                                    </span>
                                                )}
                                                {member.pendingEquipment > 0 && (
                                                    <span className="inline-flex items-center justify-center min-w-[4.5rem] rounded-full bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30">
                                                        {member.pendingEquipment} pending
                                                    </span>
                                                )}
                                                {member.activeEquipment === 0 && member.pendingEquipment === 0 && (
                                                    <span className="text-zinc-400">-</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap">
                                            <Badge
                                                variant={isBanned ? "destructive" : "secondary"}
                                                className={!isBanned ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-transparent shadow-none" : "shadow-none"}
                                            >
                                                {!isBanned ? "Active" : "Banned"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right whitespace-nowrap">
                                            <MemberActionsDropdown userId={member.id} banned={isBanned} email={member.email} role={member.role} currentUserId={currentUserId} />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Page <span className="font-semibold text-zinc-900 dark:text-zinc-100">{currentPage}</span> of <span className="font-semibold text-zinc-900 dark:text-zinc-100">{totalPages}</span>
                        </p>
                        <div className="flex gap-2">
                            {currentPage > 1 ? (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/members?page=${currentPage - 1}${role ? `&role=${role}` : ''}`}>
                                        <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                                    </Link>
                                </Button>
                            ) : (
                                <Button variant="outline" size="sm" disabled>
                                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                                </Button>
                            )}

                            {currentPage < totalPages ? (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/members?page=${currentPage + 1}${role ? `&role=${role}` : ''}`}>
                                        Next <ChevronRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </Button>
                            ) : (
                                <Button variant="outline" size="sm" disabled>
                                    Next <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}