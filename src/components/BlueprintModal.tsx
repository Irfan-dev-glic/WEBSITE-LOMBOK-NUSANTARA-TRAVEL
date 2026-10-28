import React, { useState } from 'react';
import { X, Copy, Check, Download } from 'lucide-react';
import { AGENCY_BLUEPRINT_DATA, Language } from '../data/lombokData';

interface BlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

type BuildApproach = 'self' | 'freelancer' | 'agency';

export const BlueprintModal: React.FC<BlueprintModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  const [approach, setApproach] = useState<BuildApproach>('freelancer');
  const [copied, setCopied] = useState(false);

  const approachConfig: Record<
    BuildApproach,
    {
      label: string;
      platform: string;
      multiplier: number;
      timelineWeeks: string;
      notes: string;
    }
  > = {
    self: {
      label: 'Bangun Sendiri / Tim Internal',
      platform: 'WordPress + Elementor + WP Travel Engine / Custom Template',
      multiplier: 0.45,
      timelineWeeks: '6–8 Minggu',
      notes: 'Biaya pengembangan ditekan ke lisensi plugin & tema premium. Fokus anggaran dialihkan ke foto drone asli & konten SEO.'
    },
    freelancer: {
      label: 'Freelancer Spesialis Travel (Rekomendasi)',
      platform: 'WordPress Custom Tour / React + Headless CMS Cepat',
      multiplier: 1.0,
      timelineWeeks: '5–7 Minggu',
      notes: 'Keseimbangan terbaik antara kecepatan rilis, kualitas desain mobile-first, dan biaya investasi awal.'
    },
    agency: {
      label: 'Agensi Digital Full-Service',
      platform: 'Custom Next.js / Laravel + Payment Gateway Midtrans & Stripe + Dashboard Admin',
      multiplier: 1.85,
      timelineWeeks: '8–10 Minggu',
      notes: 'Terima beres (turnkey) termasuk produksi fotografi/video drone di Lombok, copywriting dwibahasa, dan garansi SLA.'
    }
  };

  const currentConfig = approachConfig[approach];

  const totalMin = AGENCY_BLUEPRINT_DATA.budgetItems.reduce(
    (acc, item) => acc + Math.round(item.minIdr * currentConfig.multiplier),
    0
  );
  const totalMax = AGENCY_BLUEPRINT_DATA.budgetItems.reduce(
    (acc, item) => acc + Math.round(item.maxIdr * currentConfig.multiplier),
    0
  );

  const generateMarkdownDocument = () => {
    return `# Dokumen Rencana Implementasi: Lombok Nusantara Travel
Mode Eksekusi: ${currentConfig.label}
Teknologi Utama: ${currentConfig.platform}
Estimasi Durasi: ${currentConfig.timelineWeeks}
Estimasi Total Anggaran: Rp ${totalMin.toLocaleString('id-ID')} – Rp ${totalMax.toLocaleString('id-ID')}

## 1. Matriks Kata Kunci SEO Prioritas
${AGENCY_BLUEPRINT_DATA.seoKeywords
  .map((k) => `- [${k.lang}] "${k.keyword}" (${k.estVolume}) -> Target: ${k.targetPage} (${k.intent})`)
  .join('\n')}

## 2. Timeline 8 Minggu
${AGENCY_BLUEPRINT_DATA.timeline
  .map((t) => `- ${t.week} (${t.phase}): ${t.deliverables} [${t.status}]`)
  .join('\n')}
`;
  };

  const handleCopyDoc = () => {
    navigator.clipboard.writeText(generateMarkdownDocument());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadDoc = () => {
    const blob = new Blob([generateMarkdownDocument()], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Blueprint-Lombok-Nusantara-Travel-${approach}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {lang === 'id'
                ? 'Dokumen Rencana Proyek, Kalkulator Anggaran & Matriks SEO'
                : 'Project Implementation Plan, Budget Simulator & SEO Matrix'}
            </h2>
            <p className="text-xs text-slate-500">
              Lombok Nusantara Travel · Simulasi Pembangunan Mandiri vs Freelancer vs Agensi
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-8">
          {/* Interactive Execution Mode Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              Pilih Skema Pengerjaan Website (Untuk Menyesuaikan Estimasi Anggaran & Stack):
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(['self', 'freelancer', 'agency'] as BuildApproach[]).map((key) => {
                const item = approachConfig[key];
                const isSelected = approach === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setApproach(key)}
                    className={`text-left p-4 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-700 bg-teal-50/40 ring-1 ring-teal-700'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="text-sm font-semibold text-slate-900">{item.label}</div>
                    <div className="mt-1 text-xs text-teal-800 font-mono-num">
                      Estimasi Durasi: {item.timelineWeeks}
                    </div>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">{item.notes}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Budget Table */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-base font-semibold text-slate-900">
                01. Rincian Estimasi Anggaran ({currentConfig.label})
              </h3>
              <span className="text-xs text-slate-500">
                Rekomendasi Stack: <strong className="text-slate-800">{currentConfig.platform}</strong>
              </span>
            </div>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
                    <th className="py-3 px-4 font-semibold">Komponen Kebutuhan</th>
                    <th className="py-3 px-4 font-semibold text-right">Batas Bawah (IDR)</th>
                    <th className="py-3 px-4 font-semibold text-right">Batas Atas (IDR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {AGENCY_BLUEPRINT_DATA.budgetItems.map((b, idx) => {
                    const adjMin = Math.round(b.minIdr * currentConfig.multiplier);
                    const adjMax = Math.round(b.maxIdr * currentConfig.multiplier);
                    return (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 text-slate-800">{b.item}</td>
                        <td className="py-3 px-4 text-right font-mono-num text-slate-700">
                          Rp {adjMin.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono-num text-slate-900 font-medium">
                          Rp {adjMax.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-50 font-semibold text-slate-900">
                    <td className="py-3.5 px-4">Total Estimasi Investasi Tahap Awal</td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-teal-800">
                      Rp {totalMin.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-teal-800">
                      Rp {totalMax.toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SEO Keyword Strategy Matrix */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-slate-900">
              02. Target Kata Kunci SEO (Halaman Pertama Google ID & EN)
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
                    <th className="py-2.5 px-4 font-semibold">Kata Kunci Utama</th>
                    <th className="py-2.5 px-4 font-semibold">Bahasa</th>
                    <th className="py-2.5 px-4 font-semibold">Search Intent</th>
                    <th className="py-2.5 px-4 font-semibold">Halaman Landing</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Volume/Bulan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                  {AGENCY_BLUEPRINT_DATA.seoKeywords.map((kw, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4 font-medium text-slate-900">{kw.keyword}</td>
                      <td className="py-2.5 px-4 text-slate-600 font-mono-num">{kw.lang}</td>
                      <td className="py-2.5 px-4 text-slate-600">{kw.intent}</td>
                      <td className="py-2.5 px-4 font-mono-num text-xs text-teal-800">{kw.targetPage}</td>
                      <td className="py-2.5 px-4 text-right font-mono-num text-slate-700">{kw.estVolume}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 8-Week Timeline */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-slate-900">
              03. Tahapan & Timeline Peluncuran (8 Minggu)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {AGENCY_BLUEPRINT_DATA.timeline.map((step, i) => (
                <div key={i} className="p-4 border border-slate-200 rounded-lg bg-white space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono-num text-teal-800">
                    <span>{step.week}</span>
                    <span>{step.status}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">{step.phase}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.deliverables}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500">
            Dokumen ini dapat diunduh sebagai format Markdown (.md) untuk brief tim / freelancer.
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyDoc}
              className="py-2 px-3.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-700" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Dokumen Tersalin' : 'Salin Brief Proyek'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadDoc}
              className="py-2 px-4 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Dokumen (.md)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
