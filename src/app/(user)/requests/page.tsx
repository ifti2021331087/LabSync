import { getUserRequestsAction, getUserTotalBookingCount } from '@/actions/userActions'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import RequestCard from '@/components/user/RequestCard'
import { bookingStatusEnum } from '@/utils/extraForSchema'
import { PackageOpen, Pencil } from 'lucide-react'
import Link from 'next/link'

type RequestStatus = "active" | "pending" | "approved" | "returned" | "denied" | "cancelled" | "late";

export default async function Requests({ searchParams }:
  { searchParams: Promise<{ status?: RequestStatus, page: string }> }
) {
  const params = await searchParams;
  const status = params.status || undefined;
  const allRequests = await getUserRequestsAction(status);
  const data = await getUserTotalBookingCount();
  const totalRequests = Array.isArray(data) && data.length > 0 ? data[0].totalRequests : 0;

  const currentPage = Number(params.page) || 1;
  const ITEMS_PER_PAGE = 4;
  const totalItems = allRequests.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedRequests = allRequests.slice(startIndex, endIndex);

  // HELPER FUNCTION: Preserves the status parameter if it exists
  const createPageURL = (pageNumber: number) => {
    if (status) return `?status=${status}&page=${pageNumber}`;
    return `?page=${pageNumber}`;
  };

  return (
    <div className="space-y-6">
      <h1 className='text-lg font-semibold'>My Requests</h1>
      <Label>All submitted checkout requests</Label>
      <div className='flex gap-2 flex-wrap'>
        <Link href="/requests">
          <Button variant={!status ? "default" : "outline"} className="rounded-full h-8 px-4 text-xs">
            All ({totalRequests})
          </Button>
        </Link>
        {
          bookingStatusEnum.enumValues.map((statusValue, index) => (
            <Link key={index} href={`/requests?status=${statusValue}`}>
              {/* Notice we don't pass 'page' here, so changing filters intentionally resets to page 1 */}
              <Button
                variant={status === statusValue ? "default" : "outline"}
                className="rounded-full h-8 px-4 text-xs"
              >
                {statusValue}
              </Button>
            </Link>
          ))
        }
      </div>

      {allRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-8 mt-6 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/10">
          <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <PackageOpen className="w-7 h-7 text-zinc-400 dark:text-zinc-500" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            No request found
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6 leading-relaxed">
            {status
              ? `We couldn't find any request under the "${status}" status.`
              : "You haven't made any equipment requests yet."} 
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {
            paginatedRequests.map((request, index) => (
              <RequestCard key={index} request={request}></RequestCard>
            ))
          }
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="">
          <PaginationContent>

            <PaginationItem>
              <PaginationPrevious
                // UPDATED: Use the helper function
                href={currentPage > 1 ? createPageURL(currentPage - 1) : "#"}
                aria-disabled={currentPage <= 1}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => {
              const pageNum = i + 1;
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    // UPDATED: Use the helper function
                    href={createPageURL(pageNum)}
                    isActive={currentPage === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                // UPDATED: Use the helper function
                href={currentPage < totalPages ? createPageURL(currentPage + 1) : "#"}
                aria-disabled={currentPage >= totalPages}
                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}