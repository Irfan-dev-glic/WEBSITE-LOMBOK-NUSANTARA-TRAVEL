/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ArrowRight,
  Check,
  FileText,
  ChevronRight,
  MessageCircle,
  Database,
  LogIn
} from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  Language,
  Currency,
  TOUR_PACKAGES,
  TRANSFER_ROUTES,
  FAST_BOAT_SCHEDULES,
  DESTINATION_GUIDES,
  TESTIMONIALS,
  HERO_IMAGE,
  TourPackage,
  DestinationGuide
} from './data/lombokData';
import {
  auth,
  db,
  signInWithGoogle,
  handleFirestoreError,
  OperationType
} from './firebase';
import { PackageDetailModal } from './components/PackageDetailModal';
import { BlueprintModal } from './components/BlueprintModal';
import { GuideModal } from './components/GuideModal';
import { ReservationsModal } from './components/ReservationsModal';

export default function App() {
  const [lang, setLang] = useState<Language>('id');
  const [currency, setCurrency] = useState<Currency>('IDR');

  // Firebase Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Package Filters
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [durationFilter, setDurationFilter] = useState<'all' | '1d' | 'multi'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Modals
  const [selectedPackage, setSelectedPackage] = useState<TourPackage | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<DestinationGuide | null>(null);
  const [isBlueprintOpen, setIsBlueprintOpen] = useState<boolean>(false);
  const [isReservationsOpen, setIsReservationsOpen] = useState<boolean>(false);

  // Interactive Airport Transfer & Car Charter Calculator State
  const [selectedRouteId, setSelectedRouteId] = useState<string>(TRANSFER_ROUTES[0].id);
  const [vehicleType, setVehicleType] = useState<'avanza' | 'innova' | 'hiace'>('innova');
  const [transferDate, setTransferDate] = useState<string>('2026-11-18');
  const [flightCode, setFlightCode] = useState<string>('');
  const [transferBookedMsg, setTransferBookedMsg] = useState<string>('');
  const [transferSavedToDb, setTransferSavedToDb] = useState<boolean>(false);

  // Interactive Lombok Zone Explorer State
  const [activeZone, setActiveZone] = useState<'south' | 'north' | 'east' | 'west'>('south');

  // Legal Policy Tab State in Footer/Contact
  const [activeLegalTab, setActiveLegalTab] = useState<'terms' | 'refund' | 'privacy'>('terms');

  // Contact / Custom Trip Form State
  const [inquiryName, setInquiryName] = useState<string>('');
  const [inquiryEmailOrWa, setInquiryEmailOrWa] = useState<string>('');
  const [inquirySegment, setInquirySegment] = useState<string>('Keluarga / Privat');
  const [inquiryPax, setInquiryPax] = useState<string>('4');
  const [inquiryNotes, setInquiryNotes] = useState<string>('');
  const [inquiryError, setInquiryError] = useState<string>('');
  const [inquirySubmitted, setInquirySubmitted] = useState<boolean>(false);
  const [inquirySavedToDb, setInquirySavedToDb] = useState<boolean>(false);

  const formatMoney = (idr: number, usd: number) => {
    if (currency === 'IDR') {
      return `Rp ${idr.toLocaleString('id-ID')}`;
    }
    return `$${usd.toLocaleString('en-US')}`;
  };

  const filteredPackages = useMemo(() => {
    return TOUR_PACKAGES.filter((pkg) => {
      if (regionFilter !== 'all' && pkg.region !== regionFilter) return false;
      if (segmentFilter !== 'all' && pkg.segment !== segmentFilter) return false;
      if (durationFilter === '1d' && pkg.durationDays !== 1) return false;
      if (durationFilter === 'multi' && pkg.durationDays <= 1) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchTitle = pkg.title[lang].toLowerCase().includes(q);
        const matchSub = pkg.subtitle[lang].toLowerCase().includes(q);
        const matchKw = pkg.seoKeywords.some((k) => k.toLowerCase().includes(q));
        return matchTitle || matchSub || matchKw;
      }
      return true;
    });
  }, [regionFilter, segmentFilter, durationFilter, searchQuery, lang]);

  const currentTransferRoute =
    TRANSFER_ROUTES.find((r) => r.id === selectedRouteId) || TRANSFER_ROUTES[0];

  const getTransferPrice = () => {
    if (vehicleType === 'avanza') {
      return { idr: currentTransferRoute.avanzaIdr, usd: currentTransferRoute.avanzaUsd, label: 'Toyota Avanza / Xenia (1–4 Pax)' };
    }
    if (vehicleType === 'innova') {
      return { idr: currentTransferRoute.innovaIdr, usd: currentTransferRoute.innovaUsd, label: 'Toyota Innova Zenix (1–6 Pax)' };
    }
    return { idr: currentTransferRoute.hiaceIdr, usd: currentTransferRoute.hiaceUsd, label: 'Toyota HiAce Premio (7–14 Pax)' };
  };

  const transferPriceObj = getTransferPrice();
  const transferOtaIdr = Math.round(
    transferPriceObj.idr * (1 + currentTransferRoute.otaMarkupPercent / 100)
  );
  const transferOtaUsd = Math.round(
    transferPriceObj.usd * (1 + currentTransferRoute.otaMarkupPercent / 100)
  );

  const handleBookTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const routeName = currentTransferRoute.destination[lang];
    const priceText = formatMoney(transferPriceObj.idr, transferPriceObj.usd);

    if (user) {
      const newDocRef = doc(collection(db, 'transfers'));
      const path = `transfers/${newDocRef.id}`;
      try {
        await setDoc(newDocRef, {
          ownerId: user.uid,
          routeId: currentTransferRoute.id.slice(0, 64),
          routeName: routeName.slice(0, 160),
          vehicleType,
          pickupDate: transferDate.slice(0, 20),
          flightCode: flightCode.trim().slice(0, 60),
          priceIdr: Math.min(50000000, Math.max(0, Math.round(transferPriceObj.idr))),
          priceUsd: Math.min(5000, Math.max(0, Math.round(transferPriceObj.usd))),
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setTransferSavedToDb(true);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    } else {
      setTransferSavedToDb(false);
    }

    const msg =
      lang === 'id'
        ? `Reservasi Transfer (${routeName}) dengan ${transferPriceObj.label} pada ${transferDate} (${flightCode || 'Tanpa Kode Penerbangan'}) senilai ${priceText} siap dikonfirmasi.`
        : `Transfer reservation (${routeName}) with ${transferPriceObj.label} on ${transferDate} (${flightCode || 'Flight TBA'}) at ${priceText} is ready for confirmation.`;
    setTransferBookedMsg(msg);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || inquiryName.trim().length < 2) {
      setInquiryError(
        lang === 'id' ? 'Mohon masukkan nama lengkap Anda (min. 2 karakter).' : 'Please enter your full name.'
      );
      return;
    }
    if (!inquiryEmailOrWa.trim() || inquiryEmailOrWa.trim().length < 5) {
      setInquiryError(
        lang === 'id'
          ? 'Mohon masukkan nomor WhatsApp atau alamat email yang valid.'
          : 'Please enter a valid WhatsApp number or email address.'
      );
      return;
    }
    setInquiryError('');

    if (user) {
      const newDocRef = doc(collection(db, 'inquiries'));
      const path = `inquiries/${newDocRef.id}`;
      const numericPax = Math.min(500, Math.max(1, parseInt(inquiryPax, 10) || 2));
      try {
        await setDoc(newDocRef, {
          ownerId: user.uid,
          guestName: inquiryName.trim().slice(0, 100),
          contactInfo: inquiryEmailOrWa.trim().slice(0, 120),
          segment: inquirySegment.slice(0, 80),
          paxCount: numericPax,
          notes: inquiryNotes.trim().slice(0, 500),
          status: 'new',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setInquirySavedToDb(true);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    } else {
      setInquirySavedToDb(false);
    }

    setInquirySubmitted(true);
  };

  const zoneDetails = {
    south: {
      name: { id: 'Zona Selatan: Kuta Mandalika, Tanjung Aan & Desa Sade', en: 'South Zone: Kuta Mandalika, Tanjung Aan & Sade Village' },
      transit: { id: '15–25 menit dari Bandara Internasional LOP', en: '15–25 mins from LOP International Airport' },
      character: {
        id: 'Garis pantai berbukit zamrud, pasir merica Tanjung Aan, Sirkuit Internasional Mandalika, dan desa tenun tradisional Sasak.',
        en: 'Emerald coastal headlands, twin turquoise bays at Tanjung Aan, Mandalika Street Circuit, and ancestral Sasak weaving villages.'
      },
      recommendedPkgId: 'pkg-mandalika-3d2n'
    },
    north: {
      name: { id: 'Zona Utara: Gili Trawangan, Gili Meno, Gili Air & Gunung Rinjani', en: 'North Zone: 3 Gili Islands & Mount Rinjani National Park' },
      transit: { id: '90 menit ke Dermaga Teluk Nara · 2,5 jam ke Sembalun', en: '90 mins to Teluk Nara Jetty · 2.5 hrs to Sembalun Valley' },
      character: {
        id: 'Tiga pulau karang bebas polusi kendaraan bermotor dengan konservasi penyu hijau, serta puncak vulkanik tertinggi kedua di Indonesia (3.726 mdpl).',
        en: 'Three car-free coral islands with sea turtle sanctuaries, paired with Indonesia’s second-highest volcanic peak (3,726m).'
      },
      recommendedPkgId: 'pkg-3gili-private'
    },
    east: {
      name: { id: 'Zona Timur: Pantai Pink Tangsi, Pulau Pasir & Gili Petelu', en: 'East Zone: Tangsi Pink Beach, Sandbar Island & Gili Petelu' },
      transit: { id: '75 menit ke Pelabuhan Tanjung Luar + 30 menit kapal privat', en: '75 mins to Tanjung Luar Harbor + 30 mins private boat' },
      character: {
        id: 'Perairan tenang berpasir merah muda alami dari serpihan koral merah, gundukan pasir timbul di tengah laut, dan tebing Tanjung Ringgit.',
        en: 'Blush-pink coral beaches, tidal sandbars in open turquoise water, and dramatic limestone cliffs facing Sumbawa.'
      },
      recommendedPkgId: 'pkg-pink-beach-private'
    },
    west: {
      name: { id: 'Zona Barat & Tengah: Senggigi, Bukit Malimbu & Air Terjun Benang Kelambu', en: 'West & Central Foothills: Senggigi Coast & Benang Kelambu Waterfall' },
      transit: { id: '45–60 menit dari Bandara LOP atau Kota Mataram', en: '45–60 mins from LOP Airport or Mataram City' },
      character: {
        id: 'Deretan resort bintang 5 menghadap selat Bali, mata air pegunungan yang jatuh bagai tirai hijau di Geopark Rinjani, dan sentra kuliner Taliwang.',
        en: 'Five-star sunset beachfront resorts facing Mount Agung Bali, spring-fed curtain waterfalls, and Mataram’s culinary heartland.'
      },
      recommendedPkgId: 'pkg-sade-benang-kelambu'
    }
  };

  const activeZoneObj = zoneDetails[activeZone];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 py-3.5">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#"
            className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-display whitespace-nowrap shrink-0"
          >
            LOMBOK NUSANTARA TRAVEL
          </a>

          {/* Zone 2: 5 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a
              href="#paket-wisata"
              className="hover:text-teal-800 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {lang === 'id' ? 'Paket Wisata' : 'Tour Packages'}
            </a>
            <a
              href="#layanan"
              className="hover:text-teal-800 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {lang === 'id' ? 'Transfer & Layanan' : 'Transfers & Fleet'}
            </a>
            <a
              href="#destinasi"
              className="hover:text-teal-800 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {lang === 'id' ? 'Panduan Destinasi' : 'Destination Guide'}
            </a>
            <a
              href="#ulasan"
              className="hover:text-teal-800 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {lang === 'id' ? 'Ulasan & Legalitas' : 'Reviews & Trust'}
            </a>
            <a
              href="#kontak"
              className="hover:text-teal-800 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {lang === 'id' ? 'Kontak' : 'Contact'}
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <a
              href="#kontak"
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              {lang === 'id' ? 'Reservasi Langsung' : 'Book Direct'}
            </a>
          </div>
        </div>
      </header>

      {/* WORKSPACE UTILITY BAR BELOW THE FOLD / TOP BAR (Bilingual Toggle, Currency Toggle, Cloud Database & Blueprint) */}
      <div className="bg-slate-900 text-slate-200 border-b border-slate-800">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-300">
            <span className="font-semibold text-white">LOMBOK NUSANTARA TRAVEL</span>
            <span aria-hidden="true">·</span>
            <span>{lang === 'id' ? 'Harga Langsung Agen Lokal (Hemat 18–25% vs OTA)' : 'Direct Local Operator Rates (Save 18–25% vs OTAs)'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 ml-auto">
            {/* Language Toggle */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-md border border-slate-700">
              <button
                type="button"
                onClick={() => setLang('id')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  lang === 'id' ? 'bg-teal-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ID · Indonesia
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  lang === 'en' ? 'bg-teal-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN · English
              </button>
            </div>

            {/* Currency Toggle */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-md border border-slate-700 font-mono-num">
              <button
                type="button"
                onClick={() => setCurrency('IDR')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  currency === 'IDR' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                IDR (Rp)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  currency === 'USD' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                USD ($)
              </button>
            </div>

            {/* Cloud Database & Reservations Console Trigger */}
            <button
              type="button"
              onClick={() => setIsReservationsOpen(true)}
              className="px-3 py-1 bg-teal-800 hover:bg-teal-700 text-white border border-teal-700 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>
                {user
                  ? lang === 'id'
                    ? `Database Reservasi (${user.displayName?.split(' ')[0] || 'Aktif'})`
                    : `Cloud DB (${user.displayName?.split(' ')[0] || 'Active'})`
                  : lang === 'id'
                  ? 'Database & Login'
                  : 'Cloud DB & Login'}
              </span>
            </button>

            {/* Blueprint Strategy Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsBlueprintOpen(true)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{lang === 'id' ? 'Rencana & SEO (8 Minggu)' : '8-Week Plan & SEO'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: HERO PROPOSITION */}
      <section className="relative pt-8 pb-14 lg:py-16 border-b border-slate-200 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left 6 cols: Value Proposition */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-teal-800 font-medium">
                  <span className="font-bold tracking-wide">LOMBOK NUSANTARA TRAVEL</span>
                  <span aria-hidden="true">·</span>
                  <span>ASITA NTB & e-Rinjani TNGR</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-num">★ 4.9/5 (428 {lang === 'id' ? 'Ulasan' : 'Reviews'})</span>
                </div>

                <h1
                  className="font-display font-semibold text-slate-900 tracking-tight text-balance leading-[1.12]"
                  style={{ fontSize: 'clamp(2.25rem, 3.8vw, 3.5rem)' }}
                >
                  {lang === 'id'
                    ? 'LOMBOK NUSANTARA TRAVEL — Jelajahi Gili, Mandalika & Rinjani Bersama Tim Lokal.'
                    : 'LOMBOK NUSANTARA TRAVEL — Experience the Gilis, Mandalika & Rinjani Direct.'}
                </h1>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-[62ch]">
                  {lang === 'id'
                    ? 'Pesan paket wisata privat, open trip 3 Gili, pendakian Gunung Rinjani, hingga transfer Bandara Internasional LOP tanpa komisi perantara OTA. Armada milik sendiri, pemandu berlisensi HPI, dan jaminan harga jujur.'
                    : 'Book private island charters, 3 Gili snorkeling, official Mount Rinjani expeditions, and LOP Airport transfers without third-party OTA markups. In-house fleet, certified guides, and transparent local pricing.'}
                </p>
              </div>

              {/* Primary Decision Action + Quick Filter Presets */}
              <div className="space-y-5 pt-2">
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="#paket-wisata"
                    className="px-6 py-3.5 bg-teal-800 hover:bg-teal-900 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <span>{lang === 'id' ? 'Lihat Paket & Harga Langsung' : 'Explore Direct Tour Packages'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsReservationsOpen(true)}
                    className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2"
                  >
                    <Database className="w-4 h-4 text-teal-800" />
                    <span>{lang === 'id' ? 'Cek Reservasi & Database' : 'Cloud Reservations & DB'}</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="text-xs text-slate-500 mb-2">
                    {lang === 'id' ? 'Pencarian Populer Berdasarkan Kebutuhan:' : 'Quick Filter by Traveler Segment:'}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: 'domestik', label: { id: 'Open Trip & Domestik Hemat', en: 'Small Group & Value Trips' } },
                      { id: 'honeymoon', label: { id: 'Honeymoon & Liburan Keluarga', en: 'Honeymoon & Family Private' } },
                      { id: 'internasional', label: { id: 'Pendakian Rinjani & WNA', en: 'Rinjani Trek & International' } },
                      { id: 'korporat', label: { id: 'Gathering Kantor & MICE', en: 'Corporate Retreat & MICE' } }
                    ].map((seg) => (
                      <a
                        key={seg.id}
                        href="#paket-wisata"
                        onClick={() => setSegmentFilter(seg.id)}
                        className="px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
                      >
                        {seg.label[lang]}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right 6 cols: High-Impact 16:9 / Full-Height Visual Carrier */}
            <div className="lg:col-span-6">
              <div className="relative h-full min-h-[340px] sm:min-h-[420px] rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                <img
                  src={HERO_IMAGE}
                  alt={
                    lang === 'id'
                      ? 'Panorama udara Pantai Tanjung Aan dan Bukit Merese Kuta Mandalika Lombok'
                      : 'Aerial view of Tanjung Aan and Merese Hill in Kuta Mandalika, Lombok'
                  }
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />

                <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
                  <div className="space-y-1">
                    <div className="text-xs text-teal-300 font-mono-num">
                      8.9069° S, 116.3208° E · Lombok Tengah
                    </div>
                    <div className="text-base font-semibold">
                      {lang === 'id'
                        ? 'Teluk Kembar Tanjung Aan & Bukit Merese, Kuta Mandalika'
                        : 'Twin Turquoise Bays of Tanjung Aan & Merese Hill, Mandalika'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPackage(TOUR_PACKAGES[1])}
                    className="px-3.5 py-2 bg-white/95 hover:bg-white text-slate-900 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {lang === 'id' ? 'Lihat Itinerary Mandalika 3H2M →' : 'View Mandalika 3D2N Itinerary →'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width 4-Column Quantitative Proof & Direct Booking Strip below Hero */}
          <div className="mt-10 pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-2xl font-bold font-mono-num text-slate-900">0% Markup OTA</div>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                {lang === 'id'
                  ? 'Hemat Rp 170.000–Rp 900.000 per orang dibanding memesan paket serupa lewat aplikasi pihak ketiga.'
                  : 'Save 18–25% per guest compared to booking identical tours on third-party travel marketplaces.'}
              </p>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono-num text-slate-900">Dermaga Privat</div>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                {lang === 'id'
                  ? 'Keberangkatan snorkeling 3 Gili dari Teluk Nara yang tenang tanpa antre panjang di pelabuhan umum.'
                  : 'Depart for the 3 Gilis from calm Teluk Nara private jetty, avoiding crowded public harbor queues.'}
              </p>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono-num text-slate-900">100% Kuota Resmi</div>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                {lang === 'id'
                  ? 'Terdaftar sebagai Trekking Organizer resmi Taman Nasional Gunung Rinjani (e-Rinjani TNGR) & ASITA.'
                  : 'Licensed Mount Rinjani National Park (e-Rinjani TNGR) & ASITA NTB tour operator.'}
              </p>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono-num text-slate-900">Cloud Firestore</div>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                {lang === 'id'
                  ? 'Setiap reservasi paket, transfer bandara, dan inkuiri tersimpan otomatis di database Firebase terenkripsi.'
                  : 'All tour bookings, airport transfers, and custom inquiries persist in real-time Cloud Firestore.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="songket-divider" />

      {/* SECTION 2: INTERACTIVE PACKAGE EXPLORER & FILTERING */}
      <section id="paket-wisata" className="py-16 lg:py-20 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="text-xs font-medium text-teal-800 mb-1">
              {lang === 'id' ? 'Katalog Paket Wisata Lombok 2026' : '2026 Curated Lombok Tour Packages'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight text-balance">
              {lang === 'id'
                ? 'Pilih Paket Sesuai Destinasi, Durasi & Anggaran Anda'
                : 'Filter Packages by Destination, Duration & Travel Style'}
            </h2>
          </div>
          <p className="text-sm text-slate-600 max-w-md">
            {lang === 'id'
              ? 'Klik pada paket untuk melihat rincian jadwal harian (itinerary), fasilitas inklusi, FAQ, dan menyimpan reservasi ke database.'
              : 'Select any package to inspect the full day-by-day schedule, inclusions, FAQs, and save your booking directly to Firestore.'}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="md:col-span-4 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  lang === 'id'
                    ? 'Cari "Gili Meno", "Rinjani", "Mandalika"...'
                    : 'Search "Gili Meno", "Rinjani", "Pink Beach"...'
                }
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-teal-700"
              />
            </div>

            {/* Destination Filter Tabs */}
            <div className="md:col-span-8 flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {[
                { id: 'all', label: { id: 'Semua Destinasi', en: 'All Destinations' } },
                { id: 'gili', label: { id: '3 Gili (Trawangan/Meno/Air)', en: '3 Gili Islands' } },
                { id: 'mandalika', label: { id: 'Kuta Mandalika', en: 'Kuta Mandalika' } },
                { id: 'rinjani', label: { id: 'Gunung Rinjani', en: 'Mount Rinjani' } },
                { id: 'pink-beach', label: { id: 'Pink Beach', en: 'Pink Beach' } },
                { id: 'culture', label: { id: 'Desa Sade & Air Terjun', en: 'Sasak & Waterfalls' } },
                { id: 'mice', label: { id: 'Korporat & MICE', en: 'Corporate MICE' } }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRegionFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    regionFilter === tab.id
                      ? 'bg-teal-800 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label[lang]}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Filter Row: Segment & Duration */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-500 font-medium">
                {lang === 'id' ? 'Segmen:' : 'Segment:'}
              </span>
              {[
                { id: 'all', label: { id: 'Semua', en: 'All' } },
                { id: 'domestik', label: { id: 'Domestik / Open Trip', en: 'Value / Day Tours' } },
                { id: 'honeymoon', label: { id: 'Honeymoon & Keluarga', en: 'Couples & Family' } },
                { id: 'internasional', label: { id: 'Trekking & Mancanegara', en: 'Adventure & Intl' } },
                { id: 'korporat', label: { id: 'Rombongan Kantor (20+ Pax)', en: 'Corporate Groups (20+)' } }
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSegmentFilter(s.id)}
                  className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    segmentFilter === s.id
                      ? 'bg-slate-900 text-white font-medium'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {s.label[lang]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">
                {lang === 'id' ? 'Durasi:' : 'Duration:'}
              </span>
              {[
                { id: 'all', label: { id: 'Semua Durasi', en: 'Any Duration' } },
                { id: '1d', label: { id: 'Tur 1 Hari', en: 'Full-Day (1D)' } },
                { id: 'multi', label: { id: 'Menginap (3H2M–4H3M)', en: 'Multi-Day (3D–4D)' } }
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDurationFilter(d.id as 'all' | '1d' | 'multi')}
                  className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    durationFilter === d.id
                      ? 'bg-slate-900 text-white font-medium'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {d.label[lang]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Package Cards Grid (Zero-Pill Metadata Discipline) */}
        {filteredPackages.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
            <div className="text-base font-semibold text-slate-900">
              {lang === 'id'
                ? 'Tidak ada paket yang cocok dengan filter pencarian Anda.'
                : 'No tour packages match your current filter selection.'}
            </div>
            <p className="text-xs text-slate-600">
              {lang === 'id'
                ? 'Silakan reset filter atau hubungi konsultan perjalanan kami untuk menyusun itinerary custom.'
                : 'Reset the filters below or request a tailor-made Lombok itinerary.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setRegionFilter('all');
                setSegmentFilter('all');
                setDurationFilter('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-teal-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              {lang === 'id' ? 'Reset Semua Filter' : 'Reset All Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <article
                key={pkg.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  {/* 4:3 Aspect Ratio Image */}
                  <div
                    onClick={() => setSelectedPackage(pkg)}
                    className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={pkg.image}
                      alt={pkg.title[lang]}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-200"
                    />
                  </div>

                  {/* Card Body with Unboxed Metadata */}
                  <div className="p-5 space-y-3">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                      <span className="font-medium text-teal-800">{pkg.regionLabel[lang]}</span>
                      <span aria-hidden="true">·</span>
                      <span>{pkg.segmentLabel[lang]}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-num">★ {pkg.rating} ({pkg.reviewCount})</span>
                    </div>

                    <h3
                      onClick={() => setSelectedPackage(pkg)}
                      className="text-lg font-semibold text-slate-900 leading-snug hover:text-teal-800 cursor-pointer transition-colors"
                    >
                      {pkg.title[lang]}
                    </h3>

                    <p className="text-xs text-slate-500">
                      {pkg.durationLabel[lang]} · Min. {pkg.minPax} {lang === 'id' ? 'peserta' : 'guests'}
                    </p>

                    <ul className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      {pkg.highlights[lang].slice(0, 3).map((hl, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Footer: Price Comparison & Action */}
                <div className="px-5 py-4 bg-slate-50/70 border-t border-slate-200/80 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <span>{lang === 'id' ? 'Harga Langsung' : 'Direct Rate'}</span>
                      <span className="line-through font-mono-num text-slate-400">
                        {formatMoney(pkg.otaPriceIdr, pkg.otaPriceUsd)}
                      </span>
                    </div>
                    <div className="text-lg font-bold font-mono-num text-slate-900">
                      {formatMoney(pkg.priceIdr, pkg.priceUsd)}
                      <span className="text-xs font-normal text-slate-500">
                        /{lang === 'id' ? 'org' : 'pax'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedPackage(pkg)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>{lang === 'id' ? 'Detail & Booking' : 'Details & Book'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 3: CORE CAPABILITIES, LOP AIRPORT TRANSFER CALCULATOR & FAST BOAT DESK */}
      <section id="layanan" className="py-16 lg:py-20 bg-white border-y border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="max-w-3xl space-y-2">
            <div className="text-xs font-medium text-teal-800">
              {lang === 'id'
                ? 'Layanan Transportasi, Penyeberangan & Logistik Pulau Lombok'
                : 'Island-Wide Transport, Fast Boat & MICE Logistics'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight text-balance">
              {lang === 'id'
                ? 'Satu Pintu untuk Transfer Bandara LOP, Sewa Mobil & Fast Boat Gili'
                : 'One Reliable Local Desk for Airport Transfers, Car Charter & Fast Boats'}
            </h2>
          </div>

          {/* 4 Editorial Numbered Capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 border border-slate-200 rounded-xl bg-[#F8FAFC] space-y-2">
              <div className="text-xs font-mono-num font-semibold text-teal-800">
                01. {lang === 'id' ? 'Transfer Bandara LOP' : 'LOP Airport Transfers'}
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                {lang === 'id'
                  ? 'Penjemputan Papan Nama Tanpa Biaya Tunggu Delay'
                  : 'Meet & Greet Pickup with Flight Delay Tracking'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === 'id'
                  ? 'Sopir kami memantau nomor penerbangan Anda secara real-time di Bandara Internasional Zainuddin Abdul Madjid (LOP) menuju Senggigi, Mandalika, atau Pelabuhan Bangsal.'
                  : 'Our drivers track your flight arrival at Lombok International Airport (LOP) and wait at the arrival gate with a signboard—zero extra charge for flight delays.'}
              </p>
            </div>

            <div className="p-5 border border-slate-200 rounded-xl bg-[#F8FAFC] space-y-2">
              <div className="text-xs font-mono-num font-semibold text-teal-800">
                02. {lang === 'id' ? 'Sewa Kendaraan Privat' : 'Private Chauffeur Fleet'}
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                {lang === 'id'
                  ? 'Innova Zenix, Avanza & HiAce Premio Tahun Terbaru'
                  : 'Late-Model Innova Zenix, Avanza & HiAce Premio'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === 'id'
                  ? 'Harga sewa 12 jam sudah termasuk pengemudi lokal sekaligus pemandu fotografi, bahan bakar (BBM), dan parkir kawasan wisata.'
                  : 'All-inclusive 12-hour island charter rates covering fuel, English/Indonesian speaking driver-guide, and parking fees.'}
              </p>
            </div>

            <div className="p-5 border border-slate-200 rounded-xl bg-[#F8FAFC] space-y-2">
              <div className="text-xs font-mono-num font-semibold text-teal-800">
                03. {lang === 'id' ? 'Fast Boat & Speedboat' : 'Fast Boat & Speedboat'}
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                {lang === 'id'
                  ? 'Tiket Resmi Bali – 3 Gili & Speedboat Teluk Nara'
                  : 'Bali – Gili Fast Ferry & Private Speedboat Transfer'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === 'id'
                  ? 'Mitra resmi Eka Jaya, BlueWater Express, dan Wijaya Perkasa dari Padang Bai/Serangan Bali, serta charter speedboat 12 menit dari Teluk Nara.'
                  : 'Authorized ticketing desk for Eka Jaya and BlueWater Express from Bali, plus on-demand 12-minute private speedboats from Teluk Nara.'}
              </p>
            </div>

            <div className="p-5 border border-slate-200 rounded-xl bg-[#F8FAFC] space-y-2">
              <div className="text-xs font-mono-num font-semibold text-teal-800">
                04. {lang === 'id' ? 'Korporat & MICE' : 'Corporate MICE & Events'}
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                {lang === 'id'
                  ? 'Gathering Instansi, Outbound Pantai & Gala Dinner'
                  : 'Incentive Retreats, Beach Outbound & Gala Dinners'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === 'id'
                  ? 'Pengalaman menangani 20 hingga 150 peserta BUMN dan korporasi swasta lengkap dengan e-Faktur Pajak PKP dan dokumentasi drone.'
                  : 'End-to-end event management for 20 to 150 delegates with ballroom setup, beachfront seafood BBQ galas, and full tax invoicing.'}
              </p>
            </div>
          </div>

          {/* Interactive Bento Split: Left 7 cols Airport Transfer Calculator | Right 5 cols Fast Boat Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 cols: Interactive Airport Transfer & Car Rental Calculator */}
            <div className="lg:col-span-7 border border-slate-200 rounded-xl p-6 bg-[#F8FAFC] space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {lang === 'id'
                      ? 'Kalkulator Tarif Transfer Bandara LOP & Charter Mobil'
                      : 'Instant LOP Airport Transfer & Car Charter Calculator'}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {lang === 'id'
                      ? 'Harga per kendaraan (bukan per orang) · Sudah termasuk Sopir, BBM & Parkir Bandara'
                      : 'Price per private vehicle (not per person) · Includes Driver, Fuel & Airport Parking'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleBookTransfer} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {lang === 'id' ? 'Pilih Rute Perjalanan / Durasi Sewa:' : 'Select Route or Charter Duration:'}
                  </label>
                  <select
                    value={selectedRouteId}
                    onChange={(e) => {
                      setSelectedRouteId(e.target.value);
                      setTransferBookedMsg('');
                    }}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                  >
                    {TRANSFER_ROUTES.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.destination[lang]} ({route.distanceKm} km · ~{route.durationMin} min)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vehicle Type Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {lang === 'id' ? 'Pilih Jenis Kendaraan Privat:' : 'Select Private Vehicle Class:'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      {
                        id: 'avanza',
                        name: 'Toyota Avanza',
                        cap: '1–4 Pax + Bagasi',
                        idr: currentTransferRoute.avanzaIdr,
                        usd: currentTransferRoute.avanzaUsd
                      },
                      {
                        id: 'innova',
                        name: 'Innova Zenix',
                        cap: '1–6 Pax · Captain Seat',
                        idr: currentTransferRoute.innovaIdr,
                        usd: currentTransferRoute.innovaUsd
                      },
                      {
                        id: 'hiace',
                        name: 'HiAce Premio',
                        cap: '7–14 Pax · Rombongan',
                        idr: currentTransferRoute.hiaceIdr,
                        usd: currentTransferRoute.hiaceUsd
                      }
                    ].map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setVehicleType(v.id as 'avanza' | 'innova' | 'hiace');
                          setTransferBookedMsg('');
                        }}
                        className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                          vehicleType === v.id
                            ? 'border-teal-700 bg-white ring-1 ring-teal-700'
                            : 'border-slate-200 bg-white/70 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-semibold text-slate-900">{v.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{v.cap}</div>
                        <div className="text-sm font-bold font-mono-num text-teal-800 mt-2">
                          {formatMoney(v.idr, v.usd)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {lang === 'id' ? 'Tanggal Penjemputan' : 'Pickup Date'}
                    </label>
                    <input
                      type="date"
                      value={transferDate}
                      onChange={(e) => setTransferDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono-num"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {lang === 'id' ? 'Kode Penerbangan / Jam Tiba' : 'Flight Number / Arrival Time'}
                    </label>
                    <input
                      type="text"
                      maxLength={60}
                      value={flightCode}
                      onChange={(e) => setFlightCode(e.target.value)}
                      placeholder={lang === 'id' ? 'Contoh: Citilink QG-640 (13:20)' : 'e.g. Scoot TR-260 (10:45)'}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-slate-500">
                      {lang === 'id' ? 'Tarif Resmi per Mobil (1x Jalan / Sesuai Rute)' : 'Direct Net Price per Vehicle'}
                    </div>
                    <div className="flex items-baseline gap-2.5 mt-0.5">
                      <span className="text-2xl font-bold font-mono-num text-slate-900">
                        {formatMoney(transferPriceObj.idr, transferPriceObj.usd)}
                      </span>
                      <span className="text-xs font-mono-num text-slate-400 line-through">
                        OTA: {formatMoney(transferOtaIdr, transferOtaUsd)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {user
                      ? lang === 'id'
                        ? 'Simpan Penjemputan ke Database'
                        : 'Save Transfer to Cloud DB'
                      : lang === 'id'
                      ? 'Pesan Penjemputan Ini'
                      : 'Book Airport Transfer'}
                  </button>
                </div>

                {transferBookedMsg && (
                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg space-y-2 text-xs text-teal-950">
                    <p className="font-medium">
                      {transferSavedToDb
                        ? lang === 'id'
                          ? 'Tersimpan di koleksi /transfers Cloud Firestore! '
                          : 'Saved to /transfers in Cloud Firestore! '
                        : ''}
                      {transferBookedMsg}
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      <a
                        href={`https://wa.me/6281907882410?text=${encodeURIComponent(transferBookedMsg)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-semibold text-teal-800 underline"
                      >
                        <span>{lang === 'id' ? 'Lanjutkan Konfirmasi ke WhatsApp →' : 'Confirm via WhatsApp →'}</span>
                      </a>
                      {transferSavedToDb && (
                        <button
                          type="button"
                          onClick={() => setIsReservationsOpen(true)}
                          className="inline-flex items-center gap-1 font-semibold text-slate-900 underline cursor-pointer"
                        >
                          <span>{lang === 'id' ? 'Lihat di Database Reservasi' : 'View in Cloud DB'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Right 5 cols: Fast Boat Bali - Gili - Lombok Schedule */}
            <div className="lg:col-span-5 border border-slate-200 rounded-xl p-6 bg-white space-y-4">
              <div className="pb-3 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">
                  {lang === 'id'
                    ? 'Jadwal Fast Boat Bali ↔ 3 Gili ↔ Lombok'
                    : 'Daily Fast Boat Schedule (Bali ↔ 3 Gilis ↔ Lombok)'}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {lang === 'id'
                    ? 'E-tiket resmi langsung terbit tanpa biaya admin tambahan.'
                    : 'Official instant e-ticket issuance with zero booking fees.'}
                </p>
              </div>

              <div className="divide-y divide-slate-200">
                {FAST_BOAT_SCHEDULES.map((fb) => (
                  <div key={fb.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900">{fb.operator}</span>
                      <span className="text-sm font-bold font-mono-num text-teal-800">
                        {formatMoney(fb.priceIdr, fb.priceUsd)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">{fb.route[lang]}</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono-num">
                      <span>{fb.departureTime} – {fb.arrivalTime}</span>
                      <span>{fb.baggageAllowance}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200">
                <a
                  href="#kontak"
                  onClick={() => {
                    setInquirySegment('Tiket Fast Boat / Speedboat Gili');
                  }}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>{lang === 'id' ? 'Cek Ketersediaan Kursi Fast Boat' : 'Check Fast Boat Seat Availability'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: PROOF OF IMPACT — ATTRIBUTABLE TESTIMONIALS & OFFICIAL LEGALITY */}
      <section id="ulasan" className="py-16 lg:py-20 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="text-xs font-medium text-teal-800 mb-1">
              {lang === 'id' ? 'Bukti Nyata & Kepercayaan Pelanggan' : 'Verified Guest Outcomes & Corporate Credentials'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight text-balance">
              {lang === 'id'
                ? 'Dipercaya Wisatawan Domestik, Mancanegara & Instansi Nasional'
                : 'Trusted by Domestic Families, International Trekkers & Corporate Teams'}
            </h2>
          </div>
          <div className="text-xs text-slate-600 font-mono-num">
            Google Business Profile: ★ 4.9/5 · TripAdvisor Certificate of Excellence
          </div>
        </div>

        {/* 3 Attributable Testimonials with Concrete Outcomes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((rev) => (
            <div
              key={rev.id}
              className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-teal-800">{rev.segment}</span>
                  <span aria-hidden="true">·</span>
                  <span>{rev.tripDate}</span>
                </div>

                <div className="text-xs font-mono-num font-semibold text-slate-900 bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-lg">
                  {rev.outcomeMetric[lang]}
                </div>

                <p className="text-sm text-slate-700 leading-relaxed">
                  &ldquo;{rev.quote[lang]}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="text-sm font-semibold text-slate-900">{rev.author}</div>
                <div className="text-xs text-slate-500">
                  {rev.role[lang]} · {rev.organizationOrCity}
                </div>
                <div className="text-[11px] text-teal-800 mt-1">
                  {rev.packageTaken[lang]}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tentang Kami: Legalitas, Sertifikasi & Jaminan Keamanan */}
        <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="text-xs text-teal-300 font-medium">
              {lang === 'id' ? 'Tentang Kami & Legalitas Resmi' : 'About Us & Official Licensing'}
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-balance">
              PT Lombok Nusantara Wisata — Berbasis Langsung di Senggigi & Kuta Mandalika
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {lang === 'id'
                ? 'Berbeda dengan broker online di luar pulau, seluruh operasional kapal, kendaraan, dan kru pendakian Gunung Rinjani dikelola langsung oleh tim internal kami di Lombok Barat dan Lombok Tengah. Setiap transaksi dijamin dengan e-Invoice resmi atas nama badan hukum perseroan.'
                : 'Unlike off-island online brokers, all vehicles, private boats, and Mount Rinjani mountain crews are operated directly from our offices in West and Central Lombok. Every booking is backed by an official corporate invoice.'}
            </p>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-800/90 border border-slate-700 rounded-lg space-y-1">
              <div className="text-slate-400">{lang === 'id' ? 'Izin Usaha (NIB)' : 'Business License'}</div>
              <div className="font-mono-num font-semibold text-white">0220109482714</div>
              <div className="text-[11px] text-teal-300">KBLI 79121 Biro Wisata</div>
            </div>
            <div className="p-3.5 bg-slate-800/90 border border-slate-700 rounded-lg space-y-1">
              <div className="text-slate-400">{lang === 'id' ? 'Asosiasi & Pemandu' : 'Associations'}</div>
              <div className="font-mono-num font-semibold text-white">ASITA & HPI NTB</div>
              <div className="text-[11px] text-teal-300">Pemandu Bersertifikat</div>
            </div>
            <div className="p-3.5 bg-slate-800/90 border border-slate-700 rounded-lg space-y-1">
              <div className="text-slate-400">{lang === 'id' ? 'Lisensi Gunung' : 'Rinjani License'}</div>
              <div className="font-mono-num font-semibold text-white">TO-TNGR Resmi</div>
              <div className="text-[11px] text-teal-300">Kuota e-Rinjani Terjamin</div>
            </div>
            <div className="p-3.5 bg-slate-800/90 border border-slate-700 rounded-lg space-y-1">
              <div className="text-slate-400">{lang === 'id' ? 'Rekening & Pajak' : 'Tax & Payment'}</div>
              <div className="font-mono-num font-semibold text-white">PKP (e-Faktur)</div>
              <div className="text-[11px] text-teal-300">Mandiri / BCA / Stripe</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: DESTINATION ZONING GUIDE & SEO BLOG HUB */}
      <section id="destinasi" className="py-16 lg:py-20 bg-white border-t border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="text-xs font-medium text-teal-800 mb-1">
                {lang === 'id' ? 'Peta Wilayah & Artikel Panduan Perjalanan' : 'Regional Zoning Map & Travel Guides'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight text-balance">
                {lang === 'id'
                  ? 'Panduan Destinasi Lombok & Tips Merancang Itinerary'
                  : 'Lombok Destination Zoning & Practical Planning Guides'}
              </h2>
            </div>
          </div>

          {/* Interactive 4-Zone Lombok Explorer */}
          <div className="border border-slate-200 rounded-xl p-6 bg-[#F8FAFC] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 space-y-2">
              <div className="text-xs font-semibold text-slate-700 mb-2">
                {lang === 'id' ? 'Pilih Zona Geografis Pulau Lombok:' : 'Select Lombok Geographic Zone:'}
              </div>
              {(
                [
                  { id: 'south', label: { id: '01. Lombok Selatan (Kuta Mandalika & Sade)', en: '01. South Lombok (Mandalika & Sade)' } },
                  { id: 'north', label: { id: '02. Lombok Utara (3 Gili & Gunung Rinjani)', en: '02. North Lombok (3 Gilis & Rinjani)' } },
                  { id: 'east', label: { id: '03. Lombok Timur (Pink Beach & Pulau Pasir)', en: '03. East Lombok (Pink Beach & Sandbar)' } },
                  { id: 'west', label: { id: '04. Lombok Barat & Tengah (Senggigi & Air Terjun)', en: '04. West & Central (Senggigi & Waterfalls)' } }
                ] as const
              ).map((z) => (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => setActiveZone(z.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    activeZone === z.id
                      ? 'bg-teal-800 text-white border-teal-800'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {z.label[lang]}
                </button>
              ))}
            </div>

            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="text-xs font-mono-num text-teal-800">
                {activeZoneObj.transit[lang]}
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                {activeZoneObj.name[lang]}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {activeZoneObj.character[lang]}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const found = TOUR_PACKAGES.find((p) => p.id === activeZoneObj.recommendedPkgId);
                    if (found) setSelectedPackage(found);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {lang === 'id' ? 'Buka Paket Unggulan Zona Ini →' : 'View Featured Package for This Zone →'}
                </button>
              </div>
            </div>
          </div>

          {/* 3 SEO Blog Guides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DESTINATION_GUIDES.map((guide) => (
              <article
                key={guide.id}
                onClick={() => setSelectedGuide(guide)}
                className="bg-[#F8FAFC] border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors cursor-pointer group"
              >
                <div>
                  <div className="aspect-16/10 w-full bg-slate-200 overflow-hidden">
                    <img
                      src={guide.image}
                      alt={guide.title[lang]}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-200"
                    />
                  </div>
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="text-teal-800 font-medium">{guide.category[lang]}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-num">{guide.readTimeMin} min read</span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 group-hover:text-teal-800 transition-colors leading-snug">
                      {guide.title[lang]}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {guide.summary[lang]}
                    </p>
                  </div>
                </div>
                <div className="px-5 py-3.5 border-t border-slate-200/80 flex items-center justify-between text-xs font-semibold text-teal-800">
                  <span>{lang === 'id' ? 'Baca Panduan Lengkap' : 'Read Full Guide'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: DIRECT INQUIRY FORM, LOCATION & SUPPORTING LEGAL PAGES */}
      <section id="kontak" className="py-16 lg:py-20 bg-[#F8FAFC] border-t border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left 6 cols: Direct Custom Itinerary / Inquiry Form */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5">
              <div>
                <div className="text-xs font-medium text-teal-800 mb-1">
                  {lang === 'id' ? 'Konsultasi & Penawaran Custom Gratis' : 'Free Custom Itinerary & Direct Quote'}
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                  {lang === 'id'
                    ? 'Susun Rencana Perjalanan Lombok Anda'
                    : 'Request a Custom Lombok Proposal'}
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  {lang === 'id'
                    ? 'Tim konsultan lokal kami di Senggigi merespons setiap permintaan dalam waktu kurang dari 15 menit pada jam operasional.'
                    : 'Our local desk in Senggigi responds to all custom inquiries within 15 minutes with a transparent breakdown.'}
                </p>
              </div>

              {!inquirySubmitted ? (
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        {lang === 'id' ? 'Nama Lengkap' : 'Full Name'}
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        placeholder={lang === 'id' ? 'Nama Anda / Instansi' : 'Your Name / Company'}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-teal-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        {lang === 'id' ? 'Nomor WhatsApp / Email' : 'WhatsApp or Email'}
                      </label>
                      <input
                        type="text"
                        maxLength={120}
                        value={inquiryEmailOrWa}
                        onChange={(e) => setInquiryEmailOrWa(e.target.value)}
                        placeholder="+62 812-xxxx / email@domain.com"
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-teal-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        {lang === 'id' ? 'Kategori Perjalanan' : 'Trip Category'}
                      </label>
                      <select
                        value={inquirySegment}
                        onChange={(e) => setInquirySegment(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-teal-700"
                      >
                        <option value="Keluarga / Privat">
                          {lang === 'id' ? 'Liburan Keluarga / Tur Privat' : 'Family / Private Tour'}
                        </option>
                        <option value="Honeymoon Romantis">
                          {lang === 'id' ? 'Paket Honeymoon Pasangan' : 'Honeymoon Package'}
                        </option>
                        <option value="Open Trip / Snorkeling 3 Gili">
                          {lang === 'id' ? 'Snorkeling 3 Gili / Pink Beach' : '3 Gili / Pink Beach Charter'}
                        </option>
                        <option value="Ekspedisi Gunung Rinjani">
                          {lang === 'id' ? 'Pendakian Gunung Rinjani' : 'Mount Rinjani Trekking'}
                        </option>
                        <option value="Gathering Korporat / MICE">
                          {lang === 'id' ? 'Gathering Kantor / MICE (20+ Pax)' : 'Corporate MICE Group (20+ Pax)'}
                        </option>
                        <option value="Tiket Fast Boat / Speedboat Gili">
                          {lang === 'id' ? 'Tiket Fast Boat / Transfer Bandara' : 'Fast Boat / Airport Transfer'}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        {lang === 'id' ? 'Perkiraan Jumlah Peserta' : 'Estimated Group Size'}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={inquiryPax}
                        onChange={(e) => setInquiryPax(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg font-mono-num focus:bg-white focus:outline-none focus:border-teal-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {lang === 'id'
                        ? 'Destinasi yang Diinginkan / Tanggal Rencana Keberangkatan'
                        : 'Preferred Dates, Destinations or Special Requests'}
                    </label>
                    <textarea
                      rows={3}
                      maxLength={500}
                      value={inquiryNotes}
                      onChange={(e) => setInquiryNotes(e.target.value)}
                      placeholder={
                        lang === 'id'
                          ? 'Contoh: Rencana 4 orang bulan November, ingin gabungan Gili Trawangan dan Kuta Mandalika...'
                          : 'e.g. 4 adults arriving Nov 14, looking for 3 nights in Mandalika + private boat to Gili Meno...'
                      }
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-teal-700"
                    />
                  </div>

                  {inquiryError && (
                    <div className="p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg">
                      {inquiryError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-teal-800 hover:bg-teal-900 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    {user
                      ? lang === 'id'
                        ? 'Simpan Inkuiri ke Database & Minta Penawaran'
                        : 'Save Inquiry to Cloud DB & Request Proposal'
                      : lang === 'id'
                      ? 'Kirim Permintaan Itinerary & Penawaran'
                      : 'Request Direct Proposal'}
                  </button>
                </form>
              ) : (
                <div className="p-5 bg-teal-50 border border-teal-200 rounded-xl space-y-4">
                  <div className="text-base font-semibold text-teal-950">
                    {lang === 'id'
                      ? `Terima kasih, ${inquiryName}! Permintaan Anda telah tercatat.`
                      : `Thank you, ${inquiryName}! Your inquiry has been logged.`}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {inquirySavedToDb
                      ? lang === 'id'
                        ? 'Data permintaan Anda telah disimpan secara aman di koleksi /inquiries Cloud Firestore.'
                        : 'Your custom request has been stored in your /inquiries Cloud Firestore collection.'
                      : lang === 'id'
                      ? `Konsultan perjalanan kami akan mengirimkan draf itinerary beserta rincian biaya (${inquirySegment} untuk ${inquiryPax} peserta) ke ${inquiryEmailOrWa}.`
                      : `Our local travel specialist will send a customized proposal (${inquirySegment} for ${inquiryPax} guests) to ${inquiryEmailOrWa}.`}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={`https://wa.me/6281907882410?text=${encodeURIComponent(
                        `Halo LOMBOK NUSANTARA TRAVEL, saya ${inquiryName} (${inquiryEmailOrWa}) ingin konsultasi paket ${inquirySegment} untuk ${inquiryPax} orang. Catatan: ${inquiryNotes}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-teal-800 text-white text-xs font-semibold rounded-lg"
                    >
                      {lang === 'id' ? 'Buka Chat WhatsApp Sekarang →' : 'Open WhatsApp Chat Now →'}
                    </a>
                    {inquirySavedToDb && (
                      <button
                        type="button"
                        onClick={() => setIsReservationsOpen(true)}
                        className="text-xs font-semibold text-teal-900 underline cursor-pointer"
                      >
                        {lang === 'id' ? 'Lihat di Database Reservasi' : 'View in Cloud DB'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setInquirySubmitted(false);
                        setInquirySavedToDb(false);
                      }}
                      className="text-xs text-slate-600 underline cursor-pointer"
                    >
                      {lang === 'id' ? 'Kirim permintaan lain' : 'Submit another inquiry'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right 6 cols: Office Address, Direct Contact & Supporting Legal Pages */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h3 className="text-base font-semibold text-slate-900">
                  {lang === 'id'
                    ? 'Kantor Operasional & Layanan Pelanggan 24/7'
                    : 'Lombok Operations Office & 24/7 Guest Support'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900">Kantor Utama (Senggigi)</div>
                    <p>Jl. Raya Senggigi KM 8, Batu Layar, Kab. Lombok Barat, NTB 83355</p>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900">Desk Bandara LOP & Mandalika</div>
                    <p>Jl. Bypass BIL – Kuta Mandalika, Pujut, Kab. Lombok Tengah, NTB</p>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900">WhatsApp & Hotline Resmi</div>
                    <p className="font-mono-num text-teal-800 font-medium">+62 819-0788-2410</p>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900">Email Reservasi & Korporat</div>
                    <p className="font-mono-num">booking@lomboknusantara.id</p>
                  </div>
                </div>
              </div>

              {/* Halaman Pendukung: Syarat & Ketentuan, Kebijakan Refund, Kebijakan Privasi */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-semibold text-slate-900">
                    {lang === 'id' ? 'Kebijakan & Ketentuan Layanan Resmi' : 'Official Policies & Terms'}
                  </span>
                  <div className="flex items-center gap-1">
                    {[
                      { id: 'terms', label: { id: 'Syarat & Ketentuan', en: 'Booking Terms' } },
                      { id: 'refund', label: { id: 'Kebijakan Refund', en: 'Refund Policy' } },
                      { id: 'privacy', label: { id: 'Privasi Data', en: 'Privacy Policy' } }
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveLegalTab(t.id as 'terms' | 'refund' | 'privacy')}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                          activeLegalTab === t.id
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {t.label[lang]}
                      </button>
                    ))}
                  </div>
                </div>

                {activeLegalTab === 'terms' && (
                  <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                    <p>
                      <strong>1. Konfirmasi & Deposit:</strong> Reservasi paket tur harian/privat cukup menggunakan uang muka (down payment) 30% melalui rekening resmi PT Lombok Nusantara Wisata, dan pelunasan 70% dapat dilakukan saat penjemputan di Lombok.
                    </p>
                    <p>
                      <strong>2. Pendakian Rinjani:</strong> Khusus paket Gunung Rinjani, pembayaran tiket e-Rinjani TNGR bersifat mengikat sesuai nama dan nomor KTP/Paspor pendaki sejak tiket diterbitkan oleh Balai Taman Nasional.
                    </p>
                  </div>
                )}

                {activeLegalTab === 'refund' && (
                  <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                    <p>
                      <strong>1. Jaminan Cuaca & Force Majeure:</strong> Apabila Syahbandar menutup penyeberangan laut atau jalur TNGR ditutup karena cuaca ekstrem, peserta berhak atas penjadwalan ulang (reschedule) gratis atau pengembalian dana 100% untuk komponen yang belum terpakai.
                    </p>
                    <p>
                      <strong>2. Pembatalan Reguler:</strong> Pembatalan H-7 sebelum keberangkatan memperoleh pengembalian deposit 100% (dikurangi biaya tiket pihak ketiga yang sudah dicetak atas nama tamu).
                    </p>
                  </div>
                )}

                {activeLegalTab === 'privacy' && (
                  <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                    <p>
                      <strong>Perlindungan Data Tamu (UU PDP):</strong> Data identitas KTP/Paspor dan nomor kontak yang Anda kirimkan semata-mata digunakan untuk manifest asuransi penyeberangan laut, registrasi resmi e-Rinjani TNGR, dan reservasi kamar hotel. Kami tidak pernah membagikan data pelanggan ke pihak ketiga.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUIET FOOTER */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 py-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs">
          <div className="space-y-1">
            <div className="text-white font-display font-semibold text-base">
              LOMBOK NUSANTARA TRAVEL
            </div>
            <p>
              © 2026 PT Lombok Nusantara Wisata · Senggigi & Kuta Mandalika, Nusa Tenggara Barat.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <a href="#paket-wisata" className="hover:text-white transition-colors">
              {lang === 'id' ? 'Paket Wisata' : 'Packages'}
            </a>
            <a href="#layanan" className="hover:text-white transition-colors">
              {lang === 'id' ? 'Transfer Bandara LOP' : 'Airport Transfer'}
            </a>
            <button
              type="button"
              onClick={() => setIsReservationsOpen(true)}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {lang === 'id' ? 'Database & Reservasi' : 'Cloud Database'}
            </button>
            <button
              type="button"
              onClick={() => setIsBlueprintOpen(true)}
              className="text-teal-400 hover:text-teal-300 font-medium underline underline-offset-4 cursor-pointer"
            >
              {lang === 'id' ? 'Buka Dokumen Rencana & Anggaran (8 Minggu)' : 'Open 8-Week Website Plan & Budget'}
            </button>
          </div>
        </div>
      </footer>

      {/* COMPACT FLOATING WHATSAPP ACTION (Respects <15% Mobile Sticky Cap) */}
      <a
        href="https://wa.me/6281907882410?text=Halo%20LOMBOK%20NUSANTARA%20TRAVEL%2C%20saya%20ingin%20tanya%20paket%20wisata%20Lombok"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-40 px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-102"
        aria-label="Chat WhatsApp LOMBOK NUSANTARA TRAVEL"
      >
        <MessageCircle className="w-4 h-4" />
        <span>{lang === 'id' ? 'Chat Konsultan Lokal' : 'WhatsApp Local Desk'}</span>
      </a>

      {/* MODALS */}
      <PackageDetailModal
        pkg={selectedPackage}
        lang={lang}
        currency={currency}
        user={user}
        onClose={() => setSelectedPackage(null)}
        onOpenReservations={() => setIsReservationsOpen(true)}
      />

      <GuideModal
        guide={selectedGuide}
        lang={lang}
        onClose={() => setSelectedGuide(null)}
        onExplorePackages={() => {
          const el = document.getElementById('paket-wisata');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <BlueprintModal
        isOpen={isBlueprintOpen}
        onClose={() => setIsBlueprintOpen(false)}
        lang={lang}
      />

      <ReservationsModal
        isOpen={isReservationsOpen}
        onClose={() => setIsReservationsOpen(false)}
        user={user}
        authReady={authReady}
        lang={lang}
        currency={currency}
      />
    </div>
  );
}
