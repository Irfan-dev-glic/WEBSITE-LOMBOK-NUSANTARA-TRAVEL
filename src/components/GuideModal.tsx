import React from 'react';
import { X, ArrowRight } from 'lucide-react';
import { DestinationGuide, Language } from '../data/lombokData';

interface GuideModalProps {
  guide: DestinationGuide | null;
  lang: Language;
  onClose: () => void;
  onExplorePackages: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({
  guide,
  lang,
  onClose,
  onExplorePackages
}) => {
  if (!guide) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-medium text-teal-800">{guide.category[lang]}</span>
            <span aria-hidden="true">·</span>
            <span>{guide.publishDate}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-num">{guide.readTimeMin} min read</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <article className="overflow-y-auto p-6 sm:p-8 space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight text-balance">
              {guide.title[lang]}
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <span>
                {lang === 'id' ? 'Musim Terbaik:' : 'Best Season:'}{' '}
                <strong className="text-slate-800">{guide.bestSeason[lang]}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {lang === 'id' ? 'Akses Bandara LOP:' : 'Airport Access:'}{' '}
                <strong className="text-slate-800">{guide.distanceFromAirport}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-num">
                SEO Target: &ldquo;{guide.targetKeyword}&rdquo; ({guide.monthlySearchVolume})
              </span>
            </div>
          </div>

          <div className="aspect-16/9 w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
            <img
              src={guide.image}
              alt={guide.title[lang]}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <p className="text-base text-slate-700 leading-relaxed font-medium">
            {guide.summary[lang]}
          </p>

          <div className="space-y-6 pt-2 border-t border-slate-200">
            {guide.contentSections.map((sec, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">
                  {sec.heading[lang]}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {sec.body[lang]}
                </p>
              </div>
            ))}
          </div>

          <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {lang === 'id'
                  ? 'Ingin Rute Ini Disiapkan Tanpa Repot?'
                  : 'Want This Exact Route Arranged Privately?'}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {lang === 'id'
                  ? 'Konsultasikan jadwal penerbangan Anda dan dapatkan penawaran langsung agen lokal.'
                  : 'Share your flight schedule with our local Lombok team for a direct, transparent quote.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onExplorePackages();
              }}
              className="px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>{lang === 'id' ? 'Lihat Paket Terkait' : 'View Matching Packages'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </article>
      </div>
    </div>
  );
};
