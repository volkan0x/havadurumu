import React from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { WiDaySunny, WiNightClear, WiThermometer, WiHumidity, WiRaindrop } from 'react-icons/wi'

import cloud from '../../icons/cloud.png'
import fewcloud from '../../icons/mostly_sunny.png'
import midcloud from '../../icons/partly_sunny.png'
import sun from '../../icons/sunny.png'
import snow from '../../icons/snowflake.png'
import lightrain from '../../icons/partly_sunny_rain.png'
import moderaterain from '../../icons/rain_cloud.png'
import heavyrain from '../../icons/thunder_cloud_and_rain.png'
import { provinces } from '@/data/provinces'
import { getOrSetServerCache } from '@/lib/serverCache'
import Home from '../home'

const DESCRIPTION_MAP = {
  'overcast clouds': 'cok bulutlu',
  'broken clouds': 'parcali bulutlu',
  'scattered clouds': 'az bulutlu',
  'few clouds': 'az bulutlu',
  'heavy intensity rain': 'siddetli yagmur',
  'moderate rain': 'yagmurlu',
  'light rain': 'hafif yagmur',
  'sky is clear': 'gunesli',
  'rain and snow': 'karla karisik yagmur',
  'light snow': 'kar yagisli',
  Snow: 'kar yagisli'
}

const getWeatherIcon = (description) => {
  if (description === 'sky is clear') return sun
  if (description === 'light rain') return lightrain
  if (description === 'moderate rain') return moderaterain
  if (description === 'heavy intensity rain') return heavyrain
  if (description === 'overcast clouds') return cloud
  if (description === 'broken clouds') return midcloud
  if (description === 'scattered clouds' || description === 'few clouds') return fewcloud
  if (description === 'light snow' || description === 'rain and snow' || description === 'Snow') return snow
  return sun
}

