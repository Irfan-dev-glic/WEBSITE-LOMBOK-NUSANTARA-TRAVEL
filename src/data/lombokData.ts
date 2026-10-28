export type Language = 'id' | 'en';
export type Currency = 'IDR' | 'USD';

export interface ItineraryDay {
  day: number;
  title: { id: string; en: string };
  schedule: { time: string; activity: { id: string; en: string } }[];
}

export interface TourPackage {
  id: string;
  slug: string;
  title: { id: string; en: string };
  subtitle: { id: string; en: string };
  region: 'gili' | 'mandalika' | 'rinjani' | 'pink-beach' | 'culture' | 'mice';
  regionLabel: { id: string; en: string };
  segment: 'domestik' | 'honeymoon' | 'internasional' | 'korporat';
  segmentLabel: { id: string; en: string };
  durationDays: number;
  durationLabel: { id: string; en: string };
  minPax: number;
  maxPax: number;
  priceIdr: number;
  otaPriceIdr: number;
  priceUsd: number;
  otaPriceUsd: number;
  rating: number;
  reviewCount: number;
  image: string;
  gallery: string[];
  highlights: { id: string[]; en: string[] };
  inclusions: { id: string[]; en: string[] };
  exclusions: { id: string[]; en: string[] };
  itinerary: ItineraryDay[];
  faqs: { q: { id: string; en: string }; a: { id: string; en: string } }[];
  seoKeywords: string[];
}

export interface TransferRoute {
  id: string;
  destination: { id: string; en: string };
  distanceKm: number;
  durationMin: number;
  avanzaIdr: number;
  avanzaUsd: number;
  innovaIdr: number;
  innovaUsd: number;
  hiaceIdr: number;
  hiaceUsd: number;
  otaMarkupPercent: number;
}

export interface FastBoatSchedule {
  id: string;
  operator: string;
  route: { id: string; en: string };
  departureTime: string;
  arrivalTime: string;
  priceIdr: number;
  priceUsd: number;
  baggageAllowance: string;
}

export interface DestinationGuide {
  id: string;
  slug: string;
  title: { id: string; en: string };
  category: { id: string; en: string };
  readTimeMin: number;
  publishDate: string;
  targetKeyword: string;
  monthlySearchVolume: string;
  image: string;
  summary: { id: string; en: string };
  bestSeason: { id: string; en: string };
  distanceFromAirport: string;
  contentSections: {
    heading: { id: string; en: string };
    body: { id: string; en: string };
  }[];
}

export interface Testimonial {
  id: string;
  author: string;
  role: { id: string; en: string };
  organizationOrCity: string;
  segment: 'Domestik' | 'Mancanegara' | 'Korporat';
  packageTaken: { id: string; en: string };
  tripDate: string;
  quote: { id: string; en: string };
  outcomeMetric: { id: string; en: string };
}

export const HERO_IMAGE = '/src/assets/images/hero_lombok_aerial_1793203523877.jpg';
export const IMG_GILI = '/src/assets/images/pkg_gili_islands_1793203524606.jpg';
export const IMG_RINJANI = '/src/assets/images/pkg_rinjani_summit_1793203525763.jpg';
export const IMG_PINK_BEACH = '/src/assets/images/pkg_pink_beach_1793203526986.jpg';
export const IMG_SADE = '/src/assets/images/pkg_sade_culture_1793203528492.jpg';

