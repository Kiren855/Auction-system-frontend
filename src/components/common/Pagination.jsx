import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

function buildPageItems(page, totalPages, siblingCount = 1) {
  const safePage = Math.max(0, Number(page) || 0);
  const safeTotalPages = Math.max(0, Number(totalPages) || 0);

  if (safeTotalPages <= 0) return [];

  const totalPageNumbersToShow = siblingCount * 2 + 5;

  if (safeTotalPages <= totalPageNumbersToShow) {
    return Array.from({ length: safeTotalPages }, (_, index) => index);
  }

  const leftSiblingIndex = Math.max(safePage - siblingCount, 0);
  const rightSiblingIndex = Math.min(
    safePage + siblingCount,
    safeTotalPages - 1,
  );

  const shouldShowLeftDots = leftSiblingIndex > 1;
  const shouldShowRightDots = rightSiblingIndex < safeTotalPages - 2;

  const firstPageIndex = 0;
  const lastPageIndex = safeTotalPages - 1;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + siblingCount * 2;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i);
    return [...leftRange, 'dots-right', lastPageIndex];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + siblingCount * 2;
    const start = safeTotalPages - rightItemCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => start + i,
    );
    return [firstPageIndex, 'dots-left', ...rightRange];
  }

  const middleRange = [];
  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i += 1) {
    middleRange.push(i);
  }

  return [
    firstPageIndex,
    'dots-left',
    ...middleRange,
    'dots-right',
    lastPageIndex,
  ];
}

export default function Pagination({
  page = 0,
  totalPages = 0,
  totalElements = 0,
  onPageChange,
  className = '',
  siblingCount = 1,
}) {
  const safePage = Math.max(0, Number(page) || 0);
  const safeTotalPages = Math.max(0, Number(totalPages) || 0);
  const safeTotalElements =
    typeof totalElements === 'number' ? totalElements : undefined;

  const canGoPrev = safePage > 0;
  const canGoNext = safePage + 1 < safeTotalPages;

  const pageItems = useMemo(
    () => buildPageItems(safePage, safeTotalPages, siblingCount),
    [safePage, safeTotalPages, siblingCount],
  );

  //   if (safeTotalPages <= 1) return null;

  return (
    <div
      className={`mt-8 flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white px-5 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between ${className}`}
    >
      <div className="text-sm text-slate-500">
        Trang{' '}
        <span className="font-semibold text-slate-900">{safePage + 1}</span> /{' '}
        <span className="font-semibold text-slate-900">{safeTotalPages}</span>
        {typeof safeTotalElements === 'number' ? (
          <>
            {' '}
            · Tổng{' '}
            <span className="font-semibold text-slate-900">
              {safeTotalElements}
            </span>{' '}
            kết quả
          </>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!canGoPrev}
          onClick={() => canGoPrev && onPageChange?.(safePage - 1)}
          className={`inline-flex h-10 items-center gap-2 rounded-2xl px-4 text-sm font-semibold transition ${
            canGoPrev
              ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              : 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
          }`}
        >
          <ChevronLeft size={16} />
          Trước
        </button>

        {pageItems.map((item, index) => {
          if (typeof item === 'string' && item.includes('dots')) {
            return (
              <span
                key={`${item}-${index}`}
                className="inline-flex h-10 min-w-10 items-center justify-center text-slate-400"
              >
                <MoreHorizontal size={16} />
              </span>
            );
          }

          const isActive = item === safePage;

          return (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange?.(item)}
              className={`inline-flex h-10 min-w-10 items-center justify-center rounded-2xl px-3 text-sm font-semibold transition ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item + 1}
            </button>
          );
        })}

        <button
          type="button"
          disabled={!canGoNext}
          onClick={() => canGoNext && onPageChange?.(safePage + 1)}
          className={`inline-flex h-10 items-center gap-2 rounded-2xl px-4 text-sm font-semibold transition ${
            canGoNext
              ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              : 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
          }`}
        >
          Sau
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
