"use client"

import { MoreHorizontalIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useTransition } from "react"
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogMedia, 
    AlertDialogTitle, 
    AlertDialogTrigger 
} from "../ui/alert-dialog"
import { banUserByIdAction, deleteUserByIdAction, unBanUserByIdAction } from "@/actions/adminActions"

interface userProps {
    userId: string;
    banned: boolean | null;
    email: string;
    role: string | null;
    currentUserId: string | undefined;
}

export default function MemberActionsDropdown({ userId, banned, email, role, currentUserId }: userProps) {
    const [isPendingBan, startTransitionBan] = useTransition();
    const [isPendingDelete, startTransitionDelete] = useTransition();

    const isSelf = userId === currentUserId;

    const handleBan = () => {
        startTransitionBan(() => {
            if (email === "admin@test.com") {
                toast.success("Demo Mode: User ban simulated successfully!");
                return;
            }
            
            const action = banned ? unBanUserByIdAction(userId) : banUserByIdAction(userId);
            
            action.then((result) => {
                if (result.success) {
                    toast.success(result.message);
                } else {
                    toast.error(`Something went wrong while ${banned ? 'unbanning' : 'banning'} the user.`);
                }
            }).catch(() => toast.error("An unexpected error occurred."));
        });
    }

    const handleDelete = () => {
        startTransitionDelete(() => {
            deleteUserByIdAction(userId).then((result) => {
                if (result.success) {
                    toast.success(result.message);
                } else {
                    toast.error("Something went wrong while deleting the user");
                }
            }).catch(() => toast.error("An unexpected error occurred."));
        });
    }

    return (
        /* 1. Wrap the ENTIRE component in AlertDialog */
        <AlertDialog>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Button variant="ghost" size="icon" className="size-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
                        <MoreHorizontalIcon className="size-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-40 rounded-lg">
                    <DropdownMenuItem 
                        onClick={handleBan} 
                        disabled={isPendingBan || isSelf} 
                    >
                        {banned ? (isPendingBan ? "Unbanning..." : "Unban") : (isPendingBan ? "Banning..." : "Ban")}
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {/* 2. Put the Trigger inside the Menu Item */}
                    <AlertDialogTrigger >
                        {/* The e.preventDefault() prevents the Dropdown from instantly closing and stealing focus! */}
                        <DropdownMenuItem 
                            onSelect={(e) => e.preventDefault()}
                            disabled={isPendingDelete || isSelf}
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                        >
                            {isPendingDelete ? "Deleting..." : "Delete user"}
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* 3. Put the Dialog Content OUTSIDE the DropdownMenu completely */}
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <Trash2Icon />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Delete user?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete this user.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        variant="destructive" 
                        onClick={handleDelete} 
                        disabled={isPendingDelete || isSelf}
                    >
                        {isPendingDelete ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}