export const TOUR_PACKAGES: TourPackage[] = [
  {
    id: 'pkg-3gili-private',
    slug: 'snorkeling-3-gili-trawangan-meno-air',
    title: {
      id: 'Eksplorasi 3 Gili & Konservasi Penyu (Glass Bottom Boat)',
      en: '3 Gili Islands Private Snorkeling & Turtle Sanctuary Charter'
    },
    subtitle: {
      id: 'Gili Trawangan · Gili Meno · Gili Air via Pelabuhan Teluk Nara',
      en: 'Gili Trawangan · Gili Meno · Gili Air via Teluk Nara Private Jetty'
    },
    region: 'gili',
    regionLabel: { id: 'Kepulauan Gili', en: 'Gili Islands' },
    segment: 'domestik',
    segmentLabel: { id: 'Open Trip & Privat', en: 'Private & Small Group' },
    durationDays: 1,
    durationLabel: { id: '1 Hari Penuh (08.00–17.30)', en: 'Full Day (08:00–17:30)' },
    minPax: 2,
    maxPax: 12,
    priceIdr: 650000,
    otaPriceIdr: 820000,
    priceUsd: 45,
    otaPriceUsd: 58,
    rating: 4.9,
    reviewCount: 164,
    image: IMG_GILI,
    gallery: [IMG_GILI, HERO_IMAGE, IMG_PINK_BEACH],
    highlights: {
      id: [
        'Kapal Glass Bottom privat dari Teluk Nara tanpa antre di pelabuhan umum',
        'Snorkeling di patung bawah air Bask Nest Gili Meno & titik penyu hijau',
        'Dokumentasi kamera bawah air GoPro Hero 12 + pemandu selam tersertifikasi',
        'Singgah sunset di Bukit Malimbu & makan siang ikan bakar tepi pantai Gili Air'
      ],
      en: [
        'Private glass-bottom boat charter from Teluk Nara bypassing public harbor queues',
        'Guided snorkeling at Gili Meno underwater sculptures & green sea turtle point',
        'Underwater GoPro Hero 12 photo/video documentation with licensed local guide',
        'Sunset stop at Malimbu Cliff viewpoint & beachfront grilled seafood lunch on Gili Air'
      ]
    },
    inclusions: {
      id: [
        'Jemput & antar hotel area Senggigi, Mataram, atau Kuta Mandalika (AC Privat)',
        'Kapal Glass Bottom Privat (atau opsi Speedboat)',
        'Alat snorkeling steril (masker, snorkel, fin, pelampung)',
        'Dokumentasi foto & video bawah air GoPro (file langsung dikirim via Google Drive)',
        'Air mineral, kelapa muda di Gili Air, dan asuransi perjalanan lokal'
      ],
      en: [
        'Private AC hotel pickup & drop-off (Senggigi, Mataram, or Kuta Mandalika)',
        'Private Glass Bottom Boat charter (or Speedboat upgrade)',
        'Sanitized snorkeling gear (mask, snorkel, fins, life vest)',
        'GoPro underwater photo & video raw files delivered same-day',
        'Bottled water, fresh coconut on Gili Air, and local marine insurance'
      ]
    },
    exclusions: {
      id: [
        'Tiket pesawat menuju Lombok (LOP)',
        'Sewa sepeda atau cidomo di Gili Trawangan (opsional Rp 50.000)',
        'Pengeluaran pribadi & makan malam'
      ],
      en: [
        'Flights to Lombok International Airport (LOP)',
        'Bicycle or horse-cart rental on Gili Trawangan (optional USD 4)',
        'Personal expenses & alcoholic beverages'
      ]
    },
    itinerary: [
      {
        day: 1,
        title: {
          id: 'Penjemputan Hotel – Pelabuhan Teluk Nara – 3 Gili – Bukit Malimbu',
          en: 'Hotel Pickup – Teluk Nara Jetty – 3 Gili Snorkeling – Malimbu Sunset'
        },
        schedule: [
          {
            time: '08:00',
            activity: {
              id: 'Penjemputan di lobi hotel oleh sopir & pemandu Lombok Nusantara.',
              en: 'Pickup at hotel lobby by your dedicated Lombok Nusantara driver & guide.'
            }
          },
          {
            time: '09:15',
            activity: {
              id: 'Tiba di dermaga privat Teluk Nara, briefing keselamatan & fitting alat snorkeling.',
              en: 'Arrive at Teluk Nara private jetty, safety briefing & snorkeling gear fitting.'
            }
          },
          {
            time: '09:45',
            activity: {
              id: 'Spot 1: Gili Meno Statues (Bask Nest) & berenang bersama penyu hijau di Turtle Point.',
              en: 'Spot 1: Gili Meno underwater statues (Bask Nest) & swimming with green turtles.'
            }
          },
          {
            time: '12:15',
            activity: {
              id: 'Spot 2: Taman Karang Biru Gili Air & istirahat makan siang seafood di tepi pantai.',
              en: 'Spot 2: Gili Air Blue Coral Garden & beachfront grilled seafood lunch break.'
            }
          },
          {
            time: '14:30',
            activity: {
              id: 'Bersantai atau bersepeda keliling Gili Trawangan sebelum kembali ke Pulau Lombok.',
              en: 'Free island exploration or cycling around Gili Trawangan before crossing back.'
            }
          },
          {
            time: '17:00',
            activity: {
              id: 'Menikmati panorama matahari terbenam berlatar Gunung Agung Bali dari Bukit Malimbu.',
              en: 'Golden hour sunset stop overlooking Mount Agung Bali from Malimbu Coastal Cliff.'
            }
          }
        ]
      }
    ],
    faqs: [
      {
        q: {
          id: 'Apakah peserta yang tidak bisa berenang tetap aman ikut tur ini?',
          en: 'Is this tour safe for non-swimmers or children?'
        },
        a: {
          id: 'Sangat aman. Kami menyediakan pelampung standar maritim, pelampung cincin (life buoy), serta pemandu pendamping di air yang menarik peserta ke titik terumbu karang sambil mengambil dokumentasi GoPro.',
          en: 'Completely safe. We provide certified life vests, floating rings, and an in-water guide who assists non-swimmers directly above the coral reefs while capturing GoPro photos.'
        }
      },
      {
        q: {
          id: 'Mengapa berangkat dari Teluk Nara bukan Pelabuhan Bangsal umum?',
          en: 'Why depart from Teluk Nara instead of Bangsal public harbor?'
        },
        a: {
          id: 'Teluk Nara memiliki dermaga khusus kapal privat yang tenang, bebas pedagang asongan yang memaksa, parkir kendaraan langsung di bibir pantai, dan waktu tempuh ke Gili Meno 10 menit lebih cepat.',
          en: 'Teluk Nara features a calm private charter jetty free from harbor crowds and aggressive hawkers, with direct waterside parking and a 10-minute shorter crossing to Gili Meno.'
        }
      }
    ],
    seoKeywords: ['open trip gili trawangan', 'paket snorkeling 3 gili', 'sewa kapal privat gili meno']
  },
  {
    id: 'pkg-mandalika-3d2n',
    slug: 'paket-wisata-lombok-mandalika-sade-3h2m',
    title: {
      id: 'Pesona Mandalika, Bukit Merese & Warisan Sasak 3 Hari 2 Malam',
      en: 'Mandalika Coastline, Merese Hill & Sasak Heritage 3D2N Escape'
    },
    subtitle: {
      id: 'Kuta Mandalika · Tanjung Aan · Bukit Merese · Desa Sade · Gili Nanggu',
      en: 'Kuta Mandalika · Tanjung Aan · Merese Hill · Sade Village · Gili Nanggu'
    },
    region: 'mandalika',
    regionLabel: { id: 'Kuta Mandalika & Selatan', en: 'Mandalika & South Coast' },
    segment: 'honeymoon',
    segmentLabel: { id: 'Keluarga & Honeymoon', en: 'Couples & Family Favorite' },
    durationDays: 3,
    durationLabel: { id: '3 Hari 2 Malam (Termasuk Hotel)', en: '3 Days 2 Nights (Hotel Included)' },
    minPax: 2,
    maxPax: 20,
    priceIdr: 2450000,
    otaPriceIdr: 3100000,
    priceUsd: 165,
    otaPriceUsd: 210,
    rating: 4.95,
    reviewCount: 118,
    image: HERO_IMAGE,
    gallery: [HERO_IMAGE, IMG_SADE, IMG_GILI],
    highlights: {
      id: [
        'Menginap 2 malam di resort bintang 4 tepi pantai Kuta Mandalika / Senggigi',
        'Kunjungan eksklusif ke pengrajin tenun ikat Desa Sukarara & arsitektur lumbung Desa Sade',
        'Menikmati golden hour di Bukit Merese dengan panorama teluk kembar Tanjung Aan',
        'Kuliner autentik Ayam Taliwang Pak Udin & Sate Rembiga khas Lombok'
      ],
      en: [
        '2 nights stay at a curated 4-star beachfront resort in Kuta Mandalika or Senggigi',
        'Authentic cultural visit to Sukarara handwoven songket weavers & Sade Sasak Village',
        'Golden hour picnic overlooking the twin turquoise bays of Tanjung Aan from Merese Hill',
        'Signature Lombok culinary dining: authentic Ayam Taliwang & Sate Rembiga'
      ]
    },
    inclusions: {
      id: [
        'Akomodasi 2 malam hotel bintang 4 (termasuk sarapan pagi)',
        'Transportasi Toyota Innova Zenix ber-AC privat selama 3 hari penuh',
        'Makan siang & makan malam sesuai program (4x kuliner khas Lombok)',
        'Tiket masuk seluruh objek wisata, donasi desa adat, & pemandu lokal berlisensi HPI',
        'Kalungan selendang tenun khas Sasak saat penjemputan di Bandara LOP'
      ],
      en: [
        '2 nights at 4-star resort accommodation (daily breakfast included)',
        'Private air-conditioned Toyota Innova Zenix throughout the 3-day journey',
        '4 curated local lunches & dinners (including beachfront seafood & Ayam Taliwang)',
        'All entrance fees, village donations, & licensed English/Indonesian HPI guide',
        'Traditional Sasak woven scarf welcome greeting at Lombok Airport (LOP)'
      ]
    },
    exclusions: {
      id: [
        'Tiket penerbangan PP ke Bandara LOP',
        'Tip sukarela untuk sopir/pemandu',
        'Upgrade makan malam romantis privat honeymoon (opsional Rp 650.000/pasangan)'
      ],
      en: [
        'Roundtrip flights to Lombok International Airport (LOP)',
        'Discretionary gratuities for guide and driver',
        'Optional private candlelit beach dinner upgrade (USD 45/couple)'
      ]
    },
    itinerary: [
      {
        day: 1,
        title: {
          id: 'Kedatangan Bandara LOP – Desa Tenun Sukarara – Desa Adat Sade – Bukit Merese',
          en: 'Arrival at LOP Airport – Sukarara Weaving Village – Sade Village – Merese Sunset'
        },
        schedule: [
          {
            time: '10:30',
            activity: {
              id: 'Penjemputan di Bandara LOP dengan penyambutan selendang tenun Sasak.',
              en: 'Airport greeting at LOP with traditional woven songket scarf presentation.'
            }
          },
          {
            time: '11:30',
            activity: {
              id: 'Mencoba menenun songket benang emas di Desa Sukarara & berfoto dengan busana adat Sasak.',
              en: 'Try hand-weaving gold-threaded songket in Sukarara & complimentary traditional attire photo.'
            }
          },
          {
            time: '14:00',
            activity: {
              id: 'Menjelajahi lorong rumah adat Bale Tani di Desa Sade dipandu warga lokal asli.',
              en: 'Guided walk through ancestral Bale Tani homes in Sade Traditional Village.'
            }
          },
          {
            time: '16:30',
            activity: {
              id: 'Pantai Tanjung Aan & menikmati matahari terbenam dari puncak Bukit Merese.',
              en: 'Tanjung Aan white pepper sand beach & sunset panorama atop Merese Hill.'
            }
          }
        ]
      },
      {
        day: 2,
        title: {
          id: 'Secret Gili Selatan (Gili Nanggu, Gili Sudak, Gili Kedis) & Kuliner Taliwang',
          en: 'Secret Southwest Gilis (Gili Nanggu, Sudak & Kedis) Island Hopping'
        },
        schedule: [
          {
            time: '08:30',
            activity: {
              id: 'Berangkat menuju Pelabuhan Tawun Sekotong untuk menyeberang ke Gili Nanggu.',
              en: 'Depart to Tawun Harbor in Sekotong for private boat crossing to Gili Nanggu.'
            }
          },
          {
            time: '10:00',
            activity: {
              id: 'Snorkeling di perairan tenang Gili Nanggu yang penuh ikan jinak & terumbu karang utuh.',
              en: 'Snorkeling in calm, crystal-clear Gili Nanggu lagoon teeming with reef fish.'
            }
          },
          {
            time: '12:30',
            activity: {
              id: 'Makan siang ikan bakar segar di tepi pantai Gili Sudak & bersantai di pulau pasir mungil Gili Kedis.',
              en: 'Freshly grilled snapper lunch on Gili Sudak & sandbar relaxation on tiny Gili Kedis.'
            }
          },
          {
            time: '18:30',
            activity: {
              id: 'Makan malam spesial Ayam Taliwang & Pelecing Kangkung di pusat Kota Mataram.',
              en: 'Signature dinner featuring authentic charcoal-grilled Ayam Taliwang in Mataram.'
            }
          }
        ]
      },
      {
        day: 3,
        title: {
          id: 'Belanja Oleh-Oleh Mutiara Lombok & Pengantaran ke Bandara LOP',
          en: 'South Sea Pearl Gallery, Local Souvenirs & Airport Transfer'
        },
        schedule: [
          {
            time: '09:30',
            activity: {
              id: 'Check-out hotel, mengunjungi sentra Mutiara Air Laut Sekarbela & susu kuda liar/madu trigona.',
              en: 'Hotel check-out, visit Sekarbela South Sea pearl gallery & local organic delicacies.'
            }
          },
          {
            time: '12:00',
            activity: {
              id: 'Makan siang Sate Rembiga Utama sebelum diantar tepat waktu ke Bandara Internasional LOP.',
              en: 'Sate Rembiga lunch before punctual transfer to Lombok International Airport (LOP).'
            }
          }
        ]
      }
    ],
    faqs: [
      {
        q: {
          id: 'Bisakah daftar hotel diganti sesuai preferensi kami (misal Pullman Mandalika atau Katamaran Senggigi)?',
          en: 'Can we upgrade the hotel to 5-star properties like Pullman Mandalika or Katamaran Resort?'
        },
        a: {
          id: 'Tentu bisa. Kami memiliki kontrak harga korporat langsung (direct contract rate) dengan Pullman Lombok Merujani, Katamaran Resort, Sikara, dan Novotel yang lebih hemat 15–20% dibanding harga aplikasi OTA.',
          en: 'Yes. We hold direct local contract rates with Pullman Lombok, Katamaran Resort, Novotel Mandalika, and Jeeva Klui, saving you 15–20% compared to online booking platforms.'
        }
      }
    ],
    seoKeywords: ['paket wisata lombok 3 hari 2 malam', 'paket honeymoon lombok', 'wisata kuta mandalika']
  },
  {
    id: 'pkg-rinjani-3d2n',
    slug: 'paket-pendakian-gunung-rinjani-sembalun-3h2m',
    title: {
      id: 'Ekspedisi Puncak Gunung Rinjani (3.726 mdpl) & Danau Segara Anak 3H2M',
      en: 'Mount Rinjani Summit (3,726m) & Segara Anak Crater Lake Trek 3D2N'
    },
    subtitle: {
      id: 'Jalur Sembalun ke Torean / Senaru · Kemah Pelawangan · Pemandian Air Panas Aik Kalak',
      en: 'Sembalun to Torean / Senaru Route · Crater Rim Camp · Natural Hot Springs'
    },
    region: 'rinjani',
    regionLabel: { id: 'Gunung Rinjani & Sembalun', en: 'Mount Rinjani & Sembalun' },
    segment: 'internasional',
    segmentLabel: { id: 'Trekking & Petualangan', en: 'International Trekking' },
    durationDays: 3,
    durationLabel: { id: '3 Hari 2 Malam (Termasuk Penginapan Pra-Pendakian)', en: '3D2N Trek (+1 Night Pre-Trek Lodge)' },
    minPax: 2,
    maxPax: 10,
    priceIdr: 3450000,
    otaPriceIdr: 4350000,
    priceUsd: 225,
    otaPriceUsd: 290,
    rating: 4.98,
    reviewCount: 92,
    image: IMG_RINJANI,
    gallery: [IMG_RINJANI, HERO_IMAGE, IMG_SADE],
    highlights: {
      id: [
        'Resmi terdaftar dengan kuota e-Rinjani Taman Nasional Gunung Rinjani (TNGR)',
        'Tenda gunung double-layer Naturehike/Eiger, matras tebal 8cm, sleeping bag suhu dingin, & toilet tent privat',
        'Rasio pelayanan aman: 1 pemandu gunung berlisensi + 2 porter lokal Sembalun per 2 pendaki',
        'Bonus 1 malam menginap di cottage Sembalun/Senaru malam sebelum pendakian dimulai'
      ],
      en: [
        'Guaranteed official Mount Rinjani National Park (TNGR) e-Rinjani trekking permit & insurance',
        'Expedition-grade double-layer tents, 8cm foam mattresses, sub-zero sleeping bags, & private toilet tent',
        'High safety ratio: 1 licensed mountain guide + 2 local Sembalun porters per 2 trekkers',
        'Includes 1 night pre-trek lodge stay in Sembalun Valley with briefing the evening prior'
      ]
    },
    inclusions: {
      id: [
        'Tiket resmi e-Rinjani TNGR & surat pemeriksaan kesehatan klinik Sembalun',
        '1 malam penginapan di Sembalun sebelum hari pendakian',
        'Pemandu gunung berbahasa Indonesia & Inggris + tim porter logistik',
        'Makan 3x sehari dimasak hangat di gunung + buah segar, kopi Sembalun, & minuman isotonik',
        'Penjemputan dari Bandara LOP / Pelabuhan Bangsal / Senggigi dan pengantaran pasca-turun gunung'
      ],
      en: [
        'Official e-Rinjani National Park permit & mandatory Sembalun medical checkup certificate',
        '1 night pre-trek valley accommodation in Sembalun with breakfast',
        'English-speaking certified mountain guide & dedicated camp porters',
        '3 freshly cooked hot meals daily on the mountain + trail snacks, Sembalun coffee, & electrolytes',
        'Island-wide private pickup (Airport/Gili Harbor/Kuta) and post-trek drop-off'
      ]
    },
    exclusions: {
      id: [
        'Sepatu trekking pribadi, jaket windproof/down, dan headlamp (tersedia sewa di basecamp kami)',
        'Porter tambahan untuk tas pribadi pendaki (opsional Rp 350.000/hari)',
        'Tip untuk kru porter dan guide gunung'
      ],
      en: [
        'Personal hiking boots, down jacket, and headlamp (available for rent at our Sembalun basecamp)',
        'Extra personal backpack porter (optional USD 25/day)',
        'Gratuities for mountain porters and trekking guide'
      ]
    },
    itinerary: [
      {
        day: 1,
        title: {
          id: 'Kandang Sapi Sembalun (1.156m) – Savana Timur – Kemah Pelawangan Sembalun (2.639m)',
          en: 'Sembalun Trailhead (1,156m) – Eastern Savanna – Sembalun Crater Rim Camp (2,639m)'
        },
        schedule: [
          {
            time: '07:30',
            activity: {
              id: 'Registrasi e-Rinjani di kantor TNGR Sembalun, cek tensi kesehatan, dan mulai pendakian melewati padang savana.',
              en: 'e-Rinjani registration at TNGR office, medical check, and trek start across golden savanna hills.'
            }
          },
          {
            time: '12:00',
            activity: {
              id: 'Istirahat makan siang hangat di Pos 2 Tengengean (1.500m) yang disiapkan oleh kru porter.',
              en: 'Hot freshly cooked lunch at Pos 2 Tengengean (1,500m) prepared by our mountain crew.'
            }
          },
          {
            time: '16:30',
            activity: {
              id: 'Tiba di bibir kawah Pelawangan Sembalun (2.639m), tenda sudah berdiri menghadap Danau Segara Anak.',
              en: 'Reach Sembalun Crater Rim (2,639m); camp already pitched overlooking Segara Anak Lake.'
            }
          }
        ]
      },
      {
        day: 2,
        title: {
          id: 'Summit Attack Puncak Rinjani (3.726m) – Danau Segara Anak – Pemandian Air Panas',
          en: 'Summit Attack (3,726m Sunrise) – Segara Anak Crater Lake – Aik Kalak Hot Springs'
        },
        schedule: [
          {
            time: '02:00',
            activity: {
              id: 'Sarapan ringan & minuman hangat, mulai pendakian puncak di bawah taburan bintang.',
              en: 'Light pre-dawn breakfast & hot ginger tea before ascending the volcanic ridge under the stars.'
            }
          },
          {
            time: '06:00',
            activity: {
              id: 'Mencapai Puncak Dewi Anjani (3.726 mdpl) saat matahari terbit dengan panorama pulau Lombok, Bali, dan Sumbawa.',
              en: 'Reach Rinjani Summit (3,726m) at sunrise viewing Lombok, Mount Agung Bali, and Tambora.'
            }
          },
          {
            time: '10:30',
            activity: {
              id: 'Turun kembali ke kemah Pelawangan, sarapan penuh, lalu menuruni jalur menuju Danau Segara Anak (2.000m).',
              en: 'Return to rim camp for second breakfast, then descend to Segara Anak Crater Lake (2,000m).'
            }
          },
          {
            time: '15:00',
            activity: {
              id: 'Berendam melemaskan otot di sumber air panas alami Aik Kalak dan berkemah di tepi danau.',
              en: 'Soak tired muscles in Aik Kalak natural volcanic hot springs and camp by the lakeshore.'
            }
          }
        ]
      },
      {
        day: 3,
        title: {
          id: 'Jalur Lembah Torean (Jurassic Park Lombok) – Air Terjun Penimbungan – Transfer Hotel',
          en: 'Scenic Torean Valley Descent (Lombok Jurassic Canyon) – Transfer to Next Destination'
        },
        schedule: [
          {
            time: '07:30',
            activity: {
              id: 'Menuruni lembah hijau Torean melewati ngarai sungai vulkanik dan Air Terjun Penimbungan.',
              en: 'Descend via the lush Torean canyon trail passing dramatic cliffs and Penimbungan Waterfall.'
            }
          },
          {
            time: '14:00',
            activity: {
              id: 'Tiba di Desa Torean, dijemput mobil privat menuju Senggigi, Pelabuhan Bangsal (ke Gili), atau Bandara LOP.',
              en: 'Finish trek at Torean village; private car transfer to Gili harbor, Senggigi, or LOP Airport.'
            }
          }
        ]
      }
    ],
    faqs: [
      {
        q: {
          id: 'Kapan musim terbaik mendaki Gunung Rinjani dan kapan jalur ditutup?',
          en: 'When is the Mount Rinjani trekking season open?'
        },
        a: {
          id: 'Jalur resmi TNGR dibuka setiap tahun mulai 1 April hingga 31 Desember. Bulan Januari–Maret jalur ditutup untuk pemulihan ekosistem dan karena curah hujan tinggi. Kami menyarankan booking minimal 2 minggu sebelumnya karena kuota harian e-Rinjani dibatasi.',
          en: 'Official TNGR trails are open from April 1 to December 31 annually, and closed January–March for monsoon recovery. Book at least 2 weeks ahead as daily e-Rinjani quotas are strictly capped.'
        }
      }
    ],
    seoKeywords: ['paket trekking rinjani', 'open trip rinjani via sembalun', 'lombok volcano trek']
  },
  {
    id: 'pkg-pink-beach-private',
    slug: 'tur-privat-pink-beach-pulau-pasir-gili-petelu',
    title: {
      id: 'Private Boat Tour Pink Beach, Pulau Pasir & Gili Petelu Lombok Timur',
      en: 'East Lombok Pink Beach, Sandbar Island & Gili Petelu Private Boat Tour'
    },
    subtitle: {
      id: 'Pelabuhan Tanjung Luar · Pulau Pasir · Pantai Pink 1 & 2 · Gili Petelu · Tanjung Ringgit',
      en: 'Tanjung Luar Harbor · Disappearing Sandbar · Pink Beach 1 & 2 · Gili Petelu · Tanjung Ringgit'
    },
    region: 'pink-beach',
    regionLabel: { id: 'Pink Beach & Lombok Timur', en: 'Pink Beach & East Coast' },
    segment: 'honeymoon',
    segmentLabel: { id: 'Eksklusif & Fotografi', en: 'Private Boat & Drone Tour' },
    durationDays: 1,
    durationLabel: { id: '1 Hari Penuh (08.00–17.30)', en: 'Full Day (08:00–17:30)' },
    minPax: 2,
    maxPax: 10,
    priceIdr: 780000,
    otaPriceIdr: 980000,
    priceUsd: 52,
    otaPriceUsd: 68,
    rating: 4.94,
    reviewCount: 87,
    image: IMG_PINK_BEACH,
    gallery: [IMG_PINK_BEACH, HERO_IMAGE, IMG_GILI],
    highlights: {
      id: [
        'Menjelajahi Pink Beach 1 (Tangsi) dan Pink Beach 2 (Segui) yang masih sepi lewat jalur laut',
        'Berfoto di Pulau Pasir timbul di tengah laut berlatar gunung-gunung Sumbawa',
        'Snorkeling di akuarium alami Gili Petelu & Gili Gambir dengan visibilitas air hingga 20 meter',
        'Makan siang piknik seafood bakar segar (ikan kakap, cumi, udang, sambal beberuk) di gazebo Pantai Pink'
      ],
      en: [
        'Cruise by private outrigger boat to both Pink Beach 1 (Tangsi) and untouched Pink Beach 2 (Segui)',
        'Walk on the tidal disappearing sandbar (Pulau Pasir) surrounded by turquoise waters',
        'Snorkel at Gili Petelu coral garden with 20-meter underwater visibility',
        'Freshly grilled seafood beach picnic (snapper, calamari, prawns, sambal beberuk) at Pink Beach'
      ]
    },
    inclusions: {
      id: [
        'Transportasi mobil AC privat PP dari hotel + kapal kayu privat dari Pelabuhan Tanjung Luar',
        'Paket makan siang piknik seafood bakar lengkap di Pantai Pink',
        'Peralatan snorkeling lengkap & jaket pelampung',
        'Dokumentasi foto kamera mirrorless & GoPro bawah air'
      ],
      en: [
        'Roundtrip private AC car from hotel + private boat charter from Tanjung Luar Harbor',
        'Full grilled seafood beach picnic lunch served on Pink Beach',
        'Complete snorkeling equipment & life jackets',
        'Mirrorless camera beach photos & underwater GoPro documentation'
      ]
    },
    exclusions: {
      id: [
        'Dokumentasi video Drone DJI Mini 4 Pro (opsional tambah Rp 350.000/grup)',
        'Pengeluaran pribadi di luar program'
      ],
      en: [
        'Optional DJI Drone aerial video package (+USD 25 per group)',
        'Personal expenses outside the itinerary'
      ]
    },
    itinerary: [
      {
        day: 1,
        title: {
          id: 'Pelabuhan Tanjung Luar – Pulau Pasir – Gili Petelu – Pantai Pink – Tebing Tanjung Ringgit',
          en: 'Tanjung Luar Harbor – Sandbar Island – Gili Petelu – Pink Beach – Tanjung Ringgit Cliffs'
        },
        schedule: [
          {
            time: '08:00',
            activity: {
              id: 'Penjemputan di hotel menuju Pelabuhan Tanjung Luar, Lombok Timur.',
              en: 'Hotel pickup and scenic drive to Tanjung Luar fish harbor in East Lombok.'
            }
          },
          {
            time: '09:45',
            activity: {
              id: 'Menyeberang ke Pulau Pasir untuk sesi foto di gundukan pasir putih tengah laut.',
              en: 'Boat crossing to Pulau Pasir tidal sandbar for photos in the middle of the ocean.'
            }
          },
          {
            time: '11:00',
            activity: {
              id: 'Snorkeling di Gili Petelu dan Pantai Semangkok memberi makan ikan karang warna-warni.',
              en: 'Snorkeling at Gili Petelu and Semangkok Bay coral sanctuary.'
            }
          },
          {
            time: '13:00',
            activity: {
              id: 'Bersandar di Pantai Pink, menikmati makan siang seafood bakar hangat & eksplorasi bukit savana Tangsi.',
              en: 'Land on Pink Beach for a grilled seafood feast and walk up Tangsi panoramic hill.'
            }
          }
        ]
      }
    ],
    faqs: [
      {
        q: {
          id: 'Mengapa ke Pink Beach lebih disarankan naik kapal via Tanjung Luar dibanding lewat jalur darat?',
          en: 'Why take a boat from Tanjung Luar instead of driving all the way to Pink Beach?'
        },
        a: {
          id: 'Dengan jalur laut dari Tanjung Luar, Anda sekaligus mengunjungi Pulau Pasir, Gili Petelu, dan Pantai Pink 2 yang tidak terjangkau mobil, serta perjalanan jauh lebih nyaman sambil menikmati panorama tebing laut.',
          en: 'Going by boat lets you visit Pulau Pasir sandbar, Gili Petelu reef, and secluded Pink Beach 2—spots unreachable by road—while enjoying a smooth coastal cruise.'
        }
      }
    ],
    seoKeywords: ['paket wisata pink beach lombok', 'sewa kapal pink beach tanjung luar', 'pulau pasir lombok']
  },
  {
    id: 'pkg-sade-benang-kelambu',
    slug: 'tur-budaya-desa-sade-air-terjun-benang-kelambu',
    title: {
      id: 'Jejak Budaya Sasak Desa Sade & Air Terjun Tirai Benang Kelambu',
      en: 'Sasak Cultural Heritage & Benang Kelambu Curtain Waterfall Day Tour'
    },
    subtitle: {
      id: 'Pura Lingsar · Desa Tenun Sukarara · Air Terjun Benang Stokel & Benang Kelambu',
      en: 'Lingsar Temple · Sukarara Weaving Village · Benang Stokel & Benang Kelambu Waterfalls'
    },
    region: 'culture',
    regionLabel: { id: 'Budaya & Air Terjun', en: 'Culture & Waterfalls' },
    segment: 'domestik',
    segmentLabel: { id: 'Budaya & Alam Hijau', en: 'Cultural & Nature' },
    durationDays: 1,
    durationLabel: { id: '1 Hari Penuh (08.30–17.00)', en: 'Full Day (08:30–17:00)' },
    minPax: 2,
    maxPax: 14,
    priceIdr: 590000,
    otaPriceIdr: 750000,
    priceUsd: 40,
    otaPriceUsd: 52,
    rating: 4.92,
    reviewCount: 64,
    image: IMG_SADE,
    gallery: [IMG_SADE, IMG_RINJANI, HERO_IMAGE],
    highlights: {
      id: [
        'Mengunjungi Air Terjun Benang Kelambu di kaki Rinjani yang keluar langsung dari celah tanaman merambat bagai tirai halus',
        'Belajar filosofi motif tenun Subahnale & Keker langsung bersama ibu-ibu penenun Desa Sukarara',
        'Termasuk ojek lokal resmi di jalur kebun kopi menuju titik air terjun tanpa perlu jalan kaki jauh',
        'Makan siang kuliner NTB autentik (Nasi Balap Puyung & Sate Bulayak)'
      ],
      en: [
        'Visit UNESCO Geopark site Benang Kelambu where spring water cascades through lush hanging vines like a silk curtain',
        'Learn the sacred meanings of Sasak Songket motifs directly from master weavers in Sukarara',
        'Includes local village motorbike shuttle through coffee plantations right to the waterfall entrance',
        'Authentic Sasak lunch featuring Nasi Balap Puyung & Sate Bulayak'
      ]
    },
    inclusions: {
      id: [
        'Kendaraan ber-AC privat + BBM + sopir berpengalaman',
        'Tiket masuk kawasan Geopark Benang Stokel & Benang Kelambu + ojek lokal PP',
        'Pemandu lokal Desa Adat & makan siang kuliner khas Lombok',
        'Air mineral dingin & handuk segar di kendaraan'
      ],
      en: [
        'Private AC vehicle + fuel + experienced local driver-guide',
        'Geopark entrance tickets + return local motorbike shuttle to Benang Kelambu',
        'Local village cultural guide & traditional Sasak lunch',
        'Chilled mineral water & refreshing towels onboard'
      ]
    },
    exclusions: {
      id: [
        'Pembelian kain tenun songket pribadi',
        'Pengeluaran pribadi di luar jadwal'
      ],
      en: [
        'Personal purchases of handwoven textiles',
        'Personal expenses outside the itinerary'
      ]
    },
    itinerary: [
      {
        day: 1,
        title: {
          id: 'Desa Tenun Sukarara – Air Terjun Benang Stokel & Benang Kelambu – Sentra Gerabah Banyumulek',
          en: 'Sukarara Weaving Village – Benang Stokel & Benang Kelambu Waterfalls – Banyumulek Pottery'
        },
        schedule: [
          {
            time: '08:30',
            activity: {
              id: 'Penjemputan di hotel menuju kaki Gunung Rinjani bagian tengah (Aik Berik).',
              en: 'Hotel pickup heading toward the lush central foothills of Mount Rinjani.'
            }
          },
          {
            time: '10:00',
            activity: {
              id: 'Eksplorasi Air Terjun kembar Benang Stokel & mata air tirai hijau Benang Kelambu.',
              en: 'Explore twin Benang Stokel falls and the spring-fed curtain waterfall of Benang Kelambu.'
            }
          },
          {
            time: '13:30',
            activity: {
              id: 'Makan siang kuliner Sasak dilanjutkan kunjungan ke pengrajin tenun Desa Sukarara & gerabah Banyumulek.',
              en: 'Traditional Sasak lunch followed by hands-on weaving at Sukarara & Banyumulek pottery center.'
            }
          }
        ]
      }
    ],
    faqs: [
      {
        q: {
          id: 'Apakah jalur menuju Air Terjun Benang Kelambu ramah untuk lansia atau anak-anak?',
          en: 'Is the path to Benang Kelambu accessible for seniors or children?'
        },
        a: {
          id: 'Ya, karena paket kami sudah termasuk layanan ojek lokal resmi yang mengantar peserta melewati jalur hutan langsung sampai di dekat tangga utama air terjun.',
          en: 'Yes, our package includes the local shuttle service right to the lower entrance, minimizing steep walking.'
        }
      }
    ],
    seoKeywords: ['air terjun benang kelambu lombok', 'wisata budaya desa sade', 'paket one day tour lombok']
  },
  {
    id: 'pkg-corporate-mice-4d3n',
    slug: 'paket-gathering-kantor-mice-lombok-4h3m',
    title: {
      id: 'Paket Gathering Korporat, Outbound & MICE Lombok Eksklusif 4H3M',
      en: 'Corporate Retreat, Team Outbound & MICE Mandalika Package 4D3N'
    },
    subtitle: {
      id: 'Senggigi / Mandalika Ballroom · Private Gili Trawangan Charter · Gala Dinner Tepi Pantai',
      en: 'Senggigi / Mandalika Ballroom · Private Gili Island Charter · Beachfront Gala Dinner'
    },
    region: 'mice',
    regionLabel: { id: 'Korporat & Rombongan MICE', en: 'Corporate & MICE Groups' },
    segment: 'korporat',
    segmentLabel: { id: 'Instansi & Korporat (20–150 Pax)', en: 'Corporate & Institutions (20–150 Pax)' },
    durationDays: 4,
    durationLabel: { id: '4 Hari 3 Malam (Full Board & Gala Dinner)', en: '4 Days 3 Nights (Full Board & Gala)' },
    minPax: 20,
    maxPax: 150,
    priceIdr: 3650000,
    otaPriceIdr: 4500000,
    priceUsd: 240,
    otaPriceUsd: 295,
    rating: 4.97,
    reviewCount: 41,
    image: HERO_IMAGE,
    gallery: [HERO_IMAGE, IMG_GILI, IMG_SADE],
    highlights: {
      id: [
        'Manajemen acara satu pintu: bus pariwisata terbaru, voorijder (opsional), spanduk perusahaan, & seragam kaos tim',
        'Program Team Building pantai bersama fasilitator bersertifikat BNSP di Pantai Senggigi / Tanjung Aan',
        'Malam keakraban (Gala Dinner BBQ Seafood) di tepi pantai lengkap dengan live acoustic & tari tradisional Gendang Beleq',
        'Faktur Pajak resmi (PKP), e-Invoice perusahaan, dan termin pembayaran fleksibel untuk BUMN/Swasta'
      ],
      en: [
        'Turnkey MICE logistics: late-model executive coaches, custom company banners, & branded team apparel',
        'Certified beach team-building games at Senggigi or Tanjung Aan led by professional facilitators',
        'Private beachfront Seafood BBQ Gala Dinner featuring live acoustic band & traditional Gendang Beleq percussion',
        'Full corporate compliance: official tax invoice (Faktur Pajak), NPWP documentation, and corporate payment terms'
      ]
    },
    inclusions: {
      id: [
        '3 malam hotel bintang 4/5 (Twin Share) + penggunaan ruang meeting half-day lengkap coffee break',
        'Bus Pariwisata Eksekutif + kru tour leader bersertifikat per bus',
        'Kapal Catamaran / Glass Bottom privat khusus rombongan ke Gili Trawangan',
        '1x Gala Dinner BBQ Tepi Pantai + Live Music + Dokumentasi Foto, Video Cinematic & Drone',
        'Spanduk acara, ID Card peserta, P3K standar korporat, dan komplimen 1 pax gratis tiap 25 peserta (FOC 25:1)'
      ],
      en: [
        '3 nights 4/5-star resort stay (Twin Share) + half-day ballroom meeting package with coffee breaks',
        'Executive tour coaches + dedicated tour leader per bus',
        'Private fleet charter to Gili Trawangan with reserved beachfront restaurant',
        '1x Private Beachfront BBQ Gala Dinner + Live Entertainment + Drone & Cinema Aftermovie',
        'Event backdrops, participant lanyards, medical standby, and 1 complimentary slot per 25 guests (25:1 FOC)'
      ]
    },
    exclusions: {
      id: [
        'Tiket pesawat grup (kami dapat membantu pemesanan blok kursi Garuda Indonesia / Citilink / Super Air Jet)',
        'Keperluan kamar Single Supplement bagi direksi/VIP'
      ],
      en: [
        'Group airfare (our ticketing desk can arrange group block seats on Garuda Indonesia / Citilink)',
        'Single room supplement for VIP executives'
      ]
    },
    itinerary: [
      {
        day: 1,
        title: {
          id: 'Penyambutan Tari Gendang Beleq di Bandara LOP – Sasak Tour – Check-in & Rapat Kerja',
          en: 'Traditional Gendang Beleq Airport Welcome – Sasak Heritage – Resort Check-in & Townhall'
        },
        schedule: [
          {
            time: '11:00',
            activity: {
              id: 'Penyambutan rombongan di Bandara LOP dengan kalungan tenun & tabuhan Gendang Beleq.',
              en: 'VIP group arrival at LOP Airport greeted with traditional Gendang Beleq cultural performance.'
            }
          },
          {
            time: '15:30',
            activity: {
              id: 'Check-in resort bintang 4/5 dilanjutkan sesi Townhall / Rapat Kerja di ballroom.',
              en: 'Resort check-in followed by corporate townhall session in the private ballroom.'
            }
          }
        ]
      },
      {
        day: 2,
        title: {
          id: 'Outbound Team Building Pantai – Eksplorasi Gili Trawangan – Sunset Malimbu',
          en: 'Beach Team-Building Games – Private Gili Trawangan Crossing – Sunset Cruise'
        },
        schedule: [
          {
            time: '08:00',
            activity: {
              id: 'Sesi Fun Outbound & sinergi tim di halaman rumput tepi pantai.',
              en: 'Facilitated morning team-building challenges on the beachfront lawn.'
            }
          },
          {
            time: '11:00',
            activity: {
              id: 'Menyeberang ke Gili Trawangan untuk snorkeling grup dan makan siang di beach club eksklusif.',
              en: 'Private boat transfer to Gili Trawangan for reef snorkeling and beach club lunch.'
            }
          }
        ]
      },
      {
        day: 3,
        title: {
          id: 'Sirkuit Mandalika Photo Stop – Bukit Merese – Malam Puncak Beachfront Gala Dinner',
          en: 'Mandalika Street Circuit – Merese Hill – Farewell Beachfront Seafood Gala Dinner'
        },
        schedule: [
          {
            time: '09:30',
            activity: {
              id: 'Kunjungan grup & sesi foto drone formasi perusahaan di kawasan Kuta Mandalika & Tanjung Aan.',
              en: 'Aerial drone formation photo shoot at Mandalika Coast and Tanjung Aan Bay.'
            }
          },
          {
            time: '19:00',
            activity: {
              id: 'Malam Puncak Gala Dinner Seafood BBQ, pembagian doorprize, pemutaran video highlight, & live band.',
              en: 'Farewell Beachfront Gala Dinner, award night, same-day video highlight screening, & live band.'
            }
          }
        ]
      },
      {
        day: 4,
        title: {
          id: 'Wisata Belanja Mutiara & Cendera Mata Khas NTB – Pengantaran Bandara LOP',
          en: 'Lombok Pearl & Souvenir Shopping – Group Departure from LOP Airport'
        },
        schedule: [
          {
            time: '09:30',
            activity: {
              id: 'Belanja oleh-oleh kaos Lombok Exotic, mutiara, & pengantaran terkoordinasi ke Bandara LOP.',
              en: 'Curated souvenir shopping stop and coordinated luggage handling to LOP Airport.'
            }
          }
        ]
      }
    ],
    faqs: [
      {
        q: {
          id: 'Apakah PT Lombok Nusantara Wisata memiliki legalitas lengkap untuk tender pengadaan BUMN atau kementerian?',
          en: 'Does your agency provide complete legal & tax documentation for corporate procurement?'
        },
        a: {
          id: 'Lengkap. PT Lombok Nusantara Wisata memiliki Akta Perseroan, NIB KBLI Biro Perjalanan Wisata, NPWP PKP (bisa menerbitkan e-Faktur PPN), keanggotaan ASITA NTB, serta rekening giro bank atas nama perusahaan.',
          en: 'Yes. PT Lombok Nusantara Wisata holds full corporate incorporation, Tourism Business License (NIB), VAT Tax Registration (PKP e-Faktur), ASITA membership, and dedicated corporate bank accounts.'
        }
      }
    ],
    seoKeywords: ['paket gathering kantor ke lombok', 'paket outbound lombok', 'event organizer mice lombok']
  }
];

