import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { EquipmentTable } from "@/lib/db/schema";
import RequestCheckoutForm from "@/components/forms/RequestCheckoutForm";

export default async function RequestCheckoutPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // Fetch the primary equipment
    const equipment = await db.query.EquipmentTable.findFirst({
        where: eq(EquipmentTable.id, id)
    });

    if (!equipment) {
        notFound();
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12 pt-4">
            
            {/* Page Header Back Navigation */}
            <div className="flex items-start gap-4 mb-8">
                <Link 
                    href={`/equipment/${equipment.id}`} 
                    className="p-2 mt-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        Request checkout
                    </h1>
                    <p className="text-sm text-zinc-500 font-medium mt-1 capitalize">
                        {equipment.name} • {equipment.internalTag}
                    </p>
                </div>
            </div>

            {/* Form + Built-in Summary */}
            <RequestCheckoutForm equipment={equipment} />

        </div>
    );
}