const formatDate = (unixSeconds) => {
  if (!unixSeconds) return '-'
  return new Date(unixSeconds * 1000).toLocaleDateString('tr-TR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

const formatHour = (unixSeconds) => {
  if (!unixSeconds) return '-'
  return new Date(unixSeconds * 1000).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTemp = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--'
  return Math.round(value)
}

const getHumidityLevel = (humidity) => {
  if (typeof humidity !== 'number') return 'bilinmiyor'
  if (humidity >= 75) return 'yuksek nem'
  if (humidity >= 45) return 'orta nem'
  return 'dusuk nem'
}

const getRainLevel = (chance) => {
  if (chance >= 70) return 'yuksek risk'
  if (chance >= 35) return 'orta risk'
  return 'dusuk risk'
}

const normalizeCityLabel = (value) => {
  if (!value) return 'Sehir'
  return decodeURIComponent(value).replace(/-/g, ' ')
}

const mapForecastItems = (list = []) => {
  return list.slice(0, 15).map((item) => {
    const englishDescription = item?.weather?.[0]?.description ?? ''
    const rawDayTemp = item?.main?.temp_max
    const rawNightTemp = item?.main?.temp_min
    const rawFeelsLike = item?.main?.feels_like
    const humidity = item?.main?.humidity
    const rainChance = typeof item?.pop === 'number' ? Math.round(item.pop * 100) : 0
    const dayNightDiff =
      typeof rawDayTemp === 'number' && typeof rawNightTemp === 'number'
        ? Math.round(rawDayTemp - rawNightTemp)
        : null
    const feelsDiff =
      typeof rawFeelsLike === 'number' && typeof rawDayTemp === 'number'
        ? Math.round(rawFeelsLike - rawDayTemp)
        : null

    return {
      dt: item.dt,
      date: formatDate(item.dt),
      hour: formatHour(item.dt),
      dayTemp: formatTemp(rawDayTemp),
      nightTemp: formatTemp(rawNightTemp),
      feelsLike: formatTemp(rawFeelsLike),
      humidity: humidity ?? '--',
      rainChance,
      dayNightDiff,
      feelsDiff,
      humidityLevel: getHumidityLevel(humidity),
      rainLevel: getRainLevel(rainChance),
      description: DESCRIPTION_MAP[englishDescription] || englishDescription || 'bilinmiyor',
      englishDescription
    }
  })
}

const numericValues = (values) => values.filter((value) => typeof value === 'number')

const describeTrend = (firstValue, lastValue) => {
  if (typeof firstValue !== 'number' || typeof lastValue !== 'number') return 'dengeli'
  const diff = lastValue - firstValue
  if (diff >= 3) return 'yukselis'
  if (diff <= -3) return 'azalis'
  return 'dengeli'
}

const getSeasonFromUnix = (unixSeconds) => {
  if (!unixSeconds) return 'ilkbahar'
  const month = new Date(unixSeconds * 1000).getUTCMonth() + 1
  if (month === 12 || month === 1 || month === 2) return 'kis'
  if (month >= 3 && month <= 5) return 'ilkbahar'
  if (month >= 6 && month <= 8) return 'yaz'
  return 'sonbahar'
}

const getCityClimateType = (citySlug) => {
  const coastalCities = [
    'istanbul', 'izmir', 'antalya', 'mersin', 'adana', 'hatay', 'tekirdag', 'canakkale', 'balikesir', 'mugla',
    'aydin', 'samsun', 'ordu', 'giresun', 'trabzon', 'rize', 'sinop', 'zonguldak', 'bartin', 'kocaeli', 'sakarya',
    'yalova'
  ]

  const easternCities = [
    'erzurum', 'erzincan', 'kars', 'ardahan', 'igdir', 'agri', 'mus', 'bitlis', 'van', 'hakkari', 'sirnak',
    'siirt', 'bingol', 'tunceli', 'elazig', 'malatya', 'diyarbakir', 'batman', 'mardin', 'sanliurfa'
  ]

  if (coastalCities.includes(citySlug)) return 'sahil'
  if (easternCities.includes(citySlug)) return 'dogu'
  return 'ic'
}

const getVariantIndex = (seed, length) => {
  if (!length) return 0
  const safeSeed = String(seed || 'hava')
  let hash = 0

  for (let i = 0; i < safeSeed.length; i += 1) {
    hash = (hash * 31 + safeSeed.charCodeAt(i)) % 2147483647
  }

  return Math.abs(hash) % length
}

const pickVariant = (seed, options) => options[getVariantIndex(seed, options.length)]

const buildSeoNarrative = (cityLabel, citySlug, forecastItems) => {
  if (!forecastItems?.length) return null

  const current = forecastItems[0]
  const season = getSeasonFromUnix(current?.dt)
  const climateType = getCityClimateType(citySlug)
  const tomorrowItems = forecastItems.slice(8, 15)
  const weekItems = forecastItems.slice(0, 15)

  const weekDayTemps = numericValues(weekItems.map((item) => item.dayTemp))
  const weekNightTemps = numericValues(weekItems.map((item) => item.nightTemp))
  const weekRain = numericValues(weekItems.map((item) => item.rainChance))
  const weekHumidity = numericValues(weekItems.map((item) => item.humidity))

  const weekMax = weekDayTemps.length ? Math.max(...weekDayTemps) : null
  const weekMin = weekNightTemps.length ? Math.min(...weekNightTemps) : null
  const avgRain = weekRain.length ? Math.round(weekRain.reduce((sum, value) => sum + value, 0) / weekRain.length) : null
  const avgHumidity = weekHumidity.length ? Math.round(weekHumidity.reduce((sum, value) => sum + value, 0) / weekHumidity.length) : null

  const tomorrowMaxValues = numericValues(tomorrowItems.map((item) => item.dayTemp))
  const tomorrowMinValues = numericValues(tomorrowItems.map((item) => item.nightTemp))
  const tomorrowRainValues = numericValues(tomorrowItems.map((item) => item.rainChance))

  const tomorrowMax = tomorrowMaxValues.length ? Math.max(...tomorrowMaxValues) : null
  const tomorrowMin = tomorrowMinValues.length ? Math.min(...tomorrowMinValues) : null
  const tomorrowRain = tomorrowRainValues.length
    ? Math.round(tomorrowRainValues.reduce((sum, value) => sum + value, 0) / tomorrowRainValues.length)
    : null

  const tempTrend = describeTrend(weekDayTemps[0], weekDayTemps[weekDayTemps.length - 1])

  const trendOptions = {
    yukselis: [
      'hafta boyunca sicakliklarda kademeli bir artis bekleniyor',
      'sicaklik trendi gunler ilerledikce yukari yone kayiyor',
      'genel gorunum, daha sicak bir hafta akisini isaret ediyor'
    ],
    azalis: [
      'hafta boyunca sicakliklarda hissedilir bir dusus bekleniyor',
      'sicakliklar gun gun daha serin bir banda iniyor',
      'genel tahmin, hafta icinde serinlemenin one cikacagini gosteriyor'
    ],
    dengeli: [
      'hafta boyunca sicakliklar daha dengeli bir bantta seyredecek',
      'sicaklik degerleri hafta genelinde benzer araliklarda kalabilir',
      'haftalik tabloda belirgin bir kirilimdan cok dengeli bir seyir var'
    ]
  }

  const trendText = pickVariant(`${citySlug}-trend-${tempTrend}`, trendOptions[tempTrend])

  const seasonContextMap = {
    kis: [
      'Kis kosullarinda sabah ve gece saatlerinde sicaklik degisimi daha belirgin olabilir.',
      'Kis doneminde ozellikle sabah erken saatlerde daha soguk bir hissiyat olusabilir.',
      'Kis mevsiminde acik alanda plan yaparken ruzgar ve hissedilen sicaklik birlikte degerlendirilmelidir.'
    ],
    ilkbahar: [
      'Ilkbahar gecisinde gun icindeki hava degisimleri daha hizli yasanabilir.',
      'Ilkbahar doneminde sabah-serin, ogle-ilik dalgalanmasi daha sik gorulebilir.',
      'Ilkbahar kosullarinda gunluk planlarda saatlik sicaklik farklarini izlemek faydalidir.'
    ],
    yaz: [
      'Yaz doneminde ogle saatlerinde sicaklik yukselebilecegi icin acik hava planlari erken saatlere kaydirilabilir.',
      'Yaz mevsiminde yuksek sicaklik ve nem birlikte hissedilen degeri artirabilir.',
      'Yaz kosullarinda gunesin etkili oldugu saatlerde sicaklik takibi daha kritik hale gelir.'
    ],
    sonbahar: [
      'Sonbahar gecisinde sicakliklar gun gun daha degisken bir profile kayabilir.',
      'Sonbahar doneminde aksam saatlerinde serinleme daha hizli hissedilebilir.',
      'Sonbaharda plan yaparken yagis ihtimali ile sicaklik dususunu birlikte izlemek gerekir.'
    ]
  }

  const seasonContext = pickVariant(`${citySlug}-season-${season}`, seasonContextMap[season])

  const climateContextMap = {
    sahil: [
      'Sahil etkisi nedeniyle nem oranindaki degisimler hissedilen sicakligi belirgin sekilde etkileyebilir.',
      'Kiyiya yakin alanlarda nem ve ruzgar birlikte hissedilen hava durumunu hizla degistirebilir.',
      'Sahil sehirlerinde deniz etkisi, ayni sicaklikta bile farkli bir hissiyat olusturabilir.'
    ],
    ic: [
      'Ic bolge karakteri nedeniyle gece-gunduz sicaklik farklari daha belirgin olabilir.',
      'Karasal etki sebebiyle gun icinde sicaklik degisimi daha keskin bir profile kayabilir.',
      'Ic kesimlerde ozellikle sabah ve aksam saatlerinde sicaklik farki daha net hissedilebilir.'
    ],
    dogu: [
      'Dogu bolgesi ozelligi nedeniyle gece saatlerinde daha hizli serinleme gorulebilir.',
      'Yuksek rakim etkisi, dogu sehirlerinde sicaklik ve hissedilen deger arasindaki farki artirabilir.',
      'Dogu hattinda hava kosullari yer yer daha sert degisebildigi icin saatlik takip onem kazanir.'
    ]
  }

  const climateContext = pickVariant(`${citySlug}-climate-${climateType}`, climateContextMap[climateType])

  const todaySummary = pickVariant(`${citySlug}-today`, [
    `${cityLabel} bugun hava durumu: anlik sicaklik ${current.dayTemp}°C seviyesinde. Hissedilen deger ${current.feelsLike}°C, nem orani %${current.humidity} ve yagis olasiligi %${current.rainChance}. ${seasonContext} ${climateContext}`,
    `${cityLabel} icin bugunku tabloda sicaklik ${current.dayTemp}°C, hissedilen deger ise ${current.feelsLike}°C civarinda. Nem %${current.humidity} seviyesinde seyrederken yagis ihtimali %${current.rainChance}. ${seasonContext} ${climateContext}`,
    `${cityLabel} merkezli guncel tahminde termometre ${current.dayTemp}°C gosteriyor. Hissedilen sicaklik ${current.feelsLike}°C, nem %${current.humidity} ve yagis olasiligi %${current.rainChance} olarak izleniyor. ${seasonContext} ${climateContext}`
  ])

  const tomorrowSummary =
    typeof tomorrowMax === 'number' && typeof tomorrowMin === 'number'
      ? pickVariant(`${citySlug}-tomorrow`, [
          `${cityLabel} yarin tahmininde en yuksek sicaklik ${tomorrowMax}°C, en dusuk sicaklik ${tomorrowMin}°C gorunuyor. Ortalama yagis olasiligi %${tomorrowRain ?? 0} civarinda.`,
          `${cityLabel} yarin icin olusan projeksiyonda gunduz en yuksek ${tomorrowMax}°C, gece en dusuk ${tomorrowMin}°C bekleniyor. Tahmini yagis riski ortalama %${tomorrowRain ?? 0}.`,
          `${cityLabel} yarin hava gorunumunde sicaklik ${tomorrowMin}°C ile ${tomorrowMax}°C bandinda. Gunluk ortalama yagis olasiligi %${tomorrowRain ?? 0} seviyesine yakin.`
        ])
      : pickVariant(`${citySlug}-tomorrow-fallback`, [
          `${cityLabel} yarin hava durumu verileri gun icinde guncellenmektedir. En dogru sonuc icin saatlik tahmin kartlarini takip edebilirsiniz.`,
          `${cityLabel} icin yarin tahmini yeni veri akisiyla birlikte yenilenir. Saatlik kartlar, degisimi en yakindan izlemenizi saglar.`,
          `${cityLabel} yarin hava beklentisi sistem tarafinda periyodik olarak guncellenir. Net tablo icin saatlik gorunumu kontrol etmek faydalidir.`
        ])

  const weekSummary =
    typeof weekMax === 'number' && typeof weekMin === 'number'
      ? pickVariant(`${citySlug}-week`, [
          `${cityLabel} 15 gunluk tahminde sicakliklar genel olarak ${weekMin}°C ile ${weekMax}°C araliginda. Bu gorunume gore ${trendText}. ${seasonContext}`,
          `${cityLabel} genel tahmininde onumuzdeki gunlerde sicaklik bandi ${weekMin}°C - ${weekMax}°C araliginda olusuyor. Veriler, ${trendText}. ${seasonContext}`,
          `${cityLabel} icin 15 gunluk projeksiyon ${weekMin}°C ile ${weekMax}°C arasinda bir tablo ciziyor. Bu aralik, ${trendText}. ${seasonContext}`
        ])
      : pickVariant(`${citySlug}-week-fallback`, [
          `${cityLabel} 15 gunluk hava durumu gorunumunde sicaklik trendi olusmaya devam ediyor. ${seasonContext}`,
          `${cityLabel} icin orta vade tahmin verileri geldikce sicaklik resmi netlesecektir. ${seasonContext}`,
          `${cityLabel} 15 gunluk tabloda sicaklik yonu yeni olcumlerle birlikte belirginlesir. ${seasonContext}`
        ])

  const rainSummary =
    typeof avgRain === 'number' && typeof avgHumidity === 'number'
      ? pickVariant(`${citySlug}-rain`, [
          `${cityLabel} icin ortalama yagis olasiligi %${avgRain}, ortalama nem degeri ise %${avgHumidity}. Acik hava planlari icin ozellikle yuksek yagis saatlerini dikkate almak faydali olur. ${climateContext}`,
          `${cityLabel} haftalik ortalamalarda yagis riski %${avgRain}, nem ise %${avgHumidity} duzeyinde. Disaridaki planlar icin nem ve yagis saatleri birlikte degerlendirilmelidir. ${climateContext}`,
          `${cityLabel} tarafinda tahmini ortalama yagis olasiligi %${avgRain} olurken nem ortalamasi %${avgHumidity} seviyesinde. Plan yaparken yuksek riskli zaman dilimlerine oncelik vermek yararli olur. ${climateContext}`
        ])
      : pickVariant(`${citySlug}-rain-fallback`, [
          `${cityLabel} icin yagis ve nem verileri duzenli olarak guncellenmektedir. ${climateContext}`,
          `${cityLabel} tarafinda yagis ve nem gostergeleri veri geldikce yenilenir. ${climateContext}`,
          `${cityLabel} nem ve yagis tablolari gun icinde birden fazla kez guncellenir. ${climateContext}`
        ])

  return {
    todaySummary,
    tomorrowSummary,
    weekSummary,
    rainSummary
  }
}

const buildInternalCityLinkGroups = (currentSlug, maxItems = 8) => {
  const featuredSlugs = ['istanbul', 'ankara', 'izmir', 'bursa', 'antalya', 'konya', 'adana', 'trabzon']
  const currentClimate = getCityClimateType(currentSlug)

  const popular = featuredSlugs
    .map((slug) => provinces.find((city) => city.slug === slug))
    .filter((city) => city && city.slug !== currentSlug)

  const similarClimate = provinces
    .filter((city) => city.slug !== currentSlug && !featuredSlugs.includes(city.slug))
    .filter((city) => getCityClimateType(city.slug) === currentClimate)
    .slice(0, maxItems)

  return {
    popular: popular.slice(0, maxItems),
    similarClimate
  }
}

export default function WeatherCityPage({ cityLabel, citySlug, forecastItems, apiError, updatedAt, internalLinkGroups }) {
  const current = forecastItems?.[0]
  const todayItems = forecastItems.slice(0, 8)
  const todayMaxValues = todayItems.map((item) => item.dayTemp).filter((v) => typeof v === 'number')
  const todayMinValues = todayItems.map((item) => item.nightTemp).filter((v) => typeof v === 'number')
  const todayMax = todayMaxValues.length ? Math.max(...todayMaxValues) : '--'
  const todayMin = todayMinValues.length ? Math.min(...todayMinValues) : '--'

  const seoTitle = `${cityLabel} Hava Durumu 15 Gunluk Tahmin`
  const seoDescription = `${cityLabel} icin anlik ve 15 gunluk hava durumu tahmini. Sicaklik, hissedilen, nem ve yagis olasiligini saatlik olarak takip edin.`
  const canonicalUrl = `https://www.havadurumu15.com/hava/${citySlug}`
  const isIndexable = !apiError && forecastItems.length > 0
  const ogImage = 'https://www.havadurumu15.com/logo4x.png'
  const seoNarrative = buildSeoNarrative(cityLabel, citySlug, forecastItems)

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: seoTitle,
    description: seoDescription,
    inLanguage: 'tr-TR',
    url: canonicalUrl,
    dateModified: updatedAt || new Date().toISOString()
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Ana Sayfa',
        item: 'https://www.havadurumu15.com/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: `${cityLabel} Hava Durumu`,
        item: canonicalUrl
      }
    ]
  }

  const faqSchema = seoNarrative
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `${cityLabel} bugun hava nasil?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: seoNarrative.todaySummary
            }
          },
          {
            '@type': 'Question',
            name: `${cityLabel} yarin yagis bekleniyor mu?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: seoNarrative.tomorrowSummary
            }
          }
        ]
      }
    : null

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        {!isIndexable && <meta name="robots" content="noindex, nofollow" />}
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang="tr-TR" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Havadurumu15" />
        <meta property="og:locale" content="tr_TR" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:alt" content={`${cityLabel} hava durumu gorseli`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      </Head>

      <Home iFrame={true} Cardd={false} showLocalCityPanel={false}>
        <section className="mx-auto w-full max-w-6xl px-4 pb-8 pt-2 text-slate-100">
          <div className="rounded-2xl border border-slate-200/20 bg-transparent p-5 shadow-[0_16px_40px_rgba(15,23,42,0.3)] backdrop-blur-md md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/90">Sehir Detay Tahmini</p>
                <h1 className="mt-2 text-2xl font-bold capitalize sm:text-3xl">{cityLabel} hava durumu 15 gunluk</h1>
                <p className="mt-2 text-sm text-slate-300">3 saatlik guncel tahmin kartlari ve temel metrikler</p>
              </div>

              {current && (
                <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-200/20 bg-transparent p-3 text-center text-sm md:min-w-[320px] backdrop-blur-sm">
                  <div>
                    <p className="text-slate-300">Anlik</p>
                    <p className="mt-1 text-lg font-semibold">{current.dayTemp}°C</p>
                  </div>
                  <div>
                    <p className="text-slate-300">Bugun max</p>
                    <p className="mt-1 text-lg font-semibold">{todayMax}°C</p>
                  </div>
                  <div>
                    <p className="text-slate-300">Bugun min</p>
                    <p className="mt-1 text-lg font-semibold">{todayMin}°C</p>
                  </div>
                </div>
              )}
            </div>

            {apiError && (
              <p className="mt-4 rounded-lg border border-red-400/30 bg-red-900/40 px-4 py-3 text-sm text-red-100">
                {apiError}
              </p>
            )}
          </div>

          {!apiError && forecastItems.length > 0 && (
            <>
              <div className="mt-5 grid gap-5 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-3">
                {forecastItems.map((item) => (
                  <article
                    key={item.dt}
                    className="rounded-xl border border-slate-200/20 bg-transparent p-4 shadow-sm transition hover:border-cyan-300/40 backdrop-blur-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-transparent border border-slate-300/25 backdrop-blur-sm">
                          <Image src={getWeatherIcon(item.englishDescription)} alt="hava ikonu" className="h-7 w-7 object-contain" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-100">{item.date}</p>
                          <p className="text-xs text-slate-300">Saat {item.hour}</p>
                        </div>
                      </div>

                      <span className="rounded-full border border-slate-200/25 bg-transparent px-3 py-1 text-xs font-medium uppercase tracking-wide text-cyan-200 backdrop-blur-sm">
                        {item.description}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-3 lg:grid-cols-5">
                      <div className="rounded-lg border border-slate-500/40 bg-transparent px-3 py-2 shadow-inner shadow-black/10 backdrop-blur-sm">
                        <div className="flex items-center gap-1.5 text-cyan-200">
                          <WiDaySunny size={18} />
                          <p className="text-xs font-semibold uppercase tracking-wide">Gunduz</p>
                        </div>
                        <p className="mt-1.5 text-base font-bold text-slate-100">{item.dayTemp}°C</p>
                        <p className="mt-1 text-[11px] text-slate-300">
                          {item.dayNightDiff === null
                            ? 'Gece farki bilinmiyor'
                            : `${Math.abs(item.dayNightDiff)}°C ${item.dayNightDiff >= 0 ? 'daha sicak' : 'daha serin'}`}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-500/40 bg-transparent px-3 py-2 shadow-inner shadow-black/10 backdrop-blur-sm">
                        <div className="flex items-center gap-1.5 text-cyan-200">
                          <WiNightClear size={18} />
                          <p className="text-xs font-semibold uppercase tracking-wide">Gece</p>
                        </div>
                        <p className="mt-1.5 text-base font-bold text-slate-100">{item.nightTemp}°C</p>
                        <p className="mt-1 text-[11px] text-slate-300">
                          {item.dayNightDiff === null
                            ? 'Gunduz farki bilinmiyor'
                            : `${Math.abs(item.dayNightDiff)}°C ${item.dayNightDiff >= 0 ? 'daha serin' : 'daha sicak'}`}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-500/40 bg-transparent px-3 py-2 shadow-inner shadow-black/10 backdrop-blur-sm">
                        <div className="flex items-center gap-1.5 text-cyan-200">
                          <WiThermometer size={18} />
                          <p className="text-xs font-semibold uppercase tracking-wide">Hissedilen</p>
                        </div>
                        <p className="mt-1.5 text-base font-bold text-slate-100">{item.feelsLike}°C</p>
                        <p className="mt-1 text-[11px] text-slate-300">
                          {item.feelsDiff === null
                            ? 'Karsilastirma yok'
                            : `${Math.abs(item.feelsDiff)}°C ${item.feelsDiff >= 0 ? 'daha sicak hissedilir' : 'daha serin hissedilir'}`}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-500/40 bg-transparent px-3 py-2 shadow-inner shadow-black/10 backdrop-blur-sm">
                        <div className="flex items-center gap-1.5 text-cyan-200">
                          <WiHumidity size={18} />
                          <p className="text-xs font-semibold uppercase tracking-wide">Nem</p>
                        </div>
                        <p className="mt-1.5 text-base font-bold text-slate-100">%{item.humidity}</p>
                        <p className="mt-1 text-[11px] text-slate-300">{item.humidityLevel}</p>
                      </div>
                      <div className="rounded-lg border border-slate-500/40 bg-transparent px-3 py-2 shadow-inner shadow-black/10 backdrop-blur-sm">
                        <div className="flex items-center gap-1.5 text-cyan-200">
                          <WiRaindrop size={18} />
                          <p className="text-xs font-semibold uppercase tracking-wide">Yagis</p>
                        </div>
                        <p className="mt-1.5 text-base font-bold text-slate-100">%{item.rainChance}</p>
                        <p className="mt-1 text-[11px] text-slate-300">{item.rainLevel}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="h-fit rounded-xl border border-slate-200/20 bg-transparent p-4 backdrop-blur-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-200">Hizli Bilgiler</h2>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="rounded-lg bg-transparent border border-slate-500/35 px-3 py-2 backdrop-blur-sm">
                    <p className="text-slate-300">Sehir</p>
                    <p className="mt-1 font-medium capitalize text-slate-100">{cityLabel}</p>
                  </div>
                  <div className="rounded-lg bg-transparent border border-slate-500/35 px-3 py-2 backdrop-blur-sm">
                    <p className="text-slate-300">Son guncelleme</p>
                    <p className="mt-1 font-medium text-slate-100">{current ? `${current.date} ${current.hour}` : '-'}</p>
                  </div>
                  <div className="rounded-lg bg-transparent border border-slate-500/35 px-3 py-2 backdrop-blur-sm">
                    <p className="text-slate-300">Durum</p>
                    <p className="mt-1 font-medium text-slate-100">{current?.description || '-'}</p>
                  </div>
                </div>
              </aside>
              </div>

              {seoNarrative && (
                <article className="mt-5 rounded-2xl border border-slate-200/20 bg-transparent p-5 md:p-6 backdrop-blur-sm">
                  <h2 className="text-xl font-semibold text-cyan-200">{cityLabel} Hava Durumu Yorumu</h2>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-slate-200 md:text-base">
                    <section>
                      <h3 className="text-base font-semibold text-slate-100">Bugun Beklenen Hava</h3>
                      <p className="mt-1">{seoNarrative.todaySummary}</p>
                    </section>
                    <section>
                      <h3 className="text-base font-semibold text-slate-100">Yarin ve Kisa Vade Tahmin</h3>
                      <p className="mt-1">{seoNarrative.tomorrowSummary}</p>
                    </section>
                    <section>
                      <h3 className="text-base font-semibold text-slate-100">15 Gunluk Sicaklik Trendi</h3>
                      <p className="mt-1">{seoNarrative.weekSummary}</p>
                    </section>
                    <section>
                      <h3 className="text-base font-semibold text-slate-100">Yagis ve Nem Analizi</h3>
                      <p className="mt-1">{seoNarrative.rainSummary}</p>
                    </section>
                  </div>
                </article>
              )}

              {(internalLinkGroups?.popular?.length > 0 || internalLinkGroups?.similarClimate?.length > 0) && (
                <section className="mt-5 rounded-2xl border border-slate-200/20 bg-transparent p-5 md:p-6 backdrop-blur-sm">
                  <h2 className="text-lg font-semibold text-cyan-200">Diger Sehirlerin 15 Gunluk Tahminleri</h2>

                  {internalLinkGroups?.popular?.length > 0 && (
                    <div className="mt-3">
                      <h3 className="text-sm font-semibold text-slate-200">Populer Sehirler</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {internalLinkGroups.popular.map((city) => (
                          <Link
                            key={`popular-${city.slug}`}
                            href={`/hava/${city.slug}`}
                            className="rounded-full border border-slate-300/25 bg-transparent px-3 py-1.5 text-sm text-slate-100 transition hover:border-cyan-300/60 hover:bg-white/10"
                          >
                            {city.name} hava durumu
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {internalLinkGroups?.similarClimate?.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-slate-200">Benzer Iklim Sehirleri</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {internalLinkGroups.similarClimate.map((city) => (
                          <Link
                            key={`climate-${city.slug}`}
                            href={`/hava/${city.slug}`}
                            className="rounded-full border border-slate-300/25 bg-transparent px-3 py-1.5 text-sm text-slate-100 transition hover:border-cyan-300/60 hover:bg-white/10"
                          >
                            {city.name} hava durumu
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </section>
      </Home>
    </>
  )
}

export async function getServerSideProps(context) {
  context.res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1800')

  const cityParam = typeof context?.params?.city === 'string' ? context.params.city : ''
  const cityLabel = normalizeCityLabel(cityParam)
  const cityQuery = cityLabel

  const weatherApiKey = process.env.WEATHER_KEY || process.env.NEXT_PUBLIC_WEATHER_KEY

  if (!cityParam || !weatherApiKey) {
    return {
      props: {
        cityLabel,
        citySlug: cityParam || 'sehir',
        forecastItems: [],
        internalLinkGroups: buildInternalCityLinkGroups(cityParam || ''),
        apiError: !weatherApiKey
          ? 'Sunucu API anahtari tanimli degil. WEATHER_KEY veya NEXT_PUBLIC_WEATHER_KEY ayarlayin.'
          : 'Gecerli bir sehir bulunamadi.',
        updatedAt: new Date().toISOString()
      }
    }
  }

  try {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityQuery)}&limit=1&appid=${weatherApiKey}`
    const geoCacheKey = `geo:${cityQuery.toLowerCase()}`
    const { data: geoResult } = await getOrSetServerCache(geoCacheKey, 24 * 60 * 60 * 1000, async () => {
      const response = await fetch(geoUrl)
      const data = await response.json()
      return {
        ok: response.ok,
        data
      }
    })

    const geoResponseOk = geoResult?.ok
    const geoData = geoResult?.data

    if (!geoResponseOk || !Array.isArray(geoData) || geoData.length === 0) {
      return {
        props: {
          cityLabel,
          citySlug: cityParam,
          forecastItems: [],
          internalLinkGroups: buildInternalCityLinkGroups(cityParam),
          apiError: 'Sehir bulunamadi. Lutfen baska bir sehir deneyin.',
          updatedAt: new Date().toISOString()
        }
      }
    }

    const { lat, lon, name } = geoData[0]
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=40&appid=${weatherApiKey}`
    const forecastCacheKey = `forecast:${Number(lat).toFixed(3)}:${Number(lon).toFixed(3)}`
    const { data: forecastResult } = await getOrSetServerCache(forecastCacheKey, 10 * 60 * 1000, async () => {
      const response = await fetch(forecastUrl)
      const data = await response.json()
      return {
        ok: response.ok,
        data
      }
    })

    const forecastResponseOk = forecastResult?.ok
    const forecastData = forecastResult?.data

    if (!forecastResponseOk || !Array.isArray(forecastData?.list)) {
      return {
        props: {
          cityLabel: name || cityLabel,
          citySlug: cityParam,
          forecastItems: [],
          internalLinkGroups: buildInternalCityLinkGroups(cityParam),
          apiError: 'Hava durumu verisi alinamadi. Daha sonra tekrar deneyin.',
          updatedAt: new Date().toISOString()
        }
      }
    }

    return {
      props: {
        cityLabel: name || cityLabel,
        citySlug: cityParam,
        forecastItems: mapForecastItems(forecastData.list),
        internalLinkGroups: buildInternalCityLinkGroups(cityParam),
        apiError: '',
        updatedAt: new Date().toISOString()
      }
    }
  } catch (error) {
    return {
      props: {
        cityLabel,
        citySlug: cityParam,
        forecastItems: [],
        internalLinkGroups: buildInternalCityLinkGroups(cityParam),
        apiError: 'Hava durumu verisi alinamadi. Ag baglantinizi veya API ayarlarini kontrol edin.',
        updatedAt: new Date().toISOString()
      }
    }
  }
}