export const TRANSFER_ROUTES: TransferRoute[] = [
  {
    id: 'lop-kuta',
    destination: { id: 'Bandara LOP ↔ Kuta Mandalika / Tanjung Aan', en: 'LOP Airport ↔ Kuta Mandalika / Tanjung Aan' },
    distanceKm: 18,
    durationMin: 25,
    avanzaIdr: 175000,
    avanzaUsd: 12,
    innovaIdr: 275000,
    innovaUsd: 19,
    hiaceIdr: 650000,
    hiaceUsd: 45,
    otaMarkupPercent: 28
  },
  {
    id: 'lop-senggigi',
    destination: { id: 'Bandara LOP ↔ Senggigi / Batu Layar', en: 'LOP Airport ↔ Senggigi Beach Resorts' },
    distanceKm: 48,
    durationMin: 65,
    avanzaIdr: 275000,
    avanzaUsd: 19,
    innovaIdr: 390000,
    innovaUsd: 27,
    hiaceIdr: 850000,
    hiaceUsd: 58,
    otaMarkupPercent: 25
  },
  {
    id: 'lop-bangsal',
    destination: { id: 'Bandara LOP ↔ Pelabuhan Bangsal / Teluk Nara (Ke 3 Gili)', en: 'LOP Airport ↔ Bangsal / Teluk Nara Harbor (To Gilis)' },
    distanceKm: 62,
    durationMin: 95,
    avanzaIdr: 350000,
    avanzaUsd: 24,
    innovaIdr: 480000,
    innovaUsd: 33,
    hiaceIdr: 980000,
    hiaceUsd: 66,
    otaMarkupPercent: 30
  },
  {
    id: 'lop-mataram',
    destination: { id: 'Bandara LOP ↔ Kota Mataram / Cakranegara', en: 'LOP Airport ↔ Mataram City Center' },
    distanceKm: 34,
    durationMin: 45,
    avanzaIdr: 225000,
    avanzaUsd: 15,
    innovaIdr: 325000,
    innovaUsd: 22,
    hiaceIdr: 750000,
    hiaceUsd: 50,
    otaMarkupPercent: 24
  },
  {
    id: 'lop-sembalun',
    destination: { id: 'Bandara LOP ↔ Sembalun / Senaru (Basecamp Rinjani)', en: 'LOP Airport ↔ Sembalun / Senaru (Mount Rinjani)' },
    distanceKm: 88,
    durationMin: 150,
    avanzaIdr: 550000,
    avanzaUsd: 38,
    innovaIdr: 720000,
    innovaUsd: 49,
    hiaceIdr: 1350000,
    hiaceUsd: 92,
    otaMarkupPercent: 26
  },
  {
    id: 'fullday-charter',
    destination: { id: 'Sewa Mobil + Sopir + BBM (12 Jam Bebas Rute Lombok)', en: 'Full-Day Private Car + Driver + Fuel (12 Hours Island-Wide)' },
    distanceKm: 140,
    durationMin: 720,
    avanzaIdr: 600000,
    avanzaUsd: 40,
    innovaIdr: 850000,
    innovaUsd: 58,
    hiaceIdr: 1450000,
    hiaceUsd: 98,
    otaMarkupPercent: 22
  }
];

