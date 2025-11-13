export default function BookingLoading() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <div className="h-20 bg-white border-b animate-pulse" />

      {/* Hero skeleton */}
      <div className="relative h-[300px] bg-gray-300 animate-pulse" />

      {/* Search section skeleton */}
      <div className="container mx-auto px-4 -mt-16 relative z-20 mb-12">
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                <div className="h-11 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rooms section skeleton */}
      <div className="container mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-64 mx-auto mb-4" />
          <div className="h-6 bg-gray-100 rounded animate-pulse w-96 mx-auto" />
        </div>

        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="relative h-64 lg:h-auto min-h-[256px] bg-gray-200 animate-pulse" />
                <div className="lg:col-span-2 p-6 space-y-4">
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                  <div className="flex gap-4 mt-4">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-24" />
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-24" />
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-24" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    {[...Array(4)].map((_, j) => (
                      <div
                        key={j}
                        className="h-4 bg-gray-100 rounded animate-pulse"
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 mt-6 border-t">
                    <div className="h-10 bg-gray-200 rounded animate-pulse w-32" />
                    <div className="h-11 bg-gray-200 rounded-lg animate-pulse w-32" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="h-96 bg-gray-900 animate-pulse" />
    </main>
  );
}
