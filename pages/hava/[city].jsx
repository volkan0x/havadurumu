import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import axios from "axios";

import cloud from "../../icons/cloud.png";
import fewcloud from "../../icons/mostly_sunny.png";
import midcloud from "../../icons/partly_sunny.png";
import sun from "../../icons/sunny.png";
import snow from "../../icons/snowflake.png";
import lightrain from "../../icons/partly_sunny_rain.png";
import moderaterain from "../../icons/rain_cloud.png";
import heavyrain from "../../icons/thunder_cloud_and_rain.png";
import Home from "../home";

const DESCRIPTION_MAP = {
  "overcast clouds": "cok bulutlu",
  "broken clouds": "parcali bulutlu",
  "scattered clouds": "az bulutlu",
  "few clouds": "az bulutlu",
  "heavy intensity rain": "siddetli yagmur",
  "moderate rain": "yagmurlu",
  "light rain": "hafif yagmur",
  "sky is clear": "gunesli",
  "rain and snow": "karla karisik yagmur",
  "light snow": "kar yagisli",
  Snow: "kar yagisli"
};

const getWeatherIcon = (description) => {
  if (description === "sky is clear") return sun;
  if (description === "light rain") return lightrain;
  if (description === "moderate rain") return moderaterain;
  if (description === "heavy intensity rain") return heavyrain;
  if (description === "overcast clouds") return cloud;
  if (description === "broken clouds") return midcloud;
  if (description === "scattered clouds" || description === "few clouds") return fewcloud;
  if (description === "light snow" || description === "rain and snow" || description === "Snow") return snow;
  return sun;
};

const formatDate = (unixSeconds) => {
  if (!unixSeconds) return "-";
  return new Date(unixSeconds * 1000).toLocaleDateString("tr-TR", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });
};

const formatHour = (unixSeconds) => {
  if (!unixSeconds) return "-";
  return new Date(unixSeconds * 1000).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit"
  });
};

const formatTemp = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return Math.round(value);
};

export default function Weather() {
  const router = useRouter();
  const weatherApiKey = process.env.NEXT_PUBLIC_WEATHER_KEY;
  const city = typeof router.query.city === "string" ? router.query.city : "";

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (!city) return;

    const fetchWeather = async () => {
      if (!weatherApiKey) {
        setApiError("NEXT_PUBLIC_WEATHER_KEY tanimli degil. Lutfen .env.local dosyasina OpenWeather API key ekleyin.");
        return;
      }

      setLoading(true);
      setApiError("");

      try {
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${weatherApiKey}`;
        const geoResponse = await axios.get(geoUrl);

        if (!geoResponse.data?.length) {
          setApiError("Sehir bulunamadi. Lutfen baska bir sehir deneyin.");
          setWeather(null);
          return;
        }

        const { lat, lon } = geoResponse.data[0];
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=40&appid=${weatherApiKey}`;
        const forecastResponse = await axios.get(forecastUrl);
        setWeather(forecastResponse.data);
      } catch (error) {
        const apiMessage = error?.response?.data?.message;
        setApiError(apiMessage ? `API hatasi: ${apiMessage}` : "Hava durumu verisi alinamadi. API key veya endpoint ayarini kontrol edin.");
        setWeather(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city, weatherApiKey]);

  const forecastItems = useMemo(() => {
    const list = weather?.list ?? [];
    return list.slice(0, 15).map((item) => {
      const englishDescription = item?.weather?.[0]?.description ?? "";

      return {
        dt: item.dt,
        date: formatDate(item.dt),
        hour: formatHour(item.dt),
        dayTemp: formatTemp(item?.main?.temp_max),
        nightTemp: formatTemp(item?.main?.temp_min),
        feelsLike: formatTemp(item?.main?.feels_like),
        humidity: item?.main?.humidity ?? "--",
        rainChance: typeof item?.pop === "number" ? Math.round(item.pop * 100) : 0,
        description: DESCRIPTION_MAP[englishDescription] || englishDescription || "bilinmiyor",
        icon: getWeatherIcon(englishDescription)
      };
    });
  }, [weather]);

  const cityLabel = city ? decodeURIComponent(city).replace(/-/g, " ") : "Sehir";
  const current = forecastItems[0];
  const todayItems = forecastItems.slice(0, 8);
  const todayMaxValues = todayItems.map((item) => item.dayTemp).filter((v) => typeof v === "number");
  const todayMinValues = todayItems.map((item) => item.nightTemp).filter((v) => typeof v === "number");
  const todayMax = todayMaxValues.length ? Math.max(...todayMaxValues) : "--";
  const todayMin = todayMinValues.length ? Math.min(...todayMinValues) : "--";

  return (
    <Home iFrame={true} Cardd={false} showLocalCityPanel={false}>
      <section className="mx-auto w-full max-w-6xl px-4 pb-8 pt-2 text-slate-100">
        <div className="rounded-2xl border border-slate-200/20 bg-slate-900/40 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.3)] backdrop-blur-md md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/90">Sehir Detay Tahmini</p>
              <h1 className="mt-2 text-2xl font-bold capitalize sm:text-3xl">{cityLabel} hava durumu</h1>
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

        {loading && (
          <p className="mt-4 rounded-xl border border-slate-200/20 bg-slate-900/40 px-4 py-3 text-sm text-slate-200">
            Veriler yukleniyor...
          </p>
        )}

        {!loading && !apiError && forecastItems.length > 0 && (
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

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
                    <div className="rounded-lg bg-slate-800/60 px-3 py-2">
                      <p className="text-xs text-slate-300">Gunduz</p>
                      <p className="mt-1 font-semibold">{item.dayTemp}°C</p>
                    </div>
                    <div className="rounded-lg bg-slate-800/60 px-3 py-2">
                      <p className="text-xs text-slate-300">Gece</p>
                      <p className="mt-1 font-semibold">{item.nightTemp}°C</p>
                    </div>
                    <div className="rounded-lg bg-slate-800/60 px-3 py-2">
                      <p className="text-xs text-slate-300">Hissedilen</p>
                      <p className="mt-1 font-semibold">{item.feelsLike}°C</p>
                    </div>
                    <div className="rounded-lg bg-slate-800/60 px-3 py-2">
                      <p className="text-xs text-slate-300">Nem</p>
                      <p className="mt-1 font-semibold">%{item.humidity}</p>
                    </div>
                    <div className="rounded-lg bg-slate-800/60 px-3 py-2">
                      <p className="text-xs text-slate-300">Yagis</p>
                      <p className="mt-1 font-semibold">%{item.rainChance}</p>
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
                  <p className="mt-1 font-medium text-slate-100">{current ? `${current.date} ${current.hour}` : "-"}</p>
                </div>
                <div className="rounded-lg bg-slate-800/60 px-3 py-2">
                  <p className="text-slate-300">Durum</p>
                  <p className="mt-1 font-medium text-slate-100">{current?.description || "-"}</p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>
    </Home>
  );
}