export const FAST_BOAT_SCHEDULES: FastBoatSchedule[] = [
  {
    id: 'fb-ekajaya-morning',
    operator: 'Eka Jaya Fast Ferry (210 Seater Aluminum)',
    route: { id: 'Padang Bai (Bali) → Gili Trawangan → Gili Air → Bangsal', en: 'Padang Bai (Bali) → Gili Trawangan → Gili Air → Bangsal' },
    departureTime: '09:00 WITA',
    arrivalTime: '10:30 WITA',
    priceIdr: 375000,
    priceUsd: 26,
    baggageAllowance: '25 kg / pax'
  },
  {
    id: 'fb-wijaya-perkasa',
    operator: 'Wijaya Perkasa Express',
    route: { id: 'Padang Bai (Bali) → Gili Trawangan → Gili Meno → Bangsal', en: 'Padang Bai (Bali) → Gili Trawangan → Gili Meno → Bangsal' },
    departureTime: '10:30 WITA',
    arrivalTime: '12:00 WITA',
    priceIdr: 340000,
    priceUsd: 23,
    baggageAllowance: '25 kg / pax'
  },
  {
    id: 'fb-bluewater-serangan',
    operator: 'BlueWater Express Luxury',
    route: { id: 'Serangan (Bali Selatan) → Gili Trawangan → Teluk Nara', en: 'Serangan (South Bali) → Gili Trawangan → Teluk Nara' },
    departureTime: '08:30 WITA',
    arrivalTime: '11:15 WITA',
    priceIdr: 680000,
    priceUsd: 46,
    baggageAllowance: '30 kg / pax'
  },
  {
    id: 'fb-speedboat-nara',
    operator: 'Nusantara Private Speedboat Charter',
    route: { id: 'Teluk Nara (Lombok) ↔ Gili Trawangan / Meno / Air (Bebas Jam)', en: 'Teluk Nara (Lombok) ↔ Gili Trawangan / Meno / Air (On-Demand)' },
    departureTime: 'Fleksibel 07:00–18:00',
    arrivalTime: '12 Menit Penyeberangan',
    priceIdr: 400000,
    priceUsd: 28,
    baggageAllowance: 'Maks 6 Pax / Kapal'
  }
];

