// Lucian UX/UI Prompt #439 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#439
import React from 'react';
import './lucian-439.css';

export function SkeletonBone({ className = '', style }) {
  return <i className={`u439-bone ${className}`.trim()} style={style} aria-hidden="true" />;
}

/**
 * Wraps any real card with Lucian #439 grid crossfade:
 * While loading=true, bones shimmer in the exact card footprint;
 * When loading=false, real content crossfades + rises smoothly over the bones.
 */
export function SkeletonCrossfade({
  loading,
  skeleton,
  children,
  delay = '0s',
  className = '',
}) {
  return (
    <div
      className={`ux u439-surface ${loading ? 'is-loading' : ''} ${className}`.trim()}
      aria-busy={loading ? 'true' : 'false'}
    >
      <div className="u439-real" style={{ '--d': delay }}>
        {children}
      </div>
      <div className="u439-sk" style={{ '--d': delay }} aria-hidden="true">
        {skeleton}
      </div>
    </div>
  );
}

/** Skeleton card matching a Kanban task card in BoardAssignTab */
export function KanbanTaskCardSkeleton({ count = 2 }) {
  return Array.from({ length: count }).map((_, idx) => (
    <div
      key={idx}
      className="ux bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm space-y-2.5"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <SkeletonBone className="w-14 h-4 rounded" />
          <SkeletonBone className="w-10 h-4 rounded" />
        </div>
        <SkeletonBone className="w-12 h-4 rounded" />
      </div>
      <div className="space-y-1.5">
        <SkeletonBone className="w-full h-3.5" />
        <SkeletonBone className="w-3/4 h-3.5" />
      </div>
      <SkeletonBone className="w-1/2 h-2.5" />
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
        <SkeletonBone className="w-5 h-5 rounded-full shrink-0" />
        <SkeletonBone className="w-24 h-3" />
      </div>
      <div className="pt-1 flex items-center justify-between">
        <SkeletonBone className="w-20 h-3" />
        <SkeletonBone className="w-16 h-5 rounded" />
      </div>
    </div>
  ));
}

/** Skeleton card matching a Phase block in ProgressReviewTab */
export function PhaseCardSkeleton({ count = 2 }) {
  return Array.from({ length: count }).map((_, idx) => (
    <div
      key={idx}
      className="ux bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      aria-hidden="true"
    >
      <div className="p-5 border-b border-slate-100 bg-slate-50/40 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2.5">
              <SkeletonBone className="w-6 h-6 rounded-md shrink-0" />
              <SkeletonBone className="w-2/3 h-4" />
            </div>
            <SkeletonBone className="w-5/6 h-3 ml-8" />
            <SkeletonBone className="w-40 h-3 ml-8" />
          </div>
          <div className="space-y-1.5 text-right shrink-0">
            <SkeletonBone className="w-14 h-7 ml-auto" />
            <SkeletonBone className="w-24 h-3" />
          </div>
        </div>
        <SkeletonBone className="w-full h-2.5 rounded-full" />
      </div>
      <div className="p-5 space-y-4">
        {[0, 1].map((row) => (
          <div key={row} className="space-y-3 pt-3 first:pt-0 border-t first:border-t-0 border-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                <SkeletonBone className="w-16 h-4 rounded" />
                <SkeletonBone className="w-1/2 h-4" />
              </div>
              <SkeletonBone className="w-20 h-5 rounded" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <SkeletonBone className="w-1/2 h-3" />
                <SkeletonBone className="w-full h-10 rounded-lg" />
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <SkeletonBone className="w-1/2 h-3" />
                <SkeletonBone className="w-full h-10 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ));
}

/** Skeleton rows matching data tables (MyTasksTab, DocumentsTab, Admin tables) */
export function TableRowsSkeleton({ columns = 6, rows = 4 }) {
  return Array.from({ length: rows }).map((_, rIdx) => (
    <tr key={rIdx} className="ux" aria-hidden="true">
      {Array.from({ length: columns }).map((__, cIdx) => (
        <td key={cIdx} className="py-3.5 px-4">
          <SkeletonBone
            className="h-3.5"
            style={{
              width: cIdx === 0 ? '68px' : cIdx === 1 ? '85%' : cIdx === columns - 1 ? '76px' : '70%',
            }}
          />
        </td>
      ))}
    </tr>
  ));
}
