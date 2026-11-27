/* =========================================================
   PENJAGA MONALISA (Vercel Routing Middleware)
   - Belum punya sesi  → diarahkan ke portal (https://www.portalgarut5.web.id/?ke=monalisa)
   - /masuk?t=TIKET    → tiket dari portal diperiksa, lalu sesi 12 jam dibuat
   - /keluar           → sesi dihapus, kembali ke portal
   Kunci rahasia: Environment Variable MONALISA_SECRET (sama dengan Script Property portal).
   ========================================================= */
import { next } from '@vercel/functions';

export const config = { matcher: ['/', '/index.html', '/masuk', '/keluar', '/sesi'] };

const PORTAL = 'https://www.portalgarut5.web.id/';
const PORTAL_MASUK = PORTAL + '?ke=monalisa';
const SESI_JAM = 12;
const PERAN = ['SUPERADMIN', 'ULP'];

const enc = new TextEncoder();
const b64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const dariB64url = (teks) => {
  const s = teks.replace(/-/g, '+').replace(/_/g, '/'); const bin = atob(s + '==='.slice((s.length + 3) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};
const kunciHmac = (rahasia) => crypto.subtle.importKey('raw', enc.encode(rahasia), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);

export async function tandatangani(data, rahasia) {
  const isi = b64url(enc.encode(JSON.stringify(data)));
  const sig = await crypto.subtle.sign('HMAC', await kunciHmac(rahasia), enc.encode(isi));
  return isi + '.' + b64url(sig);
}
export async function periksa(token, rahasia, aud) {
  if (typeof token !== 'string' || token.length > 2048 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) return null;
  const [isi, sig] = token.split('.');
  if (sig.length !== 43 || b64url(dariB64url(sig)) !== sig) return null; // tanda tangan HMAC-SHA256 harus kanonis
  let cocok = false;
  try { cocok = await crypto.subtle.verify('HMAC', await kunciHmac(rahasia), dariB64url(sig), enc.encode(isi)); } catch { return null; }
  if (!cocok) return null;
  let data; try { data = JSON.parse(new TextDecoder().decode(dariB64url(isi))); } catch { return null; }
  if (!data || data.aud !== aud || typeof data.exp !== 'number' || data.exp < Date.now() || PERAN.indexOf(data.r) < 0) return null;
  return data;
}
const ambilKuki = (request, nama) => {
  const m = (request.headers.get('cookie') || '').match(new RegExp('(?:^|;\\s*)' + nama + '=([^;]*)'));
  return m ? m[1] : '';
};
const alihkan = (lokasi, kuki = []) => {
  const h = new Headers({ Location: lokasi, 'Cache-Control': 'no-store' });
  kuki.forEach((k) => h.append('Set-Cookie', k));
  return new Response(null, { status: 302, headers: h });
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const rahasia = process.env.MONALISA_SECRET;
  if (!rahasia || rahasia.length < 32) {
    return new Response('Monalisa belum dikonfigurasi: isi Environment Variable MONALISA_SECRET di Vercel.', { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }

  if (url.pathname === '/masuk') {
    const tiket = await periksa(url.searchParams.get('t'), rahasia, 'monalisa-tiket');
    if (!tiket || tiket.exp - Date.now() > 2 * 60 * 1000) return alihkan(PORTAL_MASUK);
    // Tiket yang dibuat SEBELUM pengguna menekan Keluar di browser ini tidak berlaku lagi
    // (mencegah tombol "Lanjut ke Monalisa" lama yang muncul lagi lewat tombol Back).
    const waktuKeluar = Number(ambilKuki(request, 'monalisa_keluar')) || 0;
    const dibuat = typeof tiket.iat === 'number' ? tiket.iat : tiket.exp - 2 * 60 * 1000;
    if (dibuat <= waktuKeluar) return alihkan(PORTAL_MASUK);
    const umur = SESI_JAM * 3600;
    const sesi = await tandatangani({ aud: 'monalisa-sesi', u: tiket.u, n: tiket.n, r: tiket.r, exp: Date.now() + umur * 1000 }, rahasia);
    return alihkan('/', [
      `monalisa_sesi=${sesi}; Path=/; Max-Age=${umur}; HttpOnly; Secure; SameSite=Lax`,
      `monalisa_nama=${encodeURIComponent(tiket.n || tiket.u)}; Path=/; Max-Age=${umur}; Secure; SameSite=Lax`,
    ]);
  }

  if (url.pathname === '/sesi') { // dipakai halaman untuk memastikan sesi masih sah (mis. setelah tombol Back)
    const ok = await periksa(ambilKuki(request, 'monalisa_sesi'), rahasia, 'monalisa-sesi');
    return new Response(null, { status: ok ? 204 : 401, headers: { 'Cache-Control': 'no-store' } });
  }

  if (url.pathname === '/keluar') {
    // keluar=1 → portal ikut mengakhiri sesinya, jadi tombol Back tidak bisa masuk lagi
    return alihkan(PORTAL + '?keluar=1', [
      'monalisa_sesi=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax',
      'monalisa_nama=; Path=/; Max-Age=0; Secure; SameSite=Lax',
      `monalisa_keluar=${Date.now()}; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=Lax`,
    ]);
  }

  // Halaman utama: wajib punya sesi yang sah
  if (await periksa(ambilKuki(request, 'monalisa_sesi'), rahasia, 'monalisa-sesi')) return next();
  return alihkan(PORTAL_MASUK);
}
