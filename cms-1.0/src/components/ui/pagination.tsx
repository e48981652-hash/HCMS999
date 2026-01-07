import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "./button";

interface PaginationProps extends React.ComponentProps<"nav"> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  className,
  ...props
}: PaginationProps) {
  const pages = React.useMemo(() => {
    const pageNumbers: (number | "ellipsis")[] = [];
    const totalNumbers = siblingCount * 2 + 5; // siblingCount on each side + current + first + last + 2 ellipses
    const totalBlocks = totalNumbers + 2; // + first and last

    if (totalPages <= totalBlocks) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
      const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
      const shouldShowLeftEllipsis = leftSiblingIndex > 2;
      const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 2;

      if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
        // Show left pages and right ellipsis
        for (let i = 1; i <= 3 + 2 * siblingCount; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("ellipsis");
        pageNumbers.push(totalPages);
      } else if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
        // Show left ellipsis and right pages
        pageNumbers.push(1);
        pageNumbers.push("ellipsis");
        for (let i = totalPages - (2 + 2 * siblingCount); i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Show both ellipses
        pageNumbers.push(1);
        pageNumbers.push("ellipsis");
        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("ellipsis");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  }, [currentPage, totalPages, siblingCount]);

  if (totalPages <= 1) return null;

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    >
      <ul className="flex flex-row items-center gap-1">
        {showFirstLast && (
          <li>
            <PaginationButton
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              aria-label="Go to first page"
            >
              <ChevronLeft className="h-4 w-4" />
              <ChevronLeft className="h-4 w-4 -ml-2" />
            </PaginationButton>
          </li>
        )}
        <li>
          <PaginationButton
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </PaginationButton>
        </li>
        {pages.map((page, index) => (
          <li key={index}>
            {page === "ellipsis" ? (
              <span className="flex h-9 w-9 items-center justify-center">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More pages</span>
              </span>
            ) : (
              <PaginationButton
                onClick={() => onPageChange(page)}
                isActive={currentPage === page}
                aria-label={`Go to page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </PaginationButton>
            )}
          </li>
        ))}
        <li>
          <PaginationButton
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            <ChevronRight className="h-4 w-4" />
          </PaginationButton>
        </li>
        {showFirstLast && (
          <li>
            <PaginationButton
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Go to last page"
            >
              <ChevronRight className="h-4 w-4" />
              <ChevronRight className="h-4 w-4 -ml-2" />
            </PaginationButton>
          </li>
        )}
      </ul>
    </nav>
  );
}

interface PaginationButtonProps extends ButtonProps {
  isActive?: boolean;
}

function PaginationButton({ isActive, className, ...props }: PaginationButtonProps) {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="icon"
      className={cn(
        "h-9 w-9",
        isActive && "pointer-events-none",
        className
      )}
      {...props}
    />
  );
}
