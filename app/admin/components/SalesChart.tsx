'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Calendar, BarChart3 } from 'lucide-react'

// Dynamically import Chart.js components to avoid SSR issues
const Line = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Line),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
)

// Chart.js registration
const initChart = async () => {
  const {
    Chart: ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } = await import('chart.js')

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  )
}

interface SalesData {
  month: string
  monthYear: string
  sales: number
  orders: number
  quantity: number  // Tambahkan quantity field
}

interface SalesChartProps {
  onDateRangeChange?: (startDate: string, endDate: string) => void
}

export default function SalesChart({ onDateRangeChange }: SalesChartProps) {
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [loading, setLoading] = useState(true)
  const [chartReady, setChartReady] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('1year') // Default 1 tahun
  const [isCustomRange, setIsCustomRange] = useState(false)
  const [chartType, setChartType] = useState('sales') // 'sales' atau 'quantity'
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    initChart().then(() => setChartReady(true))
    fetchSalesData()
  }, [])

  useEffect(() => {
    fetchSalesData()
    if (dateRange.startDate && dateRange.endDate) {
      onDateRangeChange?.(dateRange.startDate, dateRange.endDate)
    }
  }, [selectedPeriod, dateRange])

  const fetchSalesData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      // Jika custom range dan ada tanggal yang diisi
      if (isCustomRange && dateRange.startDate && dateRange.endDate) {
        params.append('startDate', dateRange.startDate)
        params.append('endDate', dateRange.endDate)
      } else {
        // Gunakan preset periode
        const endDate = new Date()
        const startDate = new Date()
        
        switch (selectedPeriod) {
          case '1month':
            startDate.setMonth(startDate.getMonth() - 1)
            break
          case '3months':
            startDate.setMonth(startDate.getMonth() - 3)
            break
          case '6months':
            startDate.setMonth(startDate.getMonth() - 6)
            break
          case '1year':
          default:
            startDate.setFullYear(startDate.getFullYear() - 1)
            break
        }
        
        params.append('startDate', startDate.toISOString())
        params.append('endDate', endDate.toISOString())
      }
      
      const response = await fetch(`/api/sales-chart?${params.toString()}`)
      if (response.ok) {
        const result: { success: boolean; data: SalesData[] } = await response.json()
        if (result.success) {
          setSalesData(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching sales data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    if (period !== 'custom') {
      setIsCustomRange(false)
      setDateRange({ startDate: '', endDate: '' })
    } else {
      setIsCustomRange(true)
    }
  }

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const resetToDefault = () => {
    setSelectedPeriod('1year')
    setIsCustomRange(false)
    setDateRange({ startDate: '', endDate: '' })
  }

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case '1month': return '1 Bulan Terakhir'
      case '3months': return '3 Bulan Terakhir'
      case '6months': return '6 Bulan Terakhir'
      case '1year': return '1 Tahun Terakhir'
      case 'custom': return 'Periode Custom'
      default: return '1 Tahun Terakhir'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const chartData = {
    labels: salesData.map(item => item.month),
    datasets: chartType === 'sales' ? [
      {
        label: 'Penjualan (IDR)',
        data: salesData.map(item => item.sales),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ] : [
      {
        label: 'Quantity Produk',
        data: salesData.map(item => item.quantity),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12,
            weight: '500'
          },
          color: '#374151'
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y
            return chartType === 'sales' 
              ? `Penjualan: ${formatCurrency(value)}`
              : `Quantity: ${value} unit`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          },
          callback: function(value: any) {
            return chartType === 'sales' 
              ? formatCurrency(value as number)
              : `${value} unit`
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
            weight: '500'
          }
        }
      },
    },
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Grafik {chartType === 'sales' ? 'Penjualan' : 'Quantity'}</h3>
              <p className="text-sm text-gray-600">{chartType === 'sales' ? 'Revenue' : 'Quantity produk'} bulanan dari database real - {getPeriodLabel()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Chart Type Toggle */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setChartType('sales')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  chartType === 'sales'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sales
              </button>
              <button
                onClick={() => setChartType('quantity')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  chartType === 'quantity'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Qty
              </button>
            </div>

            {/* Period Selection Buttons */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handlePeriodChange('1month')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedPeriod === '1month'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                1M
              </button>
              <button
                onClick={() => handlePeriodChange('3months')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedPeriod === '3months'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                3M
              </button>
              <button
                onClick={() => handlePeriodChange('6months')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedPeriod === '6months'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                6M
              </button>
              <button
                onClick={() => handlePeriodChange('1year')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedPeriod === '1year'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                1Y
              </button>
              <button
                onClick={() => handlePeriodChange('custom')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedPeriod === 'custom'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Custom
              </button>
            </div>

            {/* Custom Date Range Inputs - Only show when custom is selected */}
            {isCustomRange && (
              <div className="flex items-center space-x-2 border-l pl-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                  placeholder="Dari"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                  placeholder="Sampai"
                />
              </div>
            )}

            <button
              onClick={resetToDefault}
              className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded"
              title="Reset ke default (1 tahun)"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : salesData.length > 0 && chartReady ? (
          <>
            <div className="h-96 mb-6">
              <Line data={chartData} options={chartOptions} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(salesData.reduce((sum, data) => sum + data.sales, 0))}
                </div>
                <div className="text-sm text-gray-600">Total Penjualan</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {salesData.reduce((sum, data) => sum + data.orders, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Pesanan</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {salesData.length > 0 ? formatCurrency(salesData.reduce((sum, data) => sum + data.sales, 0) / salesData.reduce((sum, data) => sum + data.orders, 0) || 0) : formatCurrency(0)}
                </div>
                <div className="text-sm text-gray-600">Rata-rata per Pesanan</div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <BarChart3 className="h-12 w-12 mb-4" />
            <p>Tidak ada data penjualan untuk periode ini</p>
            <p className="text-sm">Silakan pilih rentang tanggal yang berbeda</p>
          </div>
        )}
      </div>
    </div>
  )
}