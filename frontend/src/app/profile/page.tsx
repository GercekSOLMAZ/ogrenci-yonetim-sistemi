'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import AlertBanner from '@/components/ui/AlertBanner';
import { UserProfileResponse, UserProfileUpdateRequest } from '@/types/profile';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { isBlank, isFutureDate, isValidEmail, isValidPhone, minLength } from '@/lib/validation';

export default function ProfilePage() {
  const { updateUser, logout } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
  });
  const [originalEmail, setOriginalEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const today = new Date();
  const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0];

  const hasSensitiveChange =
    (originalEmail !== '' && formData.email.trim() !== originalEmail) || formData.password.trim() !== '';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError(null);
        const response = await api.get<UserProfileResponse>('/users/me');
        const profile = response.data;
        setOriginalEmail(profile.email || '');
        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          password: '',
          phone: profile.phone || '',
          dateOfBirth: profile.dateOfBirth || '',
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Profil yüklenemedi. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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

    if (formData.password.trim() !== '' && !minLength(formData.password, 6)) {
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
    if (name === 'dateOfBirth' && value && value > maxDate) {
      setFieldErrors((prev) => ({ ...prev, dateOfBirth: 'Doğum tarihi gelecekte olamaz.' }));
      return;
    }
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!validate()) return;
    setSaving(true);

    try {
      const payload: UserProfileUpdateRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone.trim() === '' ? null : formData.phone,
        dateOfBirth: formData.dateOfBirth === '' ? null : formData.dateOfBirth,
      };

      if (formData.password.trim() !== '') {
        payload.password = formData.password;
      }

      const response = await api.put<UserProfileResponse>('/users/me', payload);
      const updated = response.data;

      setFormData({
        firstName: updated.firstName || '',
        lastName: updated.lastName || '',
        email: updated.email || '',
        password: '',
        phone: updated.phone || '',
        dateOfBirth: updated.dateOfBirth || '',
      });

      if (hasSensitiveChange) {
        logout('/login?reauth=true');
        return;
      }

      updateUser({
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
      });

      setSuccess('Profil başarıyla güncellendi.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Profil güncellenemedi. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Profilim</h1>
        <p className="text-slate-500 text-lg">Kişisel bilgilerinizi ve hesap bilgilerinizi güncelleyin.</p>
      </div>

      {error && <AlertBanner message={error} />}
      {success && <AlertBanner message={success} variant="success" />}
      {hasSensitiveChange && (
        <AlertBanner
          message="E-posta veya şifrenizi değiştirirseniz tekrar giriş yapmanız gerekir."
          variant="warning"
        />
      )}

      {loading ? (
        <div className="card h-48 animate-pulse bg-slate-100 border-none" />
      ) : (
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 ml-1">Ad</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className={cn(
                    'input-field',
                    fieldErrors.firstName && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  placeholder="Ahmet"
                  aria-invalid={!!fieldErrors.firstName}
                  aria-describedby={fieldErrors.firstName ? 'profile-first-name-error' : undefined}
                />
                {fieldErrors.firstName && (
                  <p id="profile-first-name-error" className="text-xs text-red-600 ml-1">
                    {fieldErrors.firstName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 ml-1">Soyad</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className={cn(
                    'input-field',
                    fieldErrors.lastName && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  placeholder="Yılmaz"
                  aria-invalid={!!fieldErrors.lastName}
                  aria-describedby={fieldErrors.lastName ? 'profile-last-name-error' : undefined}
                />
                {fieldErrors.lastName && (
                  <p id="profile-last-name-error" className="text-xs text-red-600 ml-1">
                    {fieldErrors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">E-posta Adresi</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={cn(
                  'input-field',
                  fieldErrors.email && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                )}
                placeholder="ornek@eposta.com"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'profile-email-error' : undefined}
              />
              {fieldErrors.email && (
                <p id="profile-email-error" className="text-xs text-red-600 ml-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Şifre</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={cn(
                  'input-field',
                  fieldErrors.password && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                )}
                placeholder="Mevcut şifreyi korumak için boş bırakın"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'profile-password-error' : undefined}
              />
              {fieldErrors.password && (
                <p id="profile-password-error" className="text-xs text-red-600 ml-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 ml-1">Telefon Numarası</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={cn(
                    'input-field',
                    fieldErrors.phone && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  placeholder="+90 555 123 4567"
                  aria-invalid={!!fieldErrors.phone}
                  aria-describedby={fieldErrors.phone ? 'profile-phone-error' : undefined}
                />
                {fieldErrors.phone && (
                  <p id="profile-phone-error" className="text-xs text-red-600 ml-1">
                    {fieldErrors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 ml-1">Doğum Tarihi</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  max={maxDate}
                  className={cn(
                    'input-field',
                    fieldErrors.dateOfBirth && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  aria-invalid={!!fieldErrors.dateOfBirth}
                  aria-describedby={fieldErrors.dateOfBirth ? 'profile-dob-error' : undefined}
                />
                {fieldErrors.dateOfBirth && (
                  <p id="profile-dob-error" className="text-xs text-red-600 ml-1">
                    {fieldErrors.dateOfBirth}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full md:w-auto px-6 py-3"
            >
              {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