export const DESTINATION_GUIDES: DestinationGuide[] = [
  {
    id: 'guide-itinerary-3d2n',
    slug: 'itinerary-3-hari-2-malam-lombok-lengkap',
    title: {
      id: 'Itinerary 3 Hari 2 Malam Lombok Paling Efisien (Tanpa Habis Waktu di Jalan)',
      en: 'The Ultimate 3 Days 2 Nights Lombok Itinerary (Zero Wasted Transit Time)'
    },
    category: { id: 'Panduan Rute & Biaya', en: 'Itinerary & Cost Guide' },
    readTimeMin: 6,
    publishDate: 'Oktober 2026',
    targetKeyword: 'itinerary 3 hari 2 malam lombok',
    monthlySearchVolume: '8.400 pencarian/bln',
    image: HERO_IMAGE,
    summary: {
      id: 'Kesalahan terbesar wisatawan pertama kali ke Lombok adalah menggabungkan Mandalika (Selatan) dan Gili Trawangan (Utara) di hari yang sama. Berikut pembagian zona harian yang menghemat 3 jam perjalanan darat.',
      en: 'The most common mistake first-time visitors make is combining South Lombok (Mandalika) and North Lombok (Gilis) on the same day. Here is how to zone your 3-day trip to save 3 hours of driving.'
    },
    bestSeason: { id: 'April – November (Cerah & Laut Tenang)', en: 'April – November (Dry & Calm Seas)' },
    distanceFromAirport: '18 km ke Mandalika · 62 km ke Pelabuhan Gili',
    contentSections: [
      {
        heading: {
          id: 'Hari 1: Fokus Zona Selatan (Bandara LOP – Desa Sade – Kuta Mandalika – Bukit Merese)',
          en: 'Day 1: South Zone Focus (LOP Airport – Sade Village – Kuta Mandalika – Merese Hill)'
        },
        body: {
          id: 'Begitu mendarat di Bandara Internasional Zainuddin Abdul Madjid (LOP), Anda sudah berada di Lombok Tengah bagian selatan. Manfaatkan hari pertama untuk mengunjungi Desa Tenun Sukarara (15 menit dari bandara), Desa Adat Sade, lalu makan siang di Kuta Mandalika dan menikmati matahari terbenam di Bukit Merese.',
          en: 'Upon landing at Lombok International Airport (LOP), you are already in the southern corridor. Spend Day 1 visiting Sukarara Weaving Village (15 mins from airport), Sade Traditional Village, lunch in Kuta Mandalika, and sunset atop Merese Hill overlooking Tanjung Aan.'
        }
      },
      {
        heading: {
          id: 'Hari 2: Zona Utara & Kepulauan 3 Gili (Senggigi – Teluk Nara – Meno – Trawangan)',
          en: 'Day 2: North Coast & 3 Gili Islands (Senggigi – Teluk Nara – Meno – Trawangan)'
        },
        body: {
          id: 'Berangkat pukul 08.00 pagi melewati jalur pesisir Senggigi menuju dermaga privat Teluk Nara. Mulai snorkeling pagi hari saat air laut paling jernih di patung bawah air Gili Meno dan Turtle Point, makan siang di Gili Air, bersepeda sore di Gili Trawangan, lalu kembali lewat Bukit Malimbu saat senja.',
          en: 'Depart at 08:00 AM along the scenic Senggigi coastal road to Teluk Nara jetty. Morning water visibility is best for Gili Meno statues and turtle point, followed by lunch on Gili Air, afternoon cycling on Gili Trawangan, and sunset at Malimbu Cliff.'
        }
      },
      {
        heading: {
          id: 'Hari 3: Kuliner Mataram, Sentra Mutiara Sekarbela & Kembali ke Bandara',
          en: 'Day 3: Mataram Culinary Trail, South Sea Pearls & Departure'
        },
        body: {
          id: 'Sebelum penerbangan sore, nikmati Sate Rembiga dan Ayam Taliwang asli di Mataram, kunjungi pengrajin mutiara air laut bersertifikat di Sekarbela, lalu menuju bandara lewat jalur bypass BIL dalam 40 menit.',
          en: 'Before your afternoon flight, savor authentic Sate Rembiga and Ayam Taliwang in Mataram, inspect certified South Sea pearls in Sekarbela, and take the smooth bypass highway back to LOP Airport in 40 minutes.'
        }
      }
    ]
  },
  {
    id: 'guide-waktu-terbaik-gili',
    slug: 'waktu-terbaik-ke-gili-trawangan-meno-air',
    title: {
      id: 'Perbedaan Gili Trawangan, Gili Meno, dan Gili Air: Pilih yang Mana?',
      en: 'Gili Trawangan vs. Gili Meno vs. Gili Air: Which Island Matches Your Style?'
    },
    category: { id: 'Panduan Destinasi', en: 'Destination Guide' },
    readTimeMin: 5,
    publishDate: 'Oktober 2026',
    targetKeyword: 'perbedaan gili trawangan meno air',
    monthlySearchVolume: '6.200 pencarian/bln',
    image: IMG_GILI,
    summary: {
      id: 'Ketiga pulau bebas kendaraan bermotor ini hanya berjarak 10 menit naik kapal, namun memiliki karakter yang sangat berbeda untuk honeymoon, keluarga, maupun solo traveler.',
      en: 'All three car-free coral islands sit just 10 minutes apart by boat, yet each offers a distinct atmosphere for honeymooners, families, and divers.'
    },
    bestSeason: { id: 'Mei – Oktober (Visibilitas Snorkeling 20m+)', en: 'May – October (20m+ Reef Visibility)' },
    distanceFromAirport: '90 menit darat + 12 menit speedboat dari Teluk Nara',
    contentSections: [
      {
        heading: {
          id: 'Gili Trawangan: Fasilitas Paling Lengkap, Bersepeda Sunset & Beach Club',
          en: 'Gili Trawangan: Vibrant Beach Clubs, Sunset Cycling & Boutique Resorts'
        },
        body: {
          id: 'Pulau terbesar dengan pilihan resort terlengkap. Sisi timur ramai dengan restoran tepi pantai dan pusat selam PADI, sementara sisi barat (Sunset Beach) tenang untuk bersepeda sore dan berfoto di ayunan pantai.',
          en: 'The largest island with the widest selection of resorts. The east coast bustles with cafes and PADI dive centers, while the west coast offers tranquil sunset lounges.'
        }
      },
      {
        heading: {
          id: 'Gili Meno: Surga Honeymoon, Danau Air Asin & Konservasi Penyu',
          en: 'Gili Meno: Honeymoon Sanctuary, Saltwater Lake & Sea Turtles'
        },
        body: {
          id: 'Pulau paling hening dengan pasir sehalus tepung. Di sini terdapat patung bawah air Bask Nest yang ikonik dan kawanan penyu hijau yang berenang hanya beberapa meter dari bibir pantai.',
          en: 'The quietest island with powdery white sand, home to the famous Bask Nest underwater sculptures and resident green sea turtles swimming right off the shore.'
        }
      },
      {
        heading: {
          id: 'Gili Air: Perpaduan Santai Keluarga & Taman Karang Biru',
          en: 'Gili Air: Laid-Back Family Atmosphere & Shallow Coral Gardens'
        },
        body: {
          id: 'Paling dekat dengan daratan Pulau Lombok. Cocok untuk keluarga dengan anak-anak karena perairan pantainya dangkal, tenang, dan penduduk lokalnya sangat ramah.',
          en: 'Closest to mainland Lombok, ideal for families with children thanks to shallow calm lagoons and welcoming local cafes.'
        }
      }
    ]
  },
  {
    id: 'guide-persiapan-rinjani',
    slug: 'panduan-mendaki-gunung-rinjani-via-sembalun',
    title: {
      id: 'Panduan Persiapan Fisik, Kuota e-Rinjani & Rute Sembalun–Torean',
      en: 'Mount Rinjani Trekking Guide: Sembalun–Torean Route, Permits & Packing List'
    },
    category: { id: 'Trekking & Gunung', en: 'Mountain & Adventure' },
    readTimeMin: 7,
    publishDate: 'September 2026',
    targetKeyword: 'panduan mendaki gunung rinjani sembalun',
    monthlySearchVolume: '5.100 pencarian/bln',
    image: IMG_RINJANI,
    summary: {
      id: 'Mengapa kombinasi naik jalur Sembalun dan turun jalur Torean kini menjadi rute favorit pendaki domestik maupun mancanegara? Simak perbandingan elevasi dan aturan tiket resmi TNGR.',
      en: 'Why ascending via Sembalun savanna and descending through Torean canyon has become the gold-standard 3D2N route for Mount Rinjani trekkers.'
    },
    bestSeason: { id: 'April – Desember (Taman Nasional Buka)', en: 'April – December (National Park Open)' },
    distanceFromAirport: '2,5 jam ke Desa Sembalun (1.156 mdpl)',
    contentSections: [
      {
        heading: {
          id: 'Keunggulan Naik via Sembalun & Turun via Lembah Torean',
          en: 'Why Ascend Sembalun & Descend via Torean Canyon'
        },
        body: {
          id: 'Memulai dari Sembalun (1.156 mdpl) memberi keuntungan elevasi awal 550 meter lebih tinggi dibanding Senaru (600 mdpl), sehingga hari pertama lebih hemat tenaga melewati savana terbuka. Saat turun dari Danau Segara Anak, jalur Torean menawarkan lembah sungai yang lebih landai tanpa harus menanjak kembali ke bibir kawah Senaru.',
          en: 'Starting in Sembalun (1,156m) gives you a 550-meter elevation head start compared to Senaru (600m). When descending from Segara Anak Lake, the Torean river canyon bypasses the steep climb back up the Senaru crater rim.'
        }
      }
    ]
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'rev-1',
    author: 'Nadia Putri & Reza Mahendra',
    role: { id: 'Wisatawan Honeymoon', en: 'Honeymoon Travelers' },
    organizationOrCity: 'Jakarta Selatan',
    segment: 'Domestik',
    packageTaken: { id: 'Paket Mandalika & 3 Gili Privat 3H2M', en: 'Mandalika & 3 Gili Private 3D2N' },
    tripDate: 'September 2026',
    quote: {
      id: 'Awalnya kami hampir pesan terpisah di aplikasi OTA, tapi setelah konsultasi via WhatsApp dengan tim Lombok Nusantara, kami hemat Rp 1,3 juta untuk 2 orang dan dapat kapal glass-bottom privat dari Teluk Nara. Video GoPro penyu di Gili Meno jernih sekali!',
      en: 'We almost booked piecemeal on OTAs, but booking direct with Lombok Nusantara saved us IDR 1.3M for two and upgraded us to a private boat from Teluk Nara. The GoPro turtle footage in Gili Meno was unforgettable!'
    },
    outcomeMetric: { id: 'Hemat 21% dibanding harga OTA + Gratis Dokumentasi GoPro', en: 'Saved 21% vs. OTA platforms + Free GoPro Footage' }
  },
  {
    id: 'rev-2',
    author: 'Lucas & Claire Dubois',
    role: { id: 'Wisatawan Mancanegara', en: 'International Travelers' },
    organizationOrCity: 'Lyon, France',
    segment: 'Mancanegara',
    packageTaken: { id: 'Ekspedisi Puncak Rinjani 3H2M + Fast Boat Bali', en: 'Rinjani Summit 3D2N + Bali Fast Boat' },
    tripDate: 'Agustus 2026',
    quote: {
      id: 'Dari penjemputan di pelabuhan Bangsal hingga puncak Rinjani 3.726m, semuanya terorganisir sangat rapi. Tenda sudah berdiri saat kami tiba di Pelawangan Sembalun, makanan hangat luar biasa lezat, dan pembayaran kartu internasional sangat mudah.',
      en: 'From harbor pickup in Bangsal to the 3,726m Rinjani summit, the organization was flawless. Our tent was already pitched at Sembalun Rim when we arrived, the mountain meals were restaurant quality, and international payment was seamless.'
    },
    outcomeMetric: { id: '100% Kuota Resmi e-Rinjani TNGR + Rasio Kru 1:2', en: '100% Official e-Rinjani Permit + 1:2 Crew Safety Ratio' }
  },
  {
    id: 'rev-3',
    author: 'Hendra Wijaya, S.T., M.M.',
    role: { id: 'VP Human Capital & General Affairs', en: 'VP Human Capital & General Affairs' },
    organizationOrCity: 'PT Sinergi Infrastruktur Nusantara (Surabaya)',
    segment: 'Korporat',
    packageTaken: { id: 'Gathering Korporat & MICE Mandalika 4H3M (68 Peserta)', en: 'Corporate Gathering & MICE Mandalika 4D3N (68 Pax)' },
    tripDate: 'Oktober 2026',
    quote: {
      id: 'Mengelola rombongan 68 karyawan butuh mitra lokal yang paham dokumen pajak PKP dan ketepatan waktu. Tim Lombok Nusantara menyiapkan 2 bus pariwisata baru, outbound pantai yang seru, dan Gala Dinner tepi pantai Senggigi tanpa satu pun kendala.',
      en: 'Managing 68 employees requires a local partner who understands corporate tax compliance and strict punctuality. Lombok Nusantara delivered two brand-new coaches, beach outbound games, and a beachfront Gala Dinner flawlessly.'
    },
    outcomeMetric: { id: '68 Peserta Korporat · Dokumen e-Faktur PKP Lengkap', en: '68 Corporate Pax · Full Tax Invoice & MICE Support' }
  }
];

