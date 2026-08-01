import { getAllEquipmentAction, getTotalEquipmentCountAction } from '@/actions/adminActions'
import AdminEquipmentCard from '@/components/admin/adminEquipmentCard'
import UploadEquipmentForm from '@/components/forms/UploadEquipmentForm'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EquipmentCategories } from '@/utils/extraUtils'
import { Camera, PackageOpen, Pencil } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default async function EquipmentPage({ searchParams }:
    { searchParams: Promise<{ category?: string }> }
) {
    const params = await searchParams;
    const category = params.category || "";
    const equipments = await getAllEquipmentAction(category);
    const totalEquipment=await getTotalEquipmentCountAction();
    return (
        <div className="space-y-6">
            <div className='flex justify-between items-center'>
                <h1 className='text-2xl font-semibold text-zinc-900 dark:text-zinc-100'>Equipment inventory</h1>
                <div className="flex items-center gap-3">
                    <UploadEquipmentForm />
                </div>
            </div>

            {/* Category Filters */}
            <div className='flex gap-2 flex-wrap'>
                <Link href="/equipment">
                    <Button variant={!category ? "default" : "outline"} className="rounded-full h-8 px-4 text-xs">
                        All ({totalEquipment})
                    </Button>
                </Link>
                {
                    EquipmentCategories.map((equipment, index) => (
                        <Link key={index} href={`/equipment?category=${equipment.value}`}>
                            <Button
                                variant={category === equipment.value ? "default" : "outline"}
                                className="rounded-full h-8 px-4 text-xs"
                            >
                                {equipment.label} 
                            </Button>
                        </Link>
                    ))
                }
            </div>

            {/* Render Logic: Either show the Empty State OR the Grid */}
            {equipments.length === 0 ? (
                
                /* Centered, Middle-of-the-Page Empty State (Outside the grid) */
                <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-8 mt-6 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/10">
                    <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                        <PackageOpen className="w-7 h-7 text-zinc-400 dark:text-zinc-500" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                        No equipment found
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6 leading-relaxed">
                        {category
                            ? `We couldn't find any inventory items listed under the "${category}" category.`
                            : "Your inventory is completely empty. Start tracking your assets by adding your first piece of equipment."}
                    </p>
                </div>

            ) : (

                /* The actual Grid (only renders if items exist) */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-6">
                    {
                        equipments.map((equipment, index) => (
                            <AdminEquipmentCard equipment={equipment} key={index}></AdminEquipmentCard>
                        ))
                    }
                </div>
            )}
        </div>
    )
}