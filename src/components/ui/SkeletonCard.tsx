export default function SkeletonCard() {
  return (
    <div className="flex flex-col bg-slate-900/80 rounded-2xl border border-slate-800/80 p-4 animate-pulse shadow-md space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-8 h-8 rounded-xl bg-slate-800 flex-shrink-0"></div>
          <div className="space-y-1.5 flex-1">
            <div className="h-3 bg-slate-800 rounded-md w-24"></div>
            <div className="h-2.5 bg-slate-800/60 rounded-md w-16"></div>
          </div>
        </div>
        <div className="w-12 h-4 rounded-full bg-slate-800/70"></div>
      </div>

      {/* Position Title */}
      <div className="h-4 bg-slate-800 rounded-md w-5/6 mt-1"></div>

      {/* Tags Chips */}
      <div className="flex gap-1.5 pt-1">
        <div className="h-4.5 w-14 bg-slate-800/70 rounded-md"></div>
        <div className="h-4.5 w-16 bg-slate-800/70 rounded-md"></div>
        <div className="h-4.5 w-10 bg-slate-800/50 rounded-md"></div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between">
        <div className="h-3 w-16 bg-slate-800/60 rounded-md"></div>
        <div className="h-3 w-14 bg-slate-800/60 rounded-md"></div>
      </div>
    </div>
  );
}
