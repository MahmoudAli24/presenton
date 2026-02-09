export default function BlockedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F0FF] via-[#F5F4FF] to-[#FFE8FF] flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-800">
          Access Restricted
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          This application can only be accessed through Ahlan.
        </p>
      </div>
    </div>
  );
}
