'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import { EnrollmentResponse } from '@/types/enrollment';
import { Role } from '@/types/auth';
import { BookOpen, Calendar } from 'lucide-react';
import AlertBanner from '@/components/ui/AlertBanner';

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<EnrollmentResponse[]>('/enrollments/me');
        setEnrollments(response.data);
      } catch (error) {
        console.error('Error fetching enrollments:', error);
        setError('Kayıtlar yüklenemedi. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  return (
    <DashboardLayout allowedRoles={[Role.STUDENT]}>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Kayıtlarım</h1>
        <p className="text-slate-500 text-lg">Şu anda kayıtlı olduğunuz dersler.</p>
      </div>

      {error && <AlertBanner message={error} />}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-32 animate-pulse bg-slate-100 border-none" />
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">
          Henüz hiçbir derse kayıtlı değilsiniz.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="card p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{enrollment.courseName}</p>
                  <p className="text-sm text-slate-500 font-semibold">{enrollment.courseCode}</p>
                </div>
              </div>
              <div className="text-sm text-slate-500 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                Kayıt tarihi: {new Date(enrollment.enrolledAt).toLocaleDateString('tr-TR')}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
