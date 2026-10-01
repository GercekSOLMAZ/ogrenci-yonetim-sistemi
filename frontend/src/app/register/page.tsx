'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { UserPlus, Mail, Lock, User, Phone, Calendar, Loader2, CheckCircle2 } from 'lucide-react';
import { Role } from '@/types/auth';
import AlertBanner from '@/components/ui/AlertBanner';
import { cn } from '@/lib/utils';
import { isBlank, isFutureDate, isValidEmail, isValidPhone, minLength } from '@/lib/validation';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { register } = useAuth();

  const today = new Date();
  const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0];

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (isBlank(formData.firstName)) {
      nextErrors.firstName = 'Ad zorunludur.';
    } else if (!minLength(formData.firstName, 2)) {
      nextErrors.firstName = 'Ad en az 2 karakter olmalıdır.';
    }

    if (isBlank(formData.lastName)) {
      nextErrors.lastName = 'Soyad zorunludur.';
    } else if (!minLength(formData.lastName, 2)) {
      nextErrors.lastName = 'Soyad en az 2 karakter olmalıdır.';
    }

    if (isBlank(formData.email)) {
      nextErrors.email = 'E-posta zorunludur.';
    } else if (!isValidEmail(formData.email)) {
      nextErrors.email = 'Geçerli bir e-posta adresi girin.';
    }

    if (isBlank(formData.password)) {
      nextErrors.password = 'Şifre zorunludur.';
    } else if (!minLength(formData.password, 6)) {
      nextErrors.password = 'Şifre en az 6 karakter olmalıdır.';
    }

    if (formData.phone.trim() !== '' && !isValidPhone(formData.phone)) {
      nextErrors.phone = 'Geçerli bir telefon numarası girin (9-12 hane).';
    }

    if (formData.dateOfBirth && isFutureDate(formData.dateOfBirth)) {
      nextErrors.dateOfBirth = 'Doğum tarihi gelecekte olamaz.';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      await register({
        ...formData,
        role: Role.STUDENT, // Self-registration is always for students
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kayıt başarısız. Lütfen bilgilerinizi kontrol edip tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
        <div className="w-full max-w-md">
          <div className="card glass p-8 shadow-xl text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6 mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Kayıt Başarılı!</h1>
            <p className="text-slate-600 mb-8">
              Hesabınız oluşturuldu ve şu anda yönetici onayı <span className="font-semibold text-amber-600">BEKLİYOR</span>.
            </p>
            <Link href="/login" className="btn-primary inline-block w-full text-center py-3">
              Girişe Git
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg py-12">
      <div className="w-full max-w-2xl">
        <div className="card glass p-8 shadow-xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Öğrenci Hesabı Oluştur</h1>
            <p className="text-slate-500 mt-2 text-center">
              Derslere erişmek ve ilerlemenizi takip etmek için platforma katılın
            </p>
          </div>

          {error && <AlertBanner message={error} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 ml-1">Ad</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className={cn(
                      'input-field pl-10',
                      fieldErrors.firstName && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    )}
                    placeholder="Ahmet"
                    aria-invalid={!!fieldErrors.firstName}
                    aria-describedby={fieldErrors.firstName ? 'register-first-name-error' : undefined}
                  />
                </div>
                {fieldErrors.firstName && (
                  <p id="register-first-name-error" className="text-xs text-red-600 ml-1">
                    {fieldErrors.firstName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 ml-1">Soyad</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className={cn(
                      'input-field pl-10',
                      fieldErrors.lastName && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    )}
                    placeholder="Yılmaz"
                    aria-invalid={!!fieldErrors.lastName}
                    aria-describedby={fieldErrors.lastName ? 'register-last-name-error' : undefined}
                  />
                </div>
                {fieldErrors.lastName && (
                  <p id="register-last-name-error" className="text-xs text-red-600 ml-1">
                    {fieldErrors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">E-posta adresi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={cn(
                    'input-field pl-10',
                    fieldErrors.email && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  placeholder="ornek@eposta.com"
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'register-email-error' : undefined}
                />
              </div>
              {fieldErrors.email && (
                <p id="register-email-error" className="text-xs text-red-600 ml-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Şifre</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={cn(
                    'input-field pl-10',
                    fieldErrors.password && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  placeholder="••••••••"
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? 'register-password-error' : undefined}
                />
              </div>
              {fieldErrors.password && (
                <p id="register-password-error" className="text-xs text-red-600 ml-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 ml-1">Telefon Numarası</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-5 w-5" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={cn(
                      'input-field pl-10',
                      fieldErrors.phone && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    )}
                    placeholder="+90 555 123 4567"
                    aria-invalid={!!fieldErrors.phone}
                    aria-describedby={fieldErrors.phone ? 'register-phone-error' : undefined}
                  />
                </div>
                {fieldErrors.phone && (
                  <p id="register-phone-error" className="text-xs text-red-600 ml-1">
                    {fieldErrors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 ml-1">Doğum Tarihi</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    max={maxDate}
                    className={cn(
                      'input-field pl-10',
                      fieldErrors.dateOfBirth && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    )}
                    aria-invalid={!!fieldErrors.dateOfBirth}
                    aria-describedby={fieldErrors.dateOfBirth ? 'register-dob-error' : undefined}
                  />
                </div>
                {fieldErrors.dateOfBirth && (
                  <p id="register-dob-error" className="text-xs text-red-600 ml-1">
                    {fieldErrors.dateOfBirth}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-lg mt-4"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Hesap Oluştur'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-slate-600">
              Zaten hesabınız var mı?{' '}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
