/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { Package, ShoppingCart, Clock, DollarSign, AlertCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'

function SellerOverviewCard() {
    const { data: session } = useSession();
    const user = session?.user as any;
    const token = user?.accessToken;

    const { data: sellerOverViewCard, isLoading, error } = useQuery({
        queryKey: ['seller-card'],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/summery/seller-overview-cards`,{
                method : "GET",
                headers : {
                    Authorization: `Bearer ${token}`,
                }
            })
            if (!res.ok) throw new Error('Failed to fetch data')
            return res.json()
        }
    })

    // ✅ FIX: Use response directly (no ?.data)
    const stats = sellerOverViewCard || {
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0
    }

    const cards = [
        {
            title: 'Total Products',
            value: stats.totalProducts,
            icon: Package,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
            description: 'Active listings'
        },
        {
            title: 'Total Orders',
            value: stats.totalOrders,
            icon: ShoppingCart,
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600',
            description: 'All time orders'
        },
        {
            title: 'Pending Orders',
            value: stats.pendingOrders,
            icon: Clock,
            color: 'from-orange-500 to-orange-600',
            bgColor: 'bg-orange-50',
            iconColor: 'text-orange-600',
            description: 'Awaiting processing',
            highlight: stats.pendingOrders > 0
        },
        {
            title: 'Total Revenue',
            value: `৳${stats.revenue?.toLocaleString('en-BD') || 0}`,
            icon: DollarSign,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600',
            description: 'Lifetime earnings'
        }
    ]

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                        </div>
                        <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
                <AlertCircle className="text-red-600 w-6 h-6" />
                <div>
                    <h3 className="text-red-900 font-semibold">Failed to load dashboard data</h3>
                    <p className="text-red-700 text-sm">Please try refreshing the page</p>
                </div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => {
                const Icon = card.icon
                return (
                    <div
                        key={index}
                        className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                            card.highlight ? 'ring-2 ring-orange-400 ring-opacity-50' : ''
                        }`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">
                                    {card.title}
                                </p>
                                <h3 className="text-3xl font-bold text-gray-900">
                                    {card.value}
                                </h3>
                            </div>
                            <div className={`${card.bgColor} p-3 rounded-lg`}>
                                <Icon className={`w-6 h-6 ${card.iconColor}`} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500">{card.description}</p>
                            {card.highlight && (
                                <span className="ml-auto bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded">
                                    Action needed
                                </span>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default SellerOverviewCard
