'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  LogOut, 
  Menu, 
  X, 
  GraduationCap,
  User,
  ChevronRight
} from 'lucide-react';
import { Role } from '@/types/auth';
import { cn } from '@/lib/utils'; // I'll create this utility in a moment

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Panel', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Profil', href: '/profile', icon: User },
    { name: 'Öğrenciler', href: '/students', icon: Users, roles: [Role.ADMIN] },
    { name: 'Dersler', href: '/courses', icon: BookOpen },
    { name: 'Kayıtlarım', href: '/enrollments', icon: GraduationCap, roles: [Role.STUDENT] },
  ];

  const filteredNavigation = navigation.filter(
    item => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl tracking-tight">EduManage</span>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">EduManage</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                    isActive 
                      ? "bg-slate-100 text-slate-900 ring-1 ring-slate-200" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("h-5 w-5", isActive ? "text-slate-900" : "text-slate-400 group-hover:text-primary")} />
                    {item.name}
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 text-slate-900" />}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3 px-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white overflow-hidden">
                <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || '?'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.role === Role.ADMIN ? 'Yönetici' : user?.role === Role.STUDENT ? 'Öğrenci' : 'Bilinmiyor'}
                </p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Çıkış Yap
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
