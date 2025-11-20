"use client";

import { useLanguage } from '@/app/components/LanguageProvider';
import {
  Calculator,
  CreditCard,
  Heart,
  Mail,
  Package,
  Settings,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from 'react';
import { adminTranslations } from '../translations';

interface ShopStats {
  orders: {
    total: number;
    pending: number;
    paid: number;
    processing: number;
    shipped: number;
    completed: number;
    cancelled: number;
    totalRevenue: number;
  };
  products: {
    total: number;
    active: number;
    outOfStock: number;
  };
  subscriptions: {
    active: number;
    totalMRR: number;
  };
  donations: {
    total: number;
    totalAmount: number;
  };
}

export default function ShopDashboard() {
  const { lang } = useLanguage();
  const t = adminTranslations[lang];
  const [stats, setStats] = useState<ShopStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/shop/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching shop stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const navCards = [
    {
      href: "/admin/shop/products",
      icon: <Package className="w-8 h-8" />,
      title: t.products,
      description: t.productsDesc,
      color: "blue",
      stat: stats?.products.total || 0,
      statLabel: "produktov",
    },
    {
      href: "/admin/shop/orders",
      icon: <ShoppingBag className="w-8 h-8" />,
      title: t.orders,
      description: t.ordersDesc,
      color: "green",
      stat: stats?.orders.total || 0,
      statLabel: "objednávok",
    },
    {
      href: "/admin/shop/subscriptions",
      icon: <CreditCard className="w-8 h-8" />,
      title: t.subscriptions,
      description: t.subscriptionsDesc,
      color: "purple",
      stat: stats?.subscriptions.active || 0,
      statLabel: "aktívnych",
    },
    {
      href: "/admin/shop/donations",
      icon: <Heart className="w-8 h-8" />,
      title: t.donations,
      description: t.donationsDesc,
      color: "pink",
      stat: stats?.donations.total || 0,
      statLabel: "darov",
    },
    {
      href: "/admin/shop/shipping-settings",
      icon: <Settings className="w-8 h-8" />,
      title: t.shippingSettings,
      description: t.shippingSettingsDesc,
      color: "teal",
      stat: "8",
      statLabel: "zón",
    },
    {
      href: "/admin/shop/shipping-calculator",
      icon: <Calculator className="w-8 h-8" />,
      title: t.shippingCalculator,
      description: t.shippingCalculatorDesc,
      color: "orange",
      stat: "50+",
      statLabel: "krajín",
    },
    {
      href: "/admin/shop/email-templates",
      icon: <Mail className="w-8 h-8" />,
      title: "Email Šablóny",
      description: "Upravuj email notifikácie",
      color: "indigo",
      stat: "7",
      statLabel: "šablón",
    },
  ];

  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-600",
      hover: "hover:bg-blue-100",
      badge: "bg-blue-100 text-blue-700",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "text-green-600",
      hover: "hover:bg-green-100",
      badge: "bg-green-100 text-green-700",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      icon: "text-purple-600",
      hover: "hover:bg-purple-100",
      badge: "bg-purple-100 text-purple-700",
    },
    pink: {
      bg: "bg-pink-50",
      border: "border-pink-200",
      icon: "text-pink-600",
      hover: "hover:bg-pink-100",
      badge: "bg-pink-100 text-pink-700",
    },
    teal: {
      bg: "bg-teal-50",
      border: "border-teal-200",
      icon: "text-teal-600",
      hover: "hover:bg-teal-100",
      badge: "bg-teal-100 text-teal-700",
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      icon: "text-orange-600",
      hover: "hover:bg-orange-100",
      badge: "bg-orange-100 text-orange-700",
    },
    indigo: {
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      icon: "text-indigo-600",
      hover: "hover:bg-indigo-100",
      badge: "bg-indigo-100 text-indigo-700",
    },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <ShoppingBag className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">E-shop Dashboard</h1>
        </div>
        <p className="text-gray-600">
          Správa produktov, objednávok, subscripcií a darov
        </p>
      </div>

      {/* Stats Overview */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">Celkové tržby</span>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-900">
              €{stats.orders.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-blue-600 mt-2">
              {stats.orders.total} objednávok
            </p>
          </div>

          {/* Pending Orders */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-sm border border-orange-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-700">Čakajúce</span>
              <ShoppingBag className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-900">
              {stats.orders.pending}
            </div>
            <p className="text-xs text-orange-600 mt-2">
              objednávok na spracovanie
            </p>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700">MRR</span>
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-900">
              €{stats.subscriptions.totalMRR.toFixed(0)}
            </div>
            <p className="text-xs text-purple-600 mt-2">
              {stats.subscriptions.active} aktívnych subscripcií
            </p>
          </div>

          {/* Total Donations */}
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg shadow-sm border border-pink-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-pink-700">Dary</span>
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
            <div className="text-3xl font-bold text-pink-900">
              €{stats.donations.totalAmount.toFixed(2)}
            </div>
            <p className="text-xs text-pink-600 mt-2">
              {stats.donations.total} darov
            </p>
          </div>
        </div>
      ) : null}

      {/* Navigation Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sekcie</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navCards.map((card) => {
            const colors = colorClasses[card.color as keyof typeof colorClasses];
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`
                  block ${colors.bg} ${colors.border} ${colors.hover}
                  rounded-lg border-2 p-6 
                  transition-all duration-200 
                  shadow-sm hover:shadow-md
                  group
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`${colors.icon} transition-transform group-hover:scale-110`}>
                    {card.icon}
                  </div>
                  <span className={`${colors.badge} px-3 py-1 rounded-full text-sm font-semibold`}>
                    {card.stat}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {card.description}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <Users className="w-3 h-3 mr-1" />
                  {card.statLabel}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Order Status Breakdown */}
      {stats && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Status objednávok</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.orders.pending}</div>
              <div className="text-sm text-gray-600">Čaká</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.orders.paid}</div>
              <div className="text-sm text-gray-600">Zaplatené</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.orders.processing}</div>
              <div className="text-sm text-gray-600">Spracováva sa</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.orders.shipped}</div>
              <div className="text-sm text-gray-600">Odoslané</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">{stats.orders.completed}</div>
              <div className="text-sm text-gray-600">Dokončené</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.orders.cancelled}</div>
              <div className="text-sm text-gray-600">Zrušené</div>
            </div>
          </div>
        </div>
      )}

      {/* Products Summary */}
      {stats && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Prehľad produktov</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.products.total}</div>
              <div className="text-sm text-gray-600">Celkom</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.products.active}</div>
              <div className="text-sm text-gray-600">Aktívne</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.products.outOfStock}</div>
              <div className="text-sm text-gray-600">Nedostupné</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
