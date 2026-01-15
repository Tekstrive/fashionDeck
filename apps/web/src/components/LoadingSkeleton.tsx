export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="glass-card rounded-[2.5rem] overflow-hidden animate-pulse"
        >
          {/* Header Skeleton */}
          <div className="p-6 space-y-4 bg-dust/5">
            <div className="flex justify-between">
              <div className="h-5 w-24 bg-dust/20 rounded-full" />
              <div className="h-5 w-16 bg-dust/20 rounded-lg" />
            </div>
            <div className="h-8 w-48 bg-dust/20 rounded-lg" />

            {/* Visual preview dots */}
            <div className="flex gap-4 pt-2">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-16 w-16 bg-dust/10 rounded-xl" />
              ))}
            </div>

            <div className="h-10 w-full bg-dust/10 rounded-xl mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
