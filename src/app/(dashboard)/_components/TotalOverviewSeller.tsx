import React from 'react'
import SellerOverviewCard from './SellerOverviewCard'
import SellerAnalyticsChart from './SellerAnalyticsChart'
import SellerRevenueChart from './SellerRevenueChart'

function TotalOverviewSeller() {
  return (
    <div>
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