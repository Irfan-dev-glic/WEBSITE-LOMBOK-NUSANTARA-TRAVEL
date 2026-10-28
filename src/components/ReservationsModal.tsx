import React, { useEffect, useState } from 'react';
import { X, Database, LogIn, LogOut, CheckCircle2, XCircle, Clock, ShieldCheck } from 'lucide-react';
import { User } from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  db,
  signInWithGoogle,
  signOutUser,
  handleFirestoreError,
  OperationType
} from '../firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import { Language, Currency } from '../data/lombokData';

interface ReservationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  authReady: boolean;
  lang: Language;
  currency: Currency;
}

interface BookingDoc {
  id: string;
  ownerId: string;
  bookingRef: string;
  packageId: string;
  packageTitle: string;
  travelDate: string;
  pax: number;
  totalPriceIdr: number;
  totalPriceUsd: number;
  addOns: string;
  guestName: string;
  guestContact: string;
  pickupNotes: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

interface TransferDoc {
  id: string;
  ownerId: string;
  routeId: string;
  routeName: string;
  vehicleType: 'avanza' | 'innova' | 'hiace';
  pickupDate: string;
  flightCode: string;
  priceIdr: number;
  priceUsd: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

interface InquiryDoc {
  id: string;
  ownerId: string;
  guestName: string;
  contactInfo: string;
  segment: string;
  paxCount: number;
  notes: string;
  status: 'new' | 'replied' | 'closed';
}

export const ReservationsModal: React.FC<ReservationsModalProps> = ({
  isOpen,
  onClose,
  user,
  authReady,
  lang,
  currency
}) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'transfers' | 'inquiries' | 'config'>('bookings');
  const [bookings, setBookings] = useState<BookingDoc[]>([]);
  const [transfers, setTransfers] = useState<TransferDoc[]>([]);
  const [inquiries, setInquiries] = useState<InquiryDoc[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  const isAdmin = Boolean(
    user && user.emailVerified && user.email === 'muhammadhuasin9011@gmail.com'
  );

  useEffect(() => {
    if (!isOpen || !authReady || !user) {
      setBookings([]);
      setTransfers([]);
      setInquiries([]);
      return;
    }

    setLoadingData(true);

    const bookingsQuery = isAdmin
      ? collection(db, 'bookings')
      : query(collection(db, 'bookings'), where('ownerId', '==', user.uid));

    const transfersQuery = isAdmin
      ? collection(db, 'transfers')
      : query(collection(db, 'transfers'), where('ownerId', '==', user.uid));

    const inquiriesQuery = isAdmin
      ? collection(db, 'inquiries')
      : query(collection(db, 'inquiries'), where('ownerId', '==', user.uid));

    const unsubBookings = onSnapshot(
      bookingsQuery,
      (snap) => {
        const list: BookingDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<BookingDoc, 'id'>)
        }));
        setBookings(list);
        setLoadingData(false);
      },
      (err) => {
        setLoadingData(false);
        handleFirestoreError(err, OperationType.LIST, 'bookings');
      }
    );

