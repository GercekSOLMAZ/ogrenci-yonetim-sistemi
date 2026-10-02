'use client';

import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { ProtectedRoute } from '@/context/AuthContext';
import { Role } from '@/types/auth';

interface DashboardLayoutProps {
  children: ReactNode;
  allowedRoles?: Role[];
}

export default function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="flex flex-col lg:flex-row h-screen bg-slate-50 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
