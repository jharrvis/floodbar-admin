// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function SimpleTestPage() {
  const now = new Date().toISOString()
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">
          Simple Test Page
        </h1>
        <p className="text-gray-600 mb-4">
          This page is dynamically rendered to test deployment.
        </p>
        <div className="bg-gray-100 p-3 rounded text-sm font-mono">
          Generated: {now}
        </div>
        <div className="mt-4 text-xs text-gray-500">
          If you can see this, deployment is working properly.
        </div>
      </div>
    </div>
  )
}