    const unsubTransfers = onSnapshot(
      transfersQuery,
      (snap) => {
        const list: TransferDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<TransferDoc, 'id'>)
        }));
        setTransfers(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'transfers');
      }
    );

    const unsubInquiries = onSnapshot(
      inquiriesQuery,
      (snap) => {
        const list: InquiryDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<InquiryDoc, 'id'>)
        }));
        setInquiries(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'inquiries');
      }
    );

    return () => {
      unsubBookings();
      unsubTransfers();
      unsubInquiries();
    };
  }, [isOpen, authReady, user, isAdmin]);

  if (!isOpen) return null;

  const formatMoney = (idr: number, usd: number) =>
    currency === 'IDR' ? `Rp ${idr.toLocaleString('id-ID')}` : `$${usd.toLocaleString('en-US')}`;

  const handleLogin = async () => {
    setAuthError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Gagal masuk dengan Google.');
    }
  };

  const handleBookingStatusChange = async (
    bookingId: string,
    newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  ) => {
    const path = `bookings/${bookingId}`;
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleTransferStatusChange = async (
    transferId: string,
    newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  ) => {
    const path = `transfers/${transferId}`;
    try {
      await updateDoc(doc(db, 'transfers', transferId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleInquiryStatusChange = async (
    inquiryId: string,
    newStatus: 'new' | 'replied' | 'closed'
  ) => {
    const path = `inquiries/${inquiryId}`;
    try {
      await updateDoc(doc(db, 'inquiries', inquiryId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-teal-800" />
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                {lang === 'id'
                  ? 'Database Cloud & Manajemen Reservasi — LOMBOK NUSANTARA TRAVEL'
                  : 'Cloud Database & Reservation Console — LOMBOK NUSANTARA TRAVEL'}
              </h2>
              <p className="text-xs text-slate-500">
                Firebase Firestore · Project ID: <span className="font-mono-num">{firebaseConfig.projectId}</span>
                {isAdmin && ' · Mode Administrator Aktif'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Bar & Navigation Tabs */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'bookings' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'id' ? `Paket Wisata (${bookings.length})` : `Tour Bookings (${bookings.length})`}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('transfers')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'transfers' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'id' ? `Transfer LOP (${transfers.length})` : `Airport Transfers (${transfers.length})`}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('inquiries')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'inquiries' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'id' ? `Inkuiri Custom (${inquiries.length})` : `Custom Inquiries (${inquiries.length})`}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('config')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'config' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'id' ? 'Konfigurasi Database' : 'Database Config'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-600">
                  {user.displayName || user.email}
                  {isAdmin && <strong className="ml-1.5 text-teal-800">(Admin)</strong>}
                </span>
                <button
                  type="button"
                  onClick={() => signOutUser()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{lang === 'id' ? 'Keluar' : 'Sign Out'}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleLogin}
                className="px-3.5 py-1.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{lang === 'id' ? 'Masuk dengan Google' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg">
              {authError}
            </div>
          )}

          {activeTab === 'config' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-1.5">
                  <div className="text-xs text-slate-500">Firebase Project ID</div>
                  <div className="text-sm font-mono-num font-semibold text-slate-900">
                    {firebaseConfig.projectId}
                  </div>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-1.5">
                  <div className="text-xs text-slate-500">Firestore Database ID</div>
                  <div className="text-xs font-mono-num font-semibold text-teal-800 break-all">
                    {firebaseConfig.firestoreDatabaseId}
                  </div>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-1.5">
                  <div className="text-xs text-slate-500">Auth Domain</div>
                  <div className="text-xs font-mono-num text-slate-800">
                    {firebaseConfig.authDomain}
                  </div>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-1.5">
                  <div className="text-xs text-slate-500">Security Rules & Access Control</div>
                  <div className="text-xs text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                    <span>Zero-Trust ABAC · PII Isolation · Strict Key & Timestamp Validation</span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-800">
                  Skema Koleksi Firestore Aktif (`firebase-blueprint.json` & `firestore.rules`)
                </div>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 bg-white">
                      <th className="py-2.5 px-4 font-semibold">Path Koleksi</th>
                      <th className="py-2.5 px-4 font-semibold">Entitas</th>
                      <th className="py-2.5 px-4 font-semibold">Hak Akses Baca/Tulis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2.5 px-4 font-mono-num text-teal-800">/bookings/&#123;bookingId&#125;</td>
                      <td className="py-2.5 px-4 font-medium">Booking</td>
                      <td className="py-2.5 px-4 text-slate-600">Pemilik Reservasi (`ownerId == uid`) & Admin Terverifikasi</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-mono-num text-teal-800">/transfers/&#123;transferId&#125;</td>
                      <td className="py-2.5 px-4 font-medium">TransferReservation</td>
                      <td className="py-2.5 px-4 text-slate-600">Pemilik Reservasi (`ownerId == uid`) & Admin Terverifikasi</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-mono-num text-teal-800">/inquiries/&#123;inquiryId&#125;</td>
                      <td className="py-2.5 px-4 font-medium">CustomInquiry</td>
                      <td className="py-2.5 px-4 text-slate-600">Pemilik Inkuiri (`ownerId == uid`) & Admin Terverifikasi</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-mono-num text-teal-800">/admins/&#123;adminId&#125;</td>
                      <td className="py-2.5 px-4 font-medium">AdminRecord</td>
                      <td className="py-2.5 px-4 text-slate-600">Read-Only dari Klien; Write Ditutup (`allow write: if false`)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : !user ? (
            <div className="py-12 text-center space-y-4 border border-slate-200 rounded-xl bg-slate-50 p-6">
              <div className="text-base font-semibold text-slate-900">
                {lang === 'id'
                  ? 'Silakan Masuk dengan Google untuk Mengakses Database Reservasi'
                  : 'Sign In with Google to View & Manage Cloud Reservations'}
              </div>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                {lang === 'id'
                  ? 'Demi keamanan data pribadi (PII Isolation), seluruh pesanan paket wisata, transfer Bandara LOP, dan inkuiri custom dienkripsi dan diisolasi berdasarkan akun Google Anda.'
                  : 'To protect guest privacy (PII Isolation), tour bookings, airport transfers, and custom inquiries are strictly scoped to your verified Google account.'}
              </p>
              <button
                type="button"
                onClick={handleLogin}
                className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{lang === 'id' ? 'Masuk dengan Akun Google' : 'Sign in with Google'}</span>
              </button>
            </div>
          ) : loadingData ? (
            <div className="py-12 text-center text-xs text-slate-500">
              {lang === 'id' ? 'Memuat data dari Cloud Firestore...' : 'Loading records from Cloud Firestore...'}
            </div>
          ) : activeTab === 'bookings' ? (
            bookings.length === 0 ? (
              <div className="py-12 text-center border border-slate-200 rounded-xl bg-slate-50 p-6 space-y-2">
                <div className="text-sm font-semibold text-slate-900">
                  {lang === 'id' ? 'Belum ada reservasi paket wisata di database.' : 'No tour package bookings saved yet.'}
                </div>
                <p className="text-xs text-slate-600">
                  {lang === 'id'
                    ? 'Pilih salah satu paket wisata di katalog beranda untuk menyimpan reservasi ke Firestore.'
                    : 'Select any tour package on the main page to create a live Firestore booking.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((bk) => (
                  <div
                    key={bk.id}
                    className="p-4 border border-slate-200 rounded-lg bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono-num font-semibold text-teal-800">{bk.bookingRef}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-num">{bk.travelDate}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-num">{bk.pax} Pax</span>
                        <span aria-hidden="true">·</span>
                        <span className="uppercase font-mono-num font-semibold text-slate-800">
                          Status: {bk.status}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">{bk.packageTitle}</div>
                      <div className="text-xs text-slate-600">
                        {bk.guestName} ({bk.guestContact}) {bk.addOns ? `· Add-ons: ${bk.addOns}` : ''}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-bold font-mono-num text-slate-900">
                          {formatMoney(bk.totalPriceIdr, bk.totalPriceUsd)}
                        </div>
                      </div>

                      {isAdmin ? (
                        <select
                          value={bk.status}
                          onChange={(e) =>
                            handleBookingStatusChange(
                              bk.id,
                              e.target.value as 'pending' | 'confirmed' | 'completed' | 'cancelled'
                            )
                          }
                          className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-slate-50"
                        >
                          <option value="pending">pending</option>
                          <option value="confirmed">confirmed</option>
                          <option value="completed">completed</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      ) : (
                        bk.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleBookingStatusChange(bk.id, 'cancelled')}
                            className="px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 border border-red-200 rounded-md transition-colors cursor-pointer"
                          >
                            {lang === 'id' ? 'Batalkan' : 'Cancel'}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === 'transfers' ? (
            transfers.length === 0 ? (
              <div className="py-12 text-center border border-slate-200 rounded-xl bg-slate-50 p-6 space-y-2">
                <div className="text-sm font-semibold text-slate-900">
                  {lang === 'id' ? 'Belum ada reservasi transfer Bandara LOP.' : 'No airport transfer reservations found.'}
                </div>
                <p className="text-xs text-slate-600">
                  {lang === 'id'
                    ? 'Gunakan Kalkulator Tarif Transfer Bandara LOP di halaman utama untuk menyimpan jadwal jemputan.'
                    : 'Use the LOP Airport Transfer Calculator on the main page to book a vehicle.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transfers.map((tr) => (
                  <div
                    key={tr.id}
                    className="p-4 border border-slate-200 rounded-lg bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono-num">
                        <span className="text-teal-800 font-semibold uppercase">{tr.vehicleType}</span>
                        <span aria-hidden="true">·</span>
                        <span>{tr.pickupDate}</span>
                        <span aria-hidden="true">·</span>
                        <span>{tr.flightCode || 'Flight TBA'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="uppercase font-semibold text-slate-800">Status: {tr.status}</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">{tr.routeName}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold font-mono-num text-slate-900">
                        {formatMoney(tr.priceIdr, tr.priceUsd)}
                      </span>
                      {isAdmin ? (
                        <select
                          value={tr.status}
                          onChange={(e) =>
                            handleTransferStatusChange(
                              tr.id,
                              e.target.value as 'pending' | 'confirmed' | 'completed' | 'cancelled'
                            )
                          }
                          className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-slate-50"
                        >
                          <option value="pending">pending</option>
                          <option value="confirmed">confirmed</option>
                          <option value="completed">completed</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      ) : (
                        tr.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleTransferStatusChange(tr.id, 'cancelled')}
                            className="px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 border border-red-200 rounded-md transition-colors cursor-pointer"
                          >
                            {lang === 'id' ? 'Batalkan' : 'Cancel'}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : inquiries.length === 0 ? (
            <div className="py-12 text-center border border-slate-200 rounded-xl bg-slate-50 p-6 space-y-2">
              <div className="text-sm font-semibold text-slate-900">
                {lang === 'id' ? 'Belum ada inkuiri itinerary custom.' : 'No custom itinerary inquiries saved yet.'}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-4 border border-slate-200 rounded-lg bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-teal-800">{inq.segment}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-num">{inq.paxCount} Pax</span>
                      <span aria-hidden="true">·</span>
                      <span className="uppercase font-mono-num font-semibold text-slate-800">
                        Status: {inq.status}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {inq.guestName} ({inq.contactInfo})
                    </div>
                    <p className="text-xs text-slate-600">{inq.notes || '-'}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin ? (
                      <select
                        value={inq.status}
                        onChange={(e) =>
                          handleInquiryStatusChange(
                            inq.id,
                            e.target.value as 'new' | 'replied' | 'closed'
                          )
                        }
                        className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-slate-50"
                      >
                        <option value="new">new</option>
                        <option value="replied">replied</option>
                        <option value="closed">closed</option>
                      </select>
                    ) : (
                      inq.status !== 'closed' && (
                        <button
                          type="button"
                          onClick={() => handleInquiryStatusChange(inq.id, 'closed')}
                          className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-md transition-colors cursor-pointer"
                        >
                          {lang === 'id' ? 'Tandai Selesai' : 'Close Inquiry'}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
