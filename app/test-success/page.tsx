export default function TestSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-600">
          Test Payment Success Page
        </h1>
        <p className="mt-4 text-gray-600">
          This is a simple test page to verify deployment.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Deployed at: {new Date().toISOString()}
        </p>
      </div>
    </div>
  )
}