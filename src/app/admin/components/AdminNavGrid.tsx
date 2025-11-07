"use client";

import { useLanguage } from '@/app/components/LanguageProvider';
import {
    BookOpen,
    Calculator,
    CheckSquare,
    CreditCard,
    Heart,
    Newspaper,
    Package,
    Quote,
    Settings,
    ShoppingBag,
    Upload,
    Users,
} from "lucide-react";
import Link from "next/link";
import React from 'react';
import { adminTranslations } from '../translations';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  titleKey: keyof typeof adminTranslations.sk;
  descriptionKey: keyof typeof adminTranslations.sk;
  borderColor: string;
  bgColor: string;
  hoverBgColor: string;
  iconColor: string;
}

export default function AdminNavGrid() {
  const { lang } = useLanguage();
  const t = adminTranslations[lang];
  
  const navItems: NavItem[] = [
    {
      href: "/admin/news",
      icon: <Newspaper size={24} />,
      titleKey: "news",
      descriptionKey: "newsDesc",
      borderColor: "border-red-500",
      bgColor: "bg-red-100",
      hoverBgColor: "group-hover:bg-red-200",
      iconColor: "text-red-600",
    },
    {
      href: "/admin/lectio",
      icon: <BookOpen size={24} />,
      titleKey: "lectio",
      descriptionKey: "lectioDesc",
      borderColor: "border-green-500",
      bgColor: "bg-green-100",
      hoverBgColor: "group-hover:bg-green-200",
      iconColor: "text-green-600",
    },
    {
      href: "/admin/users",
      icon: <Users size={24} />,
      titleKey: "users",
      descriptionKey: "usersDesc",
      borderColor: "border-blue-500",
      bgColor: "bg-blue-100",
      hoverBgColor: "group-hover:bg-blue-200",
      iconColor: "text-blue-600",
    },
    {
      href: "/admin/daily_quotes",
      icon: <Quote size={24} />,
      titleKey: "quotes",
      descriptionKey: "quotesDesc",
      borderColor: "border-purple-500",
      bgColor: "bg-purple-100",
      hoverBgColor: "group-hover:bg-purple-200",
      iconColor: "text-purple-600",
    },
    {
      href: "/admin/bible-bulk-import",
      icon: <Upload size={24} />,
      titleKey: "bibleBulkImport",
      descriptionKey: "bibleBulkImportDesc",
      borderColor: "border-orange-500",
      bgColor: "bg-orange-100",
      hoverBgColor: "group-hover:bg-orange-200",
      iconColor: "text-orange-600",
    },
    {
      href: "/admin/launch-checklist",
      icon: <CheckSquare size={24} />,
      titleKey: "launchChecklist",
      descriptionKey: "launchChecklistDesc",
      borderColor: "border-indigo-500",
      bgColor: "bg-indigo-100",
      hoverBgColor: "group-hover:bg-indigo-200",
      iconColor: "text-indigo-600",
    },
    {
      href: "/admin/shop",
      icon: <ShoppingBag size={24} />,
      titleKey: "shop",
      descriptionKey: "shopDesc",
      borderColor: "border-cyan-500",
      bgColor: "bg-cyan-100",
      hoverBgColor: "group-hover:bg-cyan-200",
      iconColor: "text-cyan-600",
    },
    {
      href: "/admin/shop/products",
      icon: <Package size={24} />,
      titleKey: "products",
      descriptionKey: "productsDesc",
      borderColor: "border-blue-500",
      bgColor: "bg-blue-100",
      hoverBgColor: "group-hover:bg-blue-200",
      iconColor: "text-blue-600",
    },
    {
      href: "/admin/shop/orders",
      icon: <Package size={24} />,
      titleKey: "orders",
      descriptionKey: "ordersDesc",
      borderColor: "border-amber-500",
      bgColor: "bg-amber-100",
      hoverBgColor: "group-hover:bg-amber-200",
      iconColor: "text-amber-600",
    },
    {
      href: "/admin/shop/shipping-calculator",
      icon: <Calculator size={24} />,
      titleKey: "shippingCalculator",
      descriptionKey: "shippingCalculatorDesc",
      borderColor: "border-blue-500",
      bgColor: "bg-blue-100",
      hoverBgColor: "group-hover:bg-blue-200",
      iconColor: "text-blue-600",
    },
    {
      href: "/admin/shop/shipping-settings",
      icon: <Settings size={24} />,
      titleKey: "shippingSettings",
      descriptionKey: "shippingSettingsDesc",
      borderColor: "border-teal-500",
      bgColor: "bg-teal-100",
      hoverBgColor: "group-hover:bg-teal-200",
      iconColor: "text-teal-600",
    },
    {
      href: "/admin/shop/subscriptions",
      icon: <CreditCard size={24} />,
      titleKey: "subscriptions",
      descriptionKey: "subscriptionsDesc",
      borderColor: "border-emerald-500",
      bgColor: "bg-emerald-100",
      hoverBgColor: "group-hover:bg-emerald-200",
      iconColor: "text-emerald-600",
    },
    {
      href: "/admin/shop/donations",
      icon: <Heart size={24} />,
      titleKey: "donations",
      descriptionKey: "donationsDesc",
      borderColor: "border-pink-500",
      bgColor: "bg-pink-100",
      hoverBgColor: "group-hover:bg-pink-200",
      iconColor: "text-pink-600",
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} className="group">
          <div className={`bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border-l-4 ${item.borderColor} group-hover:scale-105`}>
            <div className="flex items-center space-x-4">
              <div className={`p-3 ${item.bgColor} rounded-xl ${item.hoverBgColor} transition-colors ${item.iconColor}`}>
                {item.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t[item.titleKey]}</h3>
                <p className="text-sm text-gray-600">{t[item.descriptionKey]}</p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
