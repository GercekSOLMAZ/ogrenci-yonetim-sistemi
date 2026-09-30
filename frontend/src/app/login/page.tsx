'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import AlertBanner from '@/components/ui/AlertBanner';
import { cn } from '@/lib/utils';
import { isBlank, isValidEmail, minLength } from '@/lib/validation';

function LoginPageContent() {
  const searchParams = useSearchParams();
  const wasRegistered = searchParams.get('registered') === 'true';
  const requiresReauth = searchParams.get('reauth') === 'true';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { login } = useAuth();

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (isBlank(email)) {
      nextErrors.email = 'E-posta zorunludur.';
    } else if (!isValidEmail(email)) {
      nextErrors.email = 'Geçerli bir e-posta adresi girin.';
    }

    if (isBlank(password)) {
      nextErrors.password = 'Şifre zorunludur.';
    } else if (!minLength(password, 6)) {
      nextErrors.password = 'Şifre en az 6 karakter olmalıdır.';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.response?.data?.message || 'E-posta veya şifre hatalı. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      <div className="w-full max-w-md">
        <div className="card glass p-8 shadow-xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Tekrar Hoş Geldiniz</h1>
            <p className="text-slate-500 mt-2 text-center">
              Öğrenci kayıtlarınızı ve derslerinizi yönetmek için giriş yapın
            </p>
          </div>

          {wasRegistered && (
            <AlertBanner message="Kayıt başarılı. Lütfen giriş yapın." variant="success" />
          )}
          {requiresReauth && (
            <AlertBanner message="E-posta veya şifreniz güncellendi. Lütfen tekrar giriş yapın." variant="warning" />
          )}
          {error && <AlertBanner message={error} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">E-posta adresi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: '' }));
                    }
                  }}
                  className={cn(
                    'input-field pl-10',
                    fieldErrors.email && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  placeholder="ornek@eposta.com"
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
                />
              </div>
              {fieldErrors.email && (
                <p id="login-email-error" className="text-xs text-red-600 ml-1">
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
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: '' }));
                    }
                  }}
                  className={cn(
                    'input-field pl-10',
                    fieldErrors.password && 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  )}
                  placeholder="••••••••"
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                />
              </div>
              {fieldErrors.password && (
                <p id="login-password-error" className="text-xs text-red-600 ml-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-lg"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-slate-600">
              Hesabınız yok mu?{' '}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Öğrenci Olarak Kayıt Ol
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
          <div className="card glass p-8 shadow-xl text-slate-600">Yükleniyor…</div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
