'use client'

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateEquipmentStockAction } from '@/actions/adminActions';
import { toast } from 'sonner';
import { Minus, Plus, Loader2 } from 'lucide-react';

interface UpdateStockProps {
  equipmentId: string;
  initialStock: number;
}

export default function UpdateStock({ equipmentId, initialStock }: UpdateStockProps) {
  // Use transition to handle loading states smoothly without blocking the UI
  const [isPending, startTransition] = useTransition();
  const [stock, setStock] = useState<number>(initialStock || 0);

  const handleUpdate = (newStock: number) => {
    if (newStock < 0) return; // Prevent negative stock
    
    // Optimistically update the UI
    setStock(newStock); 

    startTransition(async () => {
      const res = await updateEquipmentStockAction(equipmentId, newStock);
      if (res.success) {
        toast.success("Stock updated successfully");
      } else {
        toast.error(res.error || "Failed to update stock");
        setStock(initialStock); // Revert to initial stock if it fails
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center space-x-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-8 h-8 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800"
          onClick={() => handleUpdate(stock - 1)} 
          disabled={isPending || stock <= 0}
        >
          <Minus className="w-4 h-4" />
        </Button>
        
        <Input
          type="number"
          value={stock}
          onChange={(e) => {
             const val = parseInt(e.target.value);
             if (!isNaN(val)) handleUpdate(val);
          }}
          className="w-16 h-8 text-center border-none shadow-none bg-transparent focus-visible:ring-0 font-medium"
          disabled={isPending}
        />
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-8 h-8 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800"
          onClick={() => handleUpdate(stock + 1)} 
          disabled={isPending}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {isPending && <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />}
    </div>
  );
}