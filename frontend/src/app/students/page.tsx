'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  Phone,
  Calendar,
  Trash2,
  ChevronDown,
  UserCheck,
  UserX,
  Loader2
} from 'lucide-react';
import api from '@/lib/api';
import { StudentResponse, EnrollmentStatus } from '@/types/student';
import { cn } from '@/lib/utils';
import { Role } from '@/types/auth';
import AlertBanner from '@/components/ui/AlertBanner';

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Öğrenciler yüklenemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleUpdateStatus = async (id: number, status: EnrollmentStatus) => {
    setProcessingId(id);
    setError(null);
    try {
      await api.patch(`/students/${id}/status?status=${status}`);
      setStudents(students.map(s => s.id === id ? { ...s, enrollmentStatus: status } : s));
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Öğrenci durumu güncellenemedi. Lütfen tekrar deneyin.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu öğrenci hesabını silmek istediğinizden emin misiniz?')) return;
    
    setProcessingId(id);
    setError(null);
    try {
      await api.delete(`/students/${id}`);
      setStudents(students.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting student:', error);
      setError('Öğrenci silinemedi. Lütfen tekrar deneyin.');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || student.enrollmentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: EnrollmentStatus) => {
    switch (status) {
      case EnrollmentStatus.APPROVED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle className="h-3 w-3" /> Onaylandı
          </span>
        );
      case EnrollmentStatus.REJECTED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
            <XCircle className="h-3 w-3" /> Reddedildi
          </span>
        );
      case EnrollmentStatus.PENDING:
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
            <Clock className="h-3 w-3" /> Beklemede
          </span>
        );
    }
  };

  return (
    <DashboardLayout allowedRoles={[Role.ADMIN]}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Öğrenci Hesapları</h1>
          <p className="text-slate-500 text-lg mt-1">Öğrenci kayıt başvurularını inceleyin ve yönetin</p>
        </div>
      </div>
      {error && <AlertBanner message={error} />}

      <div className="card bg-white border-slate-200">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Ad veya e-posta ile ara..."
              className="input-field pl-10 h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              className="input-field h-10 w-full md:w-44 text-sm bg-none appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Tüm Durumlar</option>
              <option value="PENDING">Beklemede</option>
              <option value="APPROVED">Onaylandı</option>
              <option value="REJECTED">Reddedildi</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Öğrenci</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">İletişim</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kayıt Tarihi</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8">
                      <div className="h-4 bg-slate-100 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <p className="text-slate-400">Kriterlerinize uygun öğrenci bulunamadı</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-none mb-1">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-slate-500">ID: #{student.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="h-3 w-3 text-slate-400" />
                          {student.email}
                        </div>
                        {student.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {student.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(student.enrollmentStatus)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-slate-600 flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {new Date(student.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        {student.enrollmentStatus !== EnrollmentStatus.APPROVED && (
                          <button
                            onClick={() => handleUpdateStatus(student.id, EnrollmentStatus.APPROVED)}
                            disabled={processingId === student.id}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Onayla"
                          >
                            {processingId === student.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserCheck className="h-5 w-5" />}
                          </button>
                        )}
                        {student.enrollmentStatus !== EnrollmentStatus.REJECTED && (
                          <button
                            onClick={() => handleUpdateStatus(student.id, EnrollmentStatus.REJECTED)}
                            disabled={processingId === student.id}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Reddet"
                          >
                            {processingId === student.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserX className="h-5 w-5" />}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(student.id)}
                          disabled={processingId === student.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hesabı Sil"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
