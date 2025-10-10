"use client";

import React from 'react';
import Link from "next/link";
import {
  Users,
  Newspaper,
  BookOpen,
  Quote,
} from "lucide-react";
import { useLanguage } from '@/app/components/LanguageProvider';
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
