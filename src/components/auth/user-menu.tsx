"use client";

import { authClient, useSession } from '@/lib/auth-client';
import React from 'react'
import { Button, buttonVariants } from '../ui/button'; // <-- Import buttonVariants
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils'; // Optional: if you need to merge classes

export default function UserMenu() {
    const { data: session } = useSession();
    const router = useRouter();

    const handleSignOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/");
                },
            },
        });
    }

    return (
        <div>
            {
                !session && (
                    /* 1. Added asChild here to fix the Link nesting */
                    <Button asChild>
                        <Link href={"/auth/signIn"}>Sign In</Link>
                    </Button>
                )
            }
            {
                session?.user.id && (
                    <DropdownMenu>
                        {/* 2. Removed the <Button> wrapper entirely and styled the Trigger directly */}
                        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "sm" })}>
                            {session.user.image ? (
                                <Image src={session.user.image} alt="User" className="w-8 h-8 rounded-full" width={32} height={32} />
                            ) : (
                                <span>Menu</span>
                            )}
                        </DropdownMenuTrigger>

                        <DropdownMenuContent>
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuItem>
                                    {
                                        session.user.role === 'admin' ? <Link href={"/admin/profile"}>
                                            Profile
                                        </Link> :
                                            <Link href={"/profile"}>
                                                Profile
                                            </Link>
                                    }
                                </DropdownMenuItem>
                                {/* TO-DO */}
                                {/* <DropdownMenuItem>Settings</DropdownMenuItem> */}
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />

                            {/* 3. Removed the <Button> from inside the DropdownMenuItem. 
                                   DropdownMenuItem is already an interactive element! */ }
                            <DropdownMenuItem
                                onClick={handleSignOut}
                                className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                            >
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        </div>
    )
}