import React, { useState } from 'react';
import { X, Check, Calendar, Users, ArrowRight, Copy, CheckCircle2, HelpCircle, MapPin } from 'lucide-react';
import { TourPackage, Language, Currency } from '../data/lombokData';

interface PackageDetailModalProps {
  pkg: TourPackage | null;
  lang: Language;
  currency: Currency;
  onClose: () => void;
}

export const PackageDetailModal: React.FC<PackageDetailModalProps> = ({
  pkg,
  lang,
  currency,
  onClose
}) => {
  if (!pkg) return null;

  const [activeTab, setActiveTab] = useState<'itinerary' | 'inclusions' | 'faq'>('itinerary');
  const [selectedImage, setSelectedImage] = useState<string>(pkg.image);
  const [pax, setPax] = useState<number>(Math.max(2, pkg.minPax));
  const [travelDate, setTravelDate] = useState<string>('2026-11-15');
  const [addDrone, setAddDrone] = useState<boolean>(false);
  const [addAirportPickup, setAddAirportPickup] = useState<boolean>(false);
  const [guestName, setGuestName] = useState<string>('');
  const [guestContact, setGuestContact] = useState<string>('');
  const [pickupNotes, setPickupNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [bookingSubmitted, setBookingSubmitted] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  const formatMoney = (idr: number, usd: number) => {
    if (currency === 'IDR') {
      return `Rp ${idr.toLocaleString('id-ID')}`;
    }
    return `$${usd.toLocaleString('en-US')}`;
  };

  // Group discount calculation: 5% off for 4-7 pax, 10% off for 8+ pax
  const discountRate = pax >= 8 ? 0.1 : pax >= 4 ? 0.05 : 0;
  const unitIdr = Math.round(pkg.priceIdr * (1 - discountRate));
  const unitUsd = Math.round(pkg.priceUsd * (1 - discountRate));

  const droneIdr = addDrone ? 350000 : 0;
  const droneUsd = addDrone ? 25 : 0;
  const pickupIdr = addAirportPickup ? 250000 : 0;
  const pickupUsd = addAirportPickup ? 18 : 0;

  const totalIdr = unitIdr * pax + droneIdr + pickupIdr;
  const totalUsd = unitUsd * pax + droneUsd + pickupUsd;
  const otaTotalIdr = pkg.otaPriceIdr * pax + droneIdr + pickupIdr;
  const otaTotalUsd = pkg.otaPriceUsd * pax + droneUsd + pickupUsd;
  const savedIdr = otaTotalIdr - totalIdr;
  const savedUsd = otaTotalUsd - totalUsd;

  const bookingRef = `LNT-${pkg.id.slice(-4).toUpperCase()}-${ pax }P`;

  const buildWhatsAppMessage = () => {
    const title = pkg.title[lang];
    const totalStr = formatMoney(totalIdr, totalUsd);
    if (lang === 'id') {
      return `Halo Admin Lombok Nusantara Travel, saya ingin booking langsung tanpa OTA:\n\n` +
        `• Kode Referensi: ${bookingRef}\n` +
        `• Paket: ${title}\n` +
        `• Tanggal Keberangkatan: ${travelDate}\n` +
        `• Jumlah Peserta: ${pax} Orang\n` +
        `• Tambahan: ${[addDrone ? 'Dokumentasi Drone' : '', addAirportPickup ? 'Jemput Bandara LOP' : ''].filter(Boolean).join(', ') || 'Tidak ada'}\n` +
        `• Estimasi Total Langsung: ${totalStr}\n` +
        `• Nama Pemesan: ${guestName}\n` +
        `• Kontak/WA: ${guestContact}\n` +
        `• Catatan Hotel/Penerbangan: ${pickupNotes || '-'}`;
    }
    return `Hello Lombok Nusantara Travel, I would like to request a direct booking:\n\n` +
      `• Reference: ${bookingRef}\n` +
      `• Package: ${title}\n` +
      `• Travel Date: ${travelDate}\n` +
      `• Guests: ${pax} Pax\n` +
      `• Add-ons: ${[addDrone ? 'DJI Drone Footage' : '', addAirportPickup ? 'LOP Airport Pickup' : ''].filter(Boolean).join(', ') || 'None'}\n` +
      `• Direct Total Estimate: ${totalStr}\n` +
      `• Guest Name: ${guestName}\n` +
      `• Contact/WhatsApp: ${guestContact}\n` +
      `• Hotel/Flight Notes: ${pickupNotes || '-'}`;
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || guestName.trim().length < 2) {
      setFormError(lang === 'id' ? 'Mohon isi nama lengkap pemesan.' : 'Please enter your full name.');
      return;
    }
    if (!guestContact.trim() || guestContact.trim().length < 7) {
      setFormError(
        lang === 'id'
          ? 'Mohon isi nomor WhatsApp atau email aktif untuk pengiriman konfirmasi.'
          : 'Please enter a valid WhatsApp number or email address.'
      );
      return;
    }
    setFormError('');
    setBookingSubmitted(true);
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(buildWhatsAppMessage());
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-pkg-title"
    >
      <div className="relative w-full max-w-6xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top bar inside modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-medium text-teal-800">{pkg.regionLabel[lang]}</span>
            <span aria-hidden="true">·</span>
            <span>{pkg.durationLabel[lang]}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-num">★ {pkg.rating} ({pkg.reviewCount} {lang === 'id' ? 'ulasan' : 'reviews'})</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label={lang === 'id' ? 'Tutup detail paket' : 'Close package details'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal scrollable body */}
        <div className="overflow-y-auto p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 7 columns: Visuals, Tabs, Itinerary, Inclusions, FAQ */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h2 id="modal-pkg-title" className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight text-balance">
                {pkg.title[lang]}
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-teal-700 shrink-0" />
                <span>{pkg.subtitle[lang]}</span>
              </p>
            </div>

            {/* Main Photo + Gallery Thumbnails */}
            <div className="space-y-3">
              <div className="relative aspect-16/10 w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={selectedImage}
                  alt={pkg.title[lang]}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-3">
                {pkg.gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative w-24 aspect-4/3 rounded-md overflow-hidden border transition-all cursor-pointer ${
                      selectedImage === imgUrl
                        ? 'border-teal-700 ring-2 ring-teal-700/20'
                        : 'border-slate-200 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${pkg.title[lang]} ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Key Highlights */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                {lang === 'id' ? 'Keunggulan Paket Langsung (Direct Booking)' : 'Direct Booking Highlights'}
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                {pkg.highlights[lang].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interactive Segmented Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200/70">
              <button
                type="button"
                onClick={() => setActiveTab('itinerary')}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'itinerary'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'id' ? 'Rencana Perjalanan (Itinerary)' : 'Day-by-Day Itinerary'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('inclusions')}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'inclusions'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'id' ? 'Termasuk & Tidak Termasuk' : 'Inclusions & Exclusions'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('faq')}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'faq'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'id' ? 'FAQ Paket' : 'Package FAQs'}
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'itinerary' && (
              <div className="space-y-6">
                {pkg.itinerary.map((dayItem) => (
                  <div key={dayItem.day} className="border border-slate-200 rounded-lg p-5 bg-white">
                    <div className="text-xs font-mono-num text-teal-800 font-medium mb-1">
                      {lang === 'id' ? `Hari 0${dayItem.day}` : `Day 0${dayItem.day}`}
                    </div>
                    <h4 className="text-base font-semibold text-slate-900 mb-4">
                      {dayItem.title[lang]}
                    </h4>
                    <div className="space-y-3 border-t border-slate-100 pt-3">
                      {dayItem.schedule.map((slot, sIdx) => (
                        <div key={sIdx} className="grid grid-cols-12 gap-3 text-sm">
                          <span className="col-span-3 sm:col-span-2 font-mono-num text-xs text-slate-500 pt-0.5">
                            {slot.time} WITA
                          </span>
                          <span className="col-span-9 sm:col-span-10 text-slate-700">
                            {slot.activity[lang]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'inclusions' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="border border-slate-200 rounded-lg p-5 bg-white">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">
                    {lang === 'id' ? 'Sudah Termasuk (Inklusi)' : 'Included in Package'}
                  </h4>
                  <ul className="space-y-2.5 text-sm text-slate-700">
                    {pkg.inclusions[lang].map((inc, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border border-slate-200 rounded-lg p-5 bg-white">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">
                    {lang === 'id' ? 'Belum Termasuk (Eksklusi)' : 'Not Included'}
                  </h4>
                  <ul className="space-y-2.5 text-sm text-slate-600">
                    {pkg.exclusions[lang].map((exc, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-slate-400 font-mono-num">–</span>
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-4">
                {pkg.faqs.map((item, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-5 bg-white">
                    <h4 className="text-sm font-semibold text-slate-900 flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                      <span>{item.q[lang]}</span>
                    </h4>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed pl-6">
                      {item.a[lang]}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right 5 columns: Direct Booking Calculator & Instant Inquiry */}
          <div className="lg:col-span-5">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sticky top-4">
              <div className="pb-4 border-b border-slate-200">
                <div className="text-xs text-slate-500">
                  {lang === 'id' ? 'Harga Resmi Agen Lokal (Tanpa Markup OTA)' : 'Direct Local Agency Rate (Zero OTA Markup)'}
                </div>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-bold font-mono-num text-slate-900">
                    {formatMoney(unitIdr, unitUsd)}
                  </span>
                  <span className="text-xs text-slate-500">
                    / {lang === 'id' ? 'orang' : 'person'}
                  </span>
                  <span className="text-xs font-mono-num text-slate-400 line-through ml-auto">
                    OTA: {formatMoney(pkg.otaPriceIdr, pkg.otaPriceUsd)}
                  </span>
                </div>
                {discountRate > 0 && (
                  <p className="mt-1.5 text-xs text-teal-800 font-medium">
                    {lang === 'id'
                      ? `Diskon rombongan ${discountRate * 100}% aktif untuk ${pax} peserta`
                      : `${discountRate * 100}% group discount applied for ${pax} guests`}
                  </p>
                )}
              </div>

              {!bookingSubmitted ? (
                <form onSubmit={handleConfirmBooking} className="mt-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        {lang === 'id' ? 'Tanggal Tur' : 'Travel Date'}
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={travelDate}
                          onChange={(e) => setTravelDate(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono-num focus:outline-none focus:border-teal-700"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        {lang === 'id' ? 'Jumlah Peserta' : 'Number of Guests'}
                      </label>
                      <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setPax(Math.max(pkg.minPax, pax - 1))}
                          className="px-3 py-2 text-slate-700 hover:bg-slate-100 font-mono-num cursor-pointer"
                        >
                          -
                        </button>
                        <span className="flex-1 text-center text-sm font-mono-num font-semibold">
                          {pax} {lang === 'id' ? 'Org' : 'Pax'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPax(Math.min(pkg.maxPax, pax + 1))}
                          className="px-3 py-2 text-slate-700 hover:bg-slate-100 font-mono-num cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Optional Add-ons */}
                  <div className="space-y-2 pt-1">
                    <span className="block text-xs font-medium text-slate-700">
                      {lang === 'id' ? 'Layanan Tambahan Opsional' : 'Optional Add-Ons'}
                    </span>
                    <label className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg text-xs cursor-pointer hover:border-slate-300">
                      <span className="flex items-center gap-2 text-slate-700">
                        <input
                          type="checkbox"
                          checked={addAirportPickup}
                          onChange={(e) => setAddAirportPickup(e.target.checked)}
                          className="rounded text-teal-700 focus:ring-teal-700"
                        />
                        <span>{lang === 'id' ? 'Penjemputan Privat Bandara LOP' : 'Private LOP Airport Pickup'}</span>
                      </span>
                      <span className="font-mono-num font-medium text-slate-900">
                        +{formatMoney(250000, 18)}
                      </span>
                    </label>
                    <label className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg text-xs cursor-pointer hover:border-slate-300">
                      <span className="flex items-center gap-2 text-slate-700">
                        <input
                          type="checkbox"
                          checked={addDrone}
                          onChange={(e) => setAddDrone(e.target.checked)}
                          className="rounded text-teal-700 focus:ring-teal-700"
                        />
                        <span>{lang === 'id' ? 'Dokumentasi Video Drone DJI' : 'DJI Aerial Drone Video Package'}</span>
                      </span>
                      <span className="font-mono-num font-medium text-slate-900">
                        +{formatMoney(350000, 25)}
                      </span>
                    </label>
                  </div>

                  {/* Guest Details */}
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        {lang === 'id' ? 'Nama Lengkap Pemesan' : 'Full Name'}
                      </label>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder={lang === 'id' ? 'Contoh: Budi Santoso' : 'e.g. Sarah Jenkins'}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        {lang === 'id' ? 'Nomor WhatsApp / Email Aktif' : 'WhatsApp Number or Email'}
                      </label>
                      <input
                        type="text"
                        value={guestContact}
                        onChange={(e) => setGuestContact(e.target.value)}
                        placeholder={lang === 'id' ? '+62 812-xxxx-xxxx' : '+61 4xx xxx xxx / email'}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        {lang === 'id' ? 'Lokasi Jemput Hotel / Nomor Penerbangan (Opsional)' : 'Hotel Pickup / Flight Number (Optional)'}
                      </label>
                      <input
                        type="text"
                        value={pickupNotes}
                        onChange={(e) => setPickupNotes(e.target.value)}
                        placeholder={lang === 'id' ? 'Contoh: Katamaran Resort Senggigi / GA-432' : 'e.g. Pullman Mandalika / Flight TR-260'}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                      />
                    </div>
                  </div>

                  {formError && (
                    <div className="p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg">
                      {formError}
                    </div>
                  )}

                  {/* Price Breakdown Box */}
                  <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>{pax}x {pkg.title[lang].slice(0, 28)}...</span>
                      <span className="font-mono-num">{formatMoney(unitIdr * pax, unitUsd * pax)}</span>
                    </div>
                    {(addAirportPickup || addDrone) && (
                      <div className="flex justify-between text-slate-600">
                        <span>{lang === 'id' ? 'Layanan Tambahan' : 'Selected Add-ons'}</span>
                        <span className="font-mono-num">{formatMoney(droneIdr + pickupIdr, droneUsd + pickupUsd)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline font-semibold text-sm text-slate-900">
                      <span>{lang === 'id' ? 'Total Estimasi Langsung' : 'Total Direct Estimate'}</span>
                      <span className="font-mono-num text-base text-teal-800">{formatMoney(totalIdr, totalUsd)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-teal-700 pt-0.5">
                      <span>{lang === 'id' ? 'Penghematan vs OTA (Traveloka/Viator)' : 'Your Savings vs. OTA Platforms'}</span>
                      <span className="font-mono-num font-semibold">
                        {lang === 'id' ? 'Hemat ' : 'Save '} {formatMoney(savedIdr, savedUsd)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-teal-800 hover:bg-teal-900 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <span>{lang === 'id' ? 'Buat Draf Booking & Kunci Harga' : 'Generate Direct Booking Voucher'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="mt-5 space-y-4">
                  <div className="p-4 bg-teal-50/80 border border-teal-200 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-teal-900 font-semibold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-teal-700 shrink-0" />
                      <span>
                        {lang === 'id' ? 'Draf Reservasi Siap Dikirim' : 'Direct Reservation Voucher Ready'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {lang === 'id'
                        ? `Kode booking Anda adalah ${bookingRef}. Tidak ada biaya yang ditagihkan saat ini—tim konsultan lokal kami di Senggigi akan memverifikasi ketersediaan kuota dalam 10 menit.`
                        : `Your booking reference is ${bookingRef}. No upfront card charge is taken right now—our local Lombok desk will confirm slot availability within 10 minutes.`}
                    </p>
                  </div>

                  <div className="p-3.5 bg-white border border-slate-200 rounded-lg font-mono-num text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                    {buildWhatsAppMessage()}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <a
                      href={`https://wa.me/6281907882410?text=${encodeURIComponent(buildWhatsAppMessage())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-4 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold rounded-lg text-center transition-colors whitespace-nowrap"
                    >
                      {lang === 'id' ? 'Kirim ke WhatsApp Resmi' : 'Send via Official WhatsApp'}
                    </a>
                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>
                        {copiedSummary
                          ? lang === 'id'
                            ? 'Tersalin!'
                            : 'Copied!'
                          : lang === 'id'
                          ? 'Salin Ringkasan'
                          : 'Copy Summary'}
                      </span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setBookingSubmitted(false)}
                    className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    {lang === 'id' ? 'Ubah jumlah peserta atau tanggal' : 'Modify date or guest count'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