export const AGENCY_BLUEPRINT_DATA = {
  timeline: [
    { week: 'Minggu 1', phase: 'Discovery & Perencanaan', deliverables: 'Audit kompetitor lokal Lombok, finalisasi 6 paket unggulan, riset keyword ID & EN', status: 'Selesai di Prototipe Ini' },
    { week: 'Minggu 2', phase: 'Desain UI/UX', deliverables: 'Desain editorial biru laut & aksen tenun songket, mobile-first booking flow, kalkulator transfer LOP', status: 'Selesai di Prototipe Ini' },
    { week: 'Minggu 3', phase: 'Persiapan Konten', deliverables: 'Fotografi asli Rinjani/Gili/Mandalika, tabel harga langsung vs OTA, artikel panduan SEO', status: 'Selesai di Prototipe Ini' },
    { week: 'Minggu 4–6', phase: 'Pengembangan Sistem', deliverables: 'Fitur dwibahasa (ID/EN) + dwi-mata uang (IDR/USD), filter paket, WhatsApp deep-link builder', status: 'Aktif & Berfungsi' },
    { week: 'Minggu 7', phase: 'Testing & Optimasi', deliverables: 'Uji responsivitas mobile, Schema.org TravelAgency JSON-LD, validasi form booking', status: 'Terverifikasi' },
    { week: 'Minggu 8', phase: 'Launch & Integrasi', deliverables: 'Koneksi domain .com/.id, Google Search Console, Google Business Profile & Payment Gateway', status: 'Siap Go-Live' }
  ],
  budgetItems: [
    { item: 'Domain (.com / .id) + Cloud Hosting SSL + Cloudflare CDN (1 Tahun)', minIdr: 1200000, maxIdr: 3000000 },
    { item: 'Desain UI/UX & Pengembangan Website Dwibahasa', minIdr: 6500000, maxIdr: 18000000 },
    { item: 'Produksi Foto Asli & Video Drone (Gili, Mandalika, Rinjani)', minIdr: 2500000, maxIdr: 8500000 },
    { item: 'Copywriting Dwibahasa & Optimasi SEO On-Page (Schema + 6 Artikel Awal)', minIdr: 2000000, maxIdr: 5500000 },
    { item: 'Pemeliharaan Bulanan, Backup & Laporan Search Console', minIdr: 350000, maxIdr: 950000 }
  ],
  seoKeywords: [
    { keyword: 'paket wisata lombok', lang: 'ID', intent: 'Transaksional', targetPage: '/paket/mandalika-sade-3h2m', estVolume: '14.800/bln' },
    { keyword: 'open trip gili trawangan', lang: 'ID', intent: 'Transaksional', targetPage: '/paket/snorkeling-3-gili', estVolume: '9.200/bln' },
    { keyword: 'itinerary 3 hari 2 malam lombok', lang: 'ID', intent: 'Informasional → Konversi', targetPage: '/blog/itinerary-3h2m-lombok', estVolume: '8.400/bln' },
    { keyword: 'lombok private tour & driver', lang: 'EN', intent: 'Transaksional (Intl)', targetPage: '/en/services/private-charter', estVolume: '5.600/bln' },
    { keyword: 'mount rinjani trekking package', lang: 'EN', intent: 'Transaksional (Intl)', targetPage: '/en/packages/rinjani-summit-3d2n', estVolume: '11.300/bln' },
    { keyword: 'lombok airport transfer to kuta / gili', lang: 'EN', intent: 'Transaksional (Intl)', targetPage: '/en/services/airport-transfer', estVolume: '4.900/bln' }
  ]
};
