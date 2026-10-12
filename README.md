# Öğrenci Yönetim Sistemi (Next.js + Spring Boot + Supabase)

JWT kimlik doğrulaması, rol tabanlı erişim ve modern bir Next.js arayüzüne sahip full-stack öğrenci yönetim sistemi. Backend Spring Boot (REST API) ile yazılmıştır, veriler Supabase üzerindeki PostgreSQL'de tutulur.

**Özellikler**
- Güvenli endpoint'lerle JWT kimlik doğrulaması (giriş/kayıt)
- Rol tabanlı erişim kontrolü: `ADMIN`, `LECTURER`, `STUDENT`
- Ders yönetimi (oluşturma, düzenleme, silme)
- Öğrenci yönetimi ve ders kayıt süreçleri
- E-posta/şifre değişiminde yeniden giriş gerektiren profil yönetimi
- Frontend ve backend doğrulaması, merkezi hata yönetimi

**Teknolojiler**
- Frontend: Next.js 16, React 19, Tailwind CSS, Axios
- Backend: Spring Boot 3, Spring Security, JPA, Bean Validation
- Veritabanı: PostgreSQL (Supabase)

**Proje Yapısı**
- `frontend/` Next.js uygulaması
- `backend/` Spring Boot API
- `supabase/` SQL şeması
- `docs/` API dokümantasyonu

---

## Gereksinimler
- Node.js 18+ (önerilir)
- Java 17
- Maven (veya projedeki Maven wrapper)
- Bir Supabase projesi (PostgreSQL)

---

## Veritabanı Kurulumu (Supabase)
1. Yeni bir Supabase projesi oluşturun.
2. SQL Editor'ü açın.
3. Şema betiğini çalıştırın: `supabase/schema.sql`.

Bu işlem şu tabloları oluşturur: `users`, `students`, `courses`, `enrollments`.

---

## Backend Kurulumu (Spring Boot)
1. Veritabanı ve JWT ayarlarını `backend/src/main/resources/application.properties` dosyasında yapın.
2. Backend'i başlatın:

```bash
cd backend
./mvnw spring-boot:run
```

Varsayılan API adresi: `http://localhost:8080/api`

**Önemli:** Canlı ortamda veritabanı bilgilerini `application.properties` içine yazmak yerine ortam değişkenlerinde veya bir gizli anahtar yöneticisinde tutun.

---

## Frontend Kurulumu (Next.js)
1. Bağımlılıkları yükleyin:

```bash
cd frontend
npm install
```

2. API adresini ayarlayın (isteğe bağlı, varsayılan `http://localhost:8080/api`):

```bash
# Windows PowerShell
$env:NEXT_PUBLIC_API_BASE_URL="http://localhost:8080/api"
```

3. Frontend'i başlatın:

```bash
npm run dev
```

Varsayılan arayüz adresi: `http://localhost:3000`

---

## Ortam Değişkenleri
Frontend:
- `NEXT_PUBLIC_API_BASE_URL` (isteğe bağlı)
- `NEXT_PUBLIC_API_URL` (eski yedek değişken)

Backend (`application.properties` içinde):
- `spring.datasource.*`
- `jwt.secret`
- `jwt.expiration`
- `app.cors.allowed-origins`

---

## Kimlik Doğrulama ve Güvenlik
- Girişte `/api/auth/login` üzerinden JWT üretilir.
- İstekler `Authorization: Bearer <token>` başlığını kullanır.
- Rol tabanlı erişim backend güvenlik yapılandırmasında uygulanır.
- Frontend, sayfaları ve arayüzü role göre korur.
- E-posta veya şifre değiştiğinde güvenlik için yeniden giriş zorunludur.

---

## Doğrulama ve Hata Yönetimi
- Backend, merkezi hata yönetimiyle birlikte Bean Validation (`@Valid`) kullanır.
- Frontend tüm formları (giriş, kayıt, profil, dersler) satır içi hata mesajlarıyla doğrular.

---

## API Dokümantasyonu
Tüm endpoint listesi ve örnek istekler için `docs/api-endpoints.md` dosyasına bakın.

---

## Sık Kullanılan Komutlar
Frontend:
```bash
npm run dev
npm run build
npm run start
npm run lint
```

Backend:
```bash
./mvnw spring-boot:run
./mvnw test
```

---

## Notlar
- CORS izinleri backend'de `app.cors.allowed-origins` ile belirlenir.
- Ders kodları 2-20 karakterlik büyük harf, rakam veya tire içerebilir.
- Telefon numaraları 9-12 hane olacak şekilde doğrulanır.
