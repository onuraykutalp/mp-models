export default function Loading() {
  return (
    <div className="container-x pt-28 pb-20 lg:pt-36">
      <div className="h-24 w-2/3 max-w-xl animate-pulse bg-paper-dark lg:h-40" />
      <div className="mt-24 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i}>
            <div className="aspect-[3/4] animate-pulse bg-paper-dark" />
            <div className="mt-3 h-4 w-1/2 animate-pulse bg-paper-dark" />
          </div>
        ))}
      </div>
    </div>
  );
}
