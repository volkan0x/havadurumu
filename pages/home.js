import Head from 'next/head'
import React, { useEffect, useMemo, useState } from 'react'
import { BsSearch } from 'react-icons/bs'
import { WiDaySunny, WiNightClear, WiThermometer, WiHumidity, WiRaindrop } from 'react-icons/wi'
import { Analytics } from '@vercel/analytics/react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import axios from 'axios'

import App from '@/components/Weather3'
import Logo from '@/public/logo4x.png'
import cloud from '../icons/cloud.png'
import fewcloud from '../icons/mostly_sunny.png'
import midcloud from '../icons/partly_sunny.png'
import sun from '../icons/sunny.png'
import snow from '../icons/snowflake.png'
import lightrain from '../icons/partly_sunny_rain.png'
import moderaterain from '../icons/rain_cloud.png'
import heavyrain from '../icons/thunder_cloud_and_rain.png'


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

const Home = ({ children, Cardd = true, iFrame = true, showLocalCityPanel = true }) => {
  const [city, setCity] = useState('')
  const [detectedCity, setDetectedCity] = useState('')
  const [localWeather, setLocalWeather] = useState(null)
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter();
  const weatherApiKey = process.env.NEXT_PUBLIC_WEATHER_KEY

  useEffect(() => {
    const detectCityFromIp = async () => {
      try {
        const response = await axios.get('https://ipapi.co/json/')
        const ipCity = response?.data?.city

        if (ipCity) {
          setDetectedCity(ipCity)
          setCity(ipCity)
          return
        }
      } catch (error) {
        console.error('IP konum bilgisi alinamadi:', error)
      }

      const fallbackCity = 'Istanbul'
      setDetectedCity(fallbackCity)
      setCity(fallbackCity)
    }

    if (showLocalCityPanel) {
      detectCityFromIp()
    }
  }, [showLocalCityPanel])

  useEffect(() => {
    const fetchLocalWeather = async () => {
      if (!showLocalCityPanel || !detectedCity) return

      if (!weatherApiKey) {
        setApiError('NEXT_PUBLIC_WEATHER_KEY tanimli degil. Lutfen .env.local dosyasina OpenWeather API key ekleyin.')
        return
      }

      setLoading(true)
      setApiError('')

      try {
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${detectedCity}&limit=1&appid=${weatherApiKey}`
        const geoResponse = await axios.get(geoUrl)

        if (!geoResponse.data?.length) {
          setApiError('IP adresinize gore sehir bulunamadi.')
          setLocalWeather(null)
          return
        }

        const { lat, lon } = geoResponse.data[0]
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=40&appid=${weatherApiKey}`
        const forecastResponse = await axios.get(forecastUrl)
        setLocalWeather(forecastResponse.data)
      } catch (error) {
        const apiMessage = error?.response?.data?.message
        setApiError(apiMessage ? `API hatasi: ${apiMessage}` : 'Yerel sehir hava durumu alinamadi.')
        setLocalWeather(null)
      } finally {
        setLoading(false)
      }
    }

    fetchLocalWeather()
  }, [detectedCity, showLocalCityPanel, weatherApiKey])

  const forecastItems = useMemo(() => {
    const list = localWeather?.list ?? []
    return list.slice(0, 8).map((item) => {
      const englishDescription = item?.weather?.[0]?.description ?? ''
      const rawDayTemp = item?.main?.temp_max
      const rawNightTemp = item?.main?.temp_min
      const rawFeelsLike = item?.main?.feels_like
      const humidity = item?.main?.humidity
      const rainChance = typeof item?.pop === 'number' ? Math.round(item.pop * 100) : 0
      const dayNightDiff = (typeof rawDayTemp === 'number' && typeof rawNightTemp === 'number')
        ? Math.round(rawDayTemp - rawNightTemp)
        : null
      const feelsDiff = (typeof rawFeelsLike === 'number' && typeof rawDayTemp === 'number')
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
        icon: getWeatherIcon(englishDescription)
      }
    })
  }, [localWeather])

  const current = forecastItems[0]
  const todayMaxValues = forecastItems.map((item) => item.dayTemp).filter((v) => typeof v === 'number')
  const todayMinValues = forecastItems.map((item) => item.nightTemp).filter((v) => typeof v === 'number')
  const todayMax = todayMaxValues.length ? Math.max(...todayMaxValues) : '--'
  const todayMin = todayMinValues.length ? Math.min(...todayMinValues) : '--'

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const normalizedCity = city.trim()
    if (!normalizedCity) return
    router.push(`/hava/${encodeURIComponent(normalizedCity)}`)
  }

  const canonicalUrl = 'https://www.havadurumu15.com/'
  const homeTitle = 'Hava Durumu 15 Gunluk | Turkiye Il Il Tahmin'
  const homeDescription = 'Turkiye geneli il il 15 gunluk hava durumu tahminleri, anlik sicaklik, nem ve yagis olasiligi verileri.'

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Havadurumu15',
    inLanguage: 'tr-TR',
    url: canonicalUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.havadurumu15.com/hava/{search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  }


    return (
        <div>
          <Head>
            <title>{homeTitle}</title>
            <meta name='description' content={homeDescription}/>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'/>
            <link rel='canonical' href={canonicalUrl}/>
            <link rel='icon' href='/favicon.ico'/>
            <meta property='og:type' content='website'/>
            <meta property='og:locale' content='tr_TR'/>
            <meta property='og:title' content={homeTitle}/>
            <meta property='og:description' content={homeDescription}/>
            <meta property='og:url' content={canonicalUrl}/>
            <meta name='twitter:card' content='summary_large_image'/>
            <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }} />
          </Head>
          <nav className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 -left-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl"></div>
              <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"></div>
            </div>
            <div className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6">
              <Link href="/" className="flex items-center gap-3">
                <Image className="h-8 w-8"
                     src={Logo}
                     alt="Havadurumu logo"/>
                <span className="text-sm font-semibold tracking-wide text-slate-100">Havadurumu</span>
              </Link>

              <div className="flex items-center gap-2 rounded-full border border-slate-300/30 bg-slate-900/40 p-1 backdrop-blur-md">
                <Link
                  href="/"
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700/70"
                >
                  Ana Sayfa
                </Link>
                <Link
                  href="/#sehirler"
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700/70"
                >
                  Sehirler
                </Link>
              </div>
            </div>
            <div className="flex lg:px-4 sm:px-6">
              <div className="relative flex h-16 items-center ">
                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                </div>
              </div>
            </div>
            <div className='relative z-10 py-10 px-4 mx-auto text-center'>
              <p className='inline-flex items-center rounded-full border border-cyan-200/20 bg-slate-900/40 px-4 py-1 text-xs font-semibold tracking-[0.2em] text-cyan-200 uppercase'>
                Anlık ve 15 günlük hava görünümü
              </p>
              <h1 className='mx-auto mt-4 max-w-3xl text-3xl font-extrabold leading-tight text-slate-100 sm:text-4xl lg:text-5xl'>
                15 günlük hava durumu tahminlerini inceleyin,
                <span className='block text-cyan-300'>yağış haritalarını tek ekranda takip edin.</span>
              </h1>
              <p className='mx-auto mt-4 max-w-2xl text-sm text-slate-300 sm:text-base'>
                Şehrinizi arayın; sıcaklık, rüzgar ve yağış trendlerini sade ve hızlı bir arayüzle görüntüleyin.
              </p>
            </div>
            <div className={'relative z-10 flex justify-between items-center m-auto px-4 pb-12 text-white'}>
              <form onSubmit={handleSearchSubmit}
                    className={'flex justify-between w-full sm:w-[80%] lg:w-[46%] items-center m-auto px-4 py-2.5 bg-slate-900/45 border border-slate-300/30 text-white rounded-2xl backdrop-blur-md shadow-[0_12px_40px_rgba(15,23,42,0.35)]'}>
                <div>
                  <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={'w-full bg-transparent border-none text-slate-100 placeholder:text-slate-300/80 focus:outline-none text-sm sm:text-base'}
                      type="text"
                      placeholder="Şehir ara"/>
                </div>
                <button type="submit" className='rounded-xl bg-cyan-400/90 p-2 text-slate-900 transition hover:bg-cyan-300' >
                  <BsSearch size={20}/>
                </button>
              </form>
            </div>
            {showLocalCityPanel && (
              <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-10 text-slate-100">
                <div className="rounded-2xl border border-slate-200/20 bg-slate-900/40 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.3)] backdrop-blur-md md:p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/90">Konumunuza gore tahmin</p>
                      <h2 className="mt-2 text-2xl font-bold capitalize sm:text-3xl">{detectedCity || 'Sehir'} hava durumu</h2>
                      <p className="mt-2 text-sm text-slate-300">IP adresinize gore ilk 24 saatlik 3 saatlik tahmin kartlari</p>
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

                  {loading && (
                    <p className="mt-4 rounded-xl border border-slate-200/20 bg-slate-900/40 px-4 py-3 text-sm text-slate-200">
                      Veriler yukleniyor...
                    </p>
                  )}

                  {!loading && !apiError && forecastItems.length > 0 && (
                    <div className="mt-5 space-y-3">
                      {forecastItems.map((item) => (
                        <article
                          key={item.dt}
                          className="rounded-xl border border-slate-200/20 bg-slate-900/45 p-4 shadow-sm transition hover:border-cyan-300/40"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800/70">
                                <Image src={item.icon} alt="hava ikonu" className="h-7 w-7 object-contain" />
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
                  )}
                </div>
              </section>
            )}
            {Cardd && (
              <div id="sehirler">
                <App/>
              </div>
            )}
            <div>{children}</div>
            {iFrame && (
            <div className='flex justify-center max-w-screen w-4/5 mx-auto'>
              <iframe width="650" height="450"
                      src="https://embed.windy.com/embed2.html?lat=39.675&lon=33.658&detailLat=40.290&detailLon=29.070&width=650&height=450&zoom=6&level=surface&overlay=wind&product=ecmwf&menu=&message=&marker=&calendar=12&pressure=true&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1"
                      title="sıcaklık, nem, rüzgar yönü ve şiddeti, basınç, bulut hareketleri, yağış ihtimali ve benzer verileri gösteren etkileşimli embed harita"
                      frameBorder="0"></iframe>
            </div>
                )}
          </nav>
          <div>
          </div>
          <Analytics/>
        </div>
    );
  }


export default Home;