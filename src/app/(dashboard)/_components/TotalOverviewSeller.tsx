import React from 'react'
import SellerOverviewCard from './SellerOverviewCard'
import SellerAnalyticsChart from './SellerAnalyticsChart'
import SellerRevenueChart from './SellerRevenueChart'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

function TotalOverviewSeller() {
  return (
    <div>
       {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard
            </h1>
            <nav className="flex items-center text-sm text-gray-600">
              <Link
                href="/dashboard"
                className="hover:text-red-500 transition-colors"
              >
                Dashboard
              </Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-red-500 font-medium">Overview</span>
            </nav>
          </div>
        </div>
        <div>
          <SellerOverviewCard />
        </div>

        <div className=''>
          <div className='mt-10'>
            <SellerAnalyticsChart />
          </div>
          <div className='mt-10'>
            <SellerRevenueChart />
          </div>
        </div>
    </div>
  )
}

export default TotalOverviewSeller