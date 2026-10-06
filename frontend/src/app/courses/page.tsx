'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  BookOpen, 
  Edit2, 
  Trash2, 
  Loader2, 
  X,
  FileText,
  Hash,
  Clock
} from 'lucide-react';
import api from '@/lib/api';
import { CourseResponse, CourseRequest } from '@/types/course';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types/auth';
import AlertBanner from '@/components/ui/AlertBanner';
import { EnrollmentResponse } from '@/types/enrollment';
import { isBlank, isValidCourseCode, maxLength, minLength } from '@/lib/validation';

export default function CoursesPage() {
  const { user } = useAuth();
  const canManageCourses = user?.role === Role.ADMIN || user?.role === Role.LECTURER;
  const isStudent = user?.role === Role.STUDENT;
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseResponse | null>(null);
  const [formData, setFormData] = useState<CourseRequest>({
    courseName: '',
    courseCode: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollingId, setEnrollingId] = useState<number | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Dersler yüklenemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!isStudent) return;

    const fetchEnrollments = async () => {
      try {
        const response = await api.get<EnrollmentResponse[]>('/enrollments/me');
        setEnrolledCourseIds(response.data.map((enrollment) => enrollment.courseId));
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      }
    };

    fetchEnrollments();
  }, [isStudent]);

  const handleOpenModal = (course?: CourseResponse) => {
    if (!canManageCourses) return;
    setFormErrors({});
    if (course) {
      setEditingCourse(course);
      setFormData({
        courseName: course.courseName,
        courseCode: course.courseCode,
        description: course.description || '',
      });
    } else {
      setEditingCourse(null);
      setFormData({
        courseName: '',
        courseCode: '',
        description: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    const courseName = formData.courseName.trim();
    const courseCode = formData.courseCode.trim().toUpperCase();
    const description = formData.description?.trim() ?? '';

    if (isBlank(courseName)) {
      nextErrors.courseName = 'Ders adı zorunludur.';
    } else if (!minLength(courseName, 2)) {
      nextErrors.courseName = 'Ders adı en az 2 karakter olmalıdır.';
    } else if (!maxLength(courseName, 100)) {
      nextErrors.courseName = 'Ders adı en fazla 100 karakter olabilir.';
    }

    if (isBlank(courseCode)) {
      nextErrors.courseCode = 'Ders kodu zorunludur.';
    } else if (!isValidCourseCode(courseCode)) {
      nextErrors.courseCode = '2-20 karakter; harf, rakam veya tire kullanın.';
    }

    if (description && !maxLength(description, 500)) {
      nextErrors.description = 'Açıklama en fazla 500 karakter olabilir.';
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const payload: CourseRequest = {
        courseName: formData.courseName.trim(),
        courseCode: formData.courseCode.trim().toUpperCase(),
        description: formData.description?.trim() || '',
      };
      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}`, payload);
      } else {
        await api.post('/courses', payload);
      }
      fetchCourses();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving course:', error);
      setError('Ders kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu dersi silmek istediğinizden emin misiniz?')) return;
    try {
      setError(null);
      await api.delete(`/courses/${id}`);
      setCourses(courses.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting course:', error);
      setError('Ders silinemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleEnroll = async (courseId: number) => {
    setEnrollingId(courseId);
    setError(null);
    try {
      await api.post('/enrollments', { courseId });
      setEnrolledCourseIds((prev) => [...prev, courseId]);
    } catch (error: any) {
      console.error('Error enrolling in course:', error);
      setError(error.response?.data || 'Derse kayıt olunamadı. Lütfen tekrar deneyin.');
    } finally {
      setEnrollingId(null);
    }
  };

  const isEnrolled = (courseId: number) => enrolledCourseIds.includes(courseId);

  const filteredCourses = courses.filter(course =>
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Dersler</h1>
          <p className="text-slate-500 text-lg mt-1">Müfredatı ve dersleri yönetin</p>
        </div>
        {canManageCourses && (
          <button 
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center gap-2 h-12 px-6"
          >
            <Plus className="h-5 w-5" />
            Yeni Ders Ekle
          </button>
        )}
      </div>
      {error && <AlertBanner message={error} />}

      <div className="card bg-white border-slate-200">
        <div className="p-6 border-b border-slate-100">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Ad veya kod ile ara..."
              className="input-field pl-10 h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="card h-48 animate-pulse bg-slate-50 border-none" />
            ))
          ) : filteredCourses.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <p className="text-slate-400">Henüz ders bulunmuyor.</p>
            </div>
          ) : (
            filteredCourses.map((course) => (
              <div key={course.id} className="card p-6 flex flex-col justify-between hover:shadow-md transition-shadow group relative border-slate-100">
                {canManageCourses && (
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenModal(course)}
                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(course.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{course.courseName}</h3>
                  <p className="text-sm font-semibold text-primary mb-3">{course.courseCode}</p>
                  <p className="text-sm text-slate-500 line-clamp-2 min-h-10">
                    {course.description || 'Bu ders için açıklama girilmemiş.'}
                  </p>
                  {isStudent && (
                    <div className="mt-4">
                      {isEnrolled(course.id) ? (
                        <button
                          type="button"
                          disabled
                          className="w-full h-10 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-sm border border-emerald-100"
                        >
                          Kayıtlı
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEnroll(course.id)}
                          disabled={enrollingId === course.id}
                          className="w-full h-10 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                          {enrollingId === course.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Kayıt Ol'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Eklenme: {new Date(course.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                  <div className="font-medium text-slate-500 uppercase tracking-tighter">ID: #{course.id}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Course Modal */}
      {isModalOpen && canManageCourses && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="card glass w-full max-w-lg relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {editingCourse ? 'Dersi Düzenle' : 'Yeni Ders Oluştur'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Ders Adı</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    className={cn(
                      'input-field pl-10 h-11',
                      formErrors.courseName && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    )}
                    placeholder="örn. Bilgisayar Bilimlerine Giriş"
                    value={formData.courseName}
                    onChange={(e) => {
                      setFormData({ ...formData, courseName: e.target.value });
                      if (formErrors.courseName) {
                        setFormErrors((prev) => ({ ...prev, courseName: '' }));
                      }
                    }}
                    aria-invalid={!!formErrors.courseName}
                    aria-describedby={formErrors.courseName ? 'course-name-error' : undefined}
                  />
                </div>
                {formErrors.courseName && (
                  <p id="course-name-error" className="text-xs text-red-600 ml-1">
                    {formErrors.courseName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Ders Kodu</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    maxLength={20}
                    pattern="[A-Z0-9-]{2,20}"
                    title="2-20 karakter; harf, rakam veya tire kullanın."
                    className={cn(
                      'input-field pl-10 h-11 uppercase font-mono',
                      formErrors.courseCode && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    )}
                    placeholder="örn. BIL101"
                    value={formData.courseCode}
                    onChange={(e) => {
                      const nextValue = e.target.value.toUpperCase().replace(/\s+/g, '');
                      setFormData({ ...formData, courseCode: nextValue });
                      if (!nextValue.trim()) {
                        setFormErrors((prev) => ({ ...prev, courseCode: 'Ders kodu zorunludur.' }));
                      } else if (!isValidCourseCode(nextValue)) {
                        setFormErrors((prev) => ({ ...prev, courseCode: '2-20 karakter; harf, rakam veya tire kullanın.' }));
                      } else if (formErrors.courseCode) {
                        setFormErrors((prev) => ({ ...prev, courseCode: '' }));
                      }
                    }}
                    aria-invalid={!!formErrors.courseCode}
                    aria-describedby={formErrors.courseCode ? 'course-code-error' : undefined}
                  />
                </div>
                {formErrors.courseCode && (
                  <p id="course-code-error" className="text-xs text-red-600 ml-1">
                    {formErrors.courseCode}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Açıklama</label>
                <textarea
                  className={cn(
                    'input-field min-h-32 py-3 resize-none',
                    formErrors.description && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  placeholder="İsteğe bağlı ders açıklaması..."
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    if (formErrors.description) {
                      setFormErrors((prev) => ({ ...prev, description: '' }));
                    }
                  }}
                  aria-invalid={!!formErrors.description}
                  aria-describedby={formErrors.description ? 'course-description-error' : undefined}
                />
                {formErrors.description && (
                  <p id="course-description-error" className="text-xs text-red-600 ml-1">
                    {formErrors.description}
                  </p>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] btn-primary h-12 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Dersi Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
