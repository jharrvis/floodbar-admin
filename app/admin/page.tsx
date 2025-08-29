import { BarChart3, Users, FileText, Settings } from 'lucide-react'

const stats = [
  {
    name: 'Total Visitors',
    value: '1,234',
    icon: BarChart3,
    change: '+12%',
    changeType: 'positive'
  },
  {
    name: 'Active Users',
    value: '23',
    icon: Users,
    change: '+5%',
    changeType: 'positive'
  },
  {
    name: 'Landing Pages',
    value: '3',
    icon: FileText,
    change: '0%',
    changeType: 'neutral'
  },
  {
    name: 'System Status',
    value: 'Online',
    icon: Settings,
    change: '99.9%',
    changeType: 'positive'
  }
]

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.name}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {item.name}
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {item.value}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span
                    className={`font-medium ${
                      item.changeType === 'positive'
                        ? 'text-green-600'
                        : item.changeType === 'negative'
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {item.change}
                  </span>
                  <span className="text-gray-500"> from last month</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors">
              Edit Landing Page
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors">
              Add New User
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors">
              View Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}