import React from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { WiDaySunny, WiNightClear, WiThermometer, WiHumidity, WiRaindrop } from 'react-icons/wi'

import cloud from '../../icons/cloud.png'
import fewcloud from '../../icons/mostly_sunny.png'
import midcloud from '../../icons/partly_sunny.png'
import sun from '../../icons/sunny.png'
import snow from '../../icons/snowflake.png'
import lightrain from '../../icons/partly_sunny_rain.png'
import moderaterain from '../../icons/rain_cloud.png'
import heavyrain from '../../icons/thunder_cloud_and_rain.png'
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

export default function WeatherCityPage({ cityLabel, citySlug, forecastItems, apiError, updatedAt }) {
  const current = forecastItems?.[0]
  const todayItems = forecastItems.slice(0, 8)
  const todayMaxValues = todayItems.map((item) => item.dayTemp).filter((v) => typeof v === 'number')
  const todayMinValues = todayItems.map((item) => item.nightTemp).filter((v) => typeof v === 'number')
  const todayMax = todayMaxValues.length ? Math.max(...todayMaxValues) : '--'
  const todayMin = todayMinValues.length ? Math.min(...todayMinValues) : '--'

  const seoTitle = `${cityLabel} Hava Durumu 15 Gunluk Tahmin`
  const seoDescription = `${cityLabel} icin anlik ve 15 gunluk hava durumu tahmini. Sicaklik, hissedilen, nem ve yagis olasiligini saatlik olarak takip edin.`
  const canonicalUrl = `https://www.havadurumu15.com/hava/${citySlug}`

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

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="tr_TR" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <Home iFrame={true} Cardd={false} showLocalCityPanel={false}>
        <section className="mx-auto w-full max-w-6xl px-4 pb-8 pt-2 text-slate-100">
          <div className="rounded-2xl border border-slate-200/20 bg-slate-900/40 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.3)] backdrop-blur-md md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/90">Sehir Detay Tahmini</p>
                <h1 className="mt-2 text-2xl font-bold capitalize sm:text-3xl">{cityLabel} hava durumu 15 gunluk</h1>
                <p className="mt-2 text-sm text-slate-300">3 saatlik guncel tahmin kartlari ve temel metrikler</p>
              </div>

              {current && (
                <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-200/20 bg-slate-800/50 p-3 text-center text-sm md:min-w-[320px]">
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
            <div className="mt-5 grid gap-5 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-3">
                {forecastItems.map((item) => (
                  <article
                    key={item.dt}
                    className="rounded-xl border border-slate-200/20 bg-slate-900/45 p-4 shadow-sm transition hover:border-cyan-300/40"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800/70">
                          <Image src={getWeatherIcon(item.englishDescription)} alt="hava ikonu" className="h-7 w-7 object-contain" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-100">{item.date}</p>
                          <p className="text-xs text-slate-300">Saat {item.hour}</p>
                        </div>
                      </div>

                      <span className="rounded-full border border-slate-200/25 bg-slate-800/70 px-3 py-1 text-xs font-medium uppercase tracking-wide text-cyan-200">
                        {item.description}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-3 lg:grid-cols-5">
                      <div className="rounded-lg border border-slate-500/40 bg-slate-800/75 px-3 py-2 shadow-inner shadow-black/10">
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
                      <div className="rounded-lg border border-slate-500/40 bg-slate-800/75 px-3 py-2 shadow-inner shadow-black/10">
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
                      <div className="rounded-lg border border-slate-500/40 bg-slate-800/75 px-3 py-2 shadow-inner shadow-black/10">
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
                      <div className="rounded-lg border border-slate-500/40 bg-slate-800/75 px-3 py-2 shadow-inner shadow-black/10">
                        <div className="flex items-center gap-1.5 text-cyan-200">
                          <WiHumidity size={18} />
                          <p className="text-xs font-semibold uppercase tracking-wide">Nem</p>
                        </div>
                        <p className="mt-1.5 text-base font-bold text-slate-100">%{item.humidity}</p>
                        <p className="mt-1 text-[11px] text-slate-300">{item.humidityLevel}</p>
                      </div>
                      <div className="rounded-lg border border-slate-500/40 bg-slate-800/75 px-3 py-2 shadow-inner shadow-black/10">
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

              <aside className="h-fit rounded-xl border border-slate-200/20 bg-slate-900/45 p-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-200">Hizli Bilgiler</h2>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="rounded-lg bg-slate-800/60 px-3 py-2">
                    <p className="text-slate-300">Sehir</p>
                    <p className="mt-1 font-medium capitalize text-slate-100">{cityLabel}</p>
                  </div>
                  <div className="rounded-lg bg-slate-800/60 px-3 py-2">
                    <p className="text-slate-300">Son guncelleme</p>
                    <p className="mt-1 font-medium text-slate-100">{current ? `${current.date} ${current.hour}` : '-'}</p>
                  </div>
                  <div className="rounded-lg bg-slate-800/60 px-3 py-2">
                    <p className="text-slate-300">Durum</p>
                    <p className="mt-1 font-medium text-slate-100">{current?.description || '-'}</p>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </section>
      </Home>
    </>
  )
}

export async function getServerSideProps(context) {
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
        apiError: !weatherApiKey
          ? 'Sunucu API anahtari tanimli degil. WEATHER_KEY veya NEXT_PUBLIC_WEATHER_KEY ayarlayin.'
          : 'Gecerli bir sehir bulunamadi.',
        updatedAt: new Date().toISOString()
      }
    }
  }

  try {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityQuery)}&limit=1&appid=${weatherApiKey}`
    const geoResponse = await fetch(geoUrl)
    const geoData = await geoResponse.json()

    if (!geoResponse.ok || !Array.isArray(geoData) || geoData.length === 0) {
      return {
        props: {
          cityLabel,
          citySlug: cityParam,
          forecastItems: [],
          apiError: 'Sehir bulunamadi. Lutfen baska bir sehir deneyin.',
          updatedAt: new Date().toISOString()
        }
      }
    }

    const { lat, lon, name } = geoData[0]
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=40&appid=${weatherApiKey}`
    const forecastResponse = await fetch(forecastUrl)
    const forecastData = await forecastResponse.json()

    if (!forecastResponse.ok || !Array.isArray(forecastData?.list)) {
      return {
        props: {
          cityLabel: name || cityLabel,
          citySlug: cityParam,
          forecastItems: [],
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
        apiError: 'Hava durumu verisi alinamadi. Ag baglantinizi veya API ayarlarini kontrol edin.',
        updatedAt: new Date().toISOString()
      }
    }
  }
}
