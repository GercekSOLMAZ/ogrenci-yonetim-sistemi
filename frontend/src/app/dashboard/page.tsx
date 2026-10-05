'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Users, BookOpen, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { EnrollmentStatus, StudentResponse, enrollmentStatusLabels } from '@/types/student';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types/auth';
import { CourseResponse } from '@/types/course';
import AlertBanner from '@/components/ui/AlertBanner';

export default function DashboardPage() {
  const { user } = useAuth();
  const isStudent = user?.role === Role.STUDENT;
  const [stats, setStats] = useState({
    totalStudents: 0,
    approvedStudents: 0,
    pendingStudents: 0,
    totalCourses: 0,
  });
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [studentStatus, setStudentStatus] = useState<EnrollmentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        setError(null);
        if (isStudent) {
          const [coursesRes, studentRes] = await Promise.all([
            api.get('/courses'),
            api.get<StudentResponse>('/students/me'),
          ]);
          setCourses(coursesRes.data);
          setStudentStatus(studentRes.data.enrollmentStatus);
        } else {
          // In a real app, I'd create a summary endpoint. 
          // For now, I'll fetch list endpoints and count.
          const [studentsRes, coursesRes] = await Promise.all([
            api.get('/students'),
            api.get('/courses'),
          ]);

          const students = studentsRes.data;
          const courseList = coursesRes.data;

          setStats({
            totalStudents: students.length,
            approvedStudents: students.filter((s: any) => s.enrollmentStatus === EnrollmentStatus.APPROVED).length,
            pendingStudents: students.filter((s: any) => s.enrollmentStatus === EnrollmentStatus.PENDING).length,
            totalCourses: courseList.length,
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError('Panel verileri yüklenemedi. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, isStudent]);

  const statCards = [
    { 
      label: 'Toplam Öğrenci', 
      value: stats.totalStudents, 
      icon: Users, 
      color: 'bg-indigo-500',
      shadow: 'shadow-indigo-200',
      trend: 'Toplam Kayıtlı' 
    },
    { 
      label: 'Onaylanan', 
      value: stats.approvedStudents, 
      icon: CheckCircle, 
      color: 'bg-emerald-500',
      shadow: 'shadow-emerald-200',
      trend: 'Aktif Hesaplar' 
    },
    { 
      label: 'Onay Bekleyen', 
      value: stats.pendingStudents, 
      icon: Clock, 
      color: 'bg-amber-500',
      shadow: 'shadow-amber-200',
      trend: 'İnceleme Bekliyor' 
    },
    { 
      label: 'Toplam Ders', 
      value: stats.totalCourses, 
      icon: BookOpen, 
      color: 'bg-violet-500',
      shadow: 'shadow-violet-200',
      trend: 'Sunulan Programlar' 
    },
  ];

  if (isStudent) {
    const statusStyle: Record<EnrollmentStatus, string> = {
      [EnrollmentStatus.PENDING]: 'bg-amber-100 text-amber-700 border-amber-200',
      [EnrollmentStatus.APPROVED]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      [EnrollmentStatus.REJECTED]: 'bg-rose-100 text-rose-700 border-rose-200',
    };

    return (
      <DashboardLayout>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Öğrenci Paneli</h1>
            {studentStatus && (
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${statusStyle[studentStatus]}`}
              >
                Durum: {enrollmentStatusLabels[studentStatus]}
              </span>
            )}
          </div>
          <p className="text-slate-500 text-lg">Öğrenim özetiniz ve mevcut dersler.</p>
        </div>
        {error && <AlertBanner message={error} />}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="card h-32 animate-pulse bg-slate-100 border-none" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Mevcut Dersler</p>
                <p className="text-3xl font-bold text-slate-900">{courses.length}</p>
              </div>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:opacity-90 transition-all"
              >
                Göz At
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="card p-6 bg-slate-50 border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-3">Hızlı İpuçları</h2>
              <p className="text-sm text-slate-600">
                Yeni konuları ve ders ayrıntılarını keşfetmek için Dersler sayfasına göz atın.
              </p>
            </div>
          </div>
        )}

        {!loading && (
          <div className="card p-6 bg-white border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Son Eklenen Dersler</h2>
              <Link href="/courses" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
                Tümünü gör
              </Link>
            </div>
            {courses.length === 0 ? (
              <p className="text-sm text-slate-400">Henüz ders bulunmuyor.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.slice(0, 4).map((course) => (
                  <div key={course.id} className="p-4 rounded-lg border border-slate-100 bg-slate-50">
                    <p className="font-semibold text-slate-900">{course.courseName}</p>
                    <p className="text-xs text-slate-500 mt-1">{course.courseCode}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Sistem Özeti</h1>
        <p className="text-slate-500 text-lg">Kurumunuzun etkinliklerine hızlı bir bakış.</p>
      </div>
      {error && <AlertBanner message={error} />}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card h-32 animate-pulse bg-slate-100 border-none" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <div key={i} className="card p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className={`${stat.color} ${stat.shadow} p-3 rounded-2xl text-white shadow-lg`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        <div className="card p-8 bg-white border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            Hızlı İşlemler
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link 
              href="/students" 
              className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-primary/5 hover:border-primary/20 transition-all group"
            >
              <div className="flex items-center gap-3 text-slate-700 group-hover:text-primary font-medium">
                <Users className="h-5 w-5" />
                Öğrencileri Yönet
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary" />
            </Link>
            <Link 
              href="/courses" 
              className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-primary/5 hover:border-primary/20 transition-all group"
            >
              <div className="flex items-center gap-3 text-slate-700 group-hover:text-primary font-medium">
                <BookOpen className="h-5 w-5" />
                Dersleri Yönet
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary" />
            </Link>
          </div>
        </div>

        <div className="card p-8 bg-gradient-to-br from-primary to-accent text-slate-900 border-none relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">Tekrar hoş geldiniz!</h2>
            <p className="text-slate-700 mb-6 max-w-sm">
              İncelemeniz gereken {stats.pendingStudents} bekleyen öğrenci kaydı var. Kayıtlarınızı güncel tutun.
            </p>
            <Link 
              href="/students" 
              className="inline-flex items-center px-6 py-3 bg-white text-slate-900 font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Şimdi İncele
            </Link>
          </div>
          {/* Abstract blobs for premium feel */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -ml-24 -mb-24" />
        </div>
      </div>
    </DashboardLayout>
  );
}
