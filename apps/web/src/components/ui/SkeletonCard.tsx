export default function SkeletonCard() {
  return (
    <div className="glass-card rounded-3xl overflow-hidden animate-pulse">
      <div className="h-48 bg-dust/10" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 w-3/4 bg-dust/20 rounded-lg" />
          <div className="h-6 w-6 bg-dust/20 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-dust/10 rounded" />
          <div className="h-4 w-5/6 bg-dust/10 rounded" />
          <div className="h-4 w-4/5 bg-dust/10 rounded" />
        </div>
        <div className="h-10 w-full bg-dust/20 rounded-xl" />
      </div>
    </div>
  );
}
