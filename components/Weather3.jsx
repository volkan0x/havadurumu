import React, {useEffect, useState} from "react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import axios from "axios";
import Link from 'next/link';
import cloud from "../icons/cloud.png";
import fewcloud from "../icons/mostly_sunny.png"
import midcloud from "../icons/partly_sunny.png"
import sun from "../icons/sunny.png";
import snow from "../icons/snowflake.png"
import lightrain from "../icons/partly_sunny_rain.png"
import moderaterain from "../icons/rain_cloud.png"
import heavyrain from "../icons/thunder_cloud_and_rain.png"
import Image from "next/image";
import { provinces } from '@/data/provinces';

export default function App() {
    const weatherApiKey = process.env.NEXT_PUBLIC_WEATHER_KEY;
    const [weatherBySlug, setWeatherBySlug] = useState({});
    const [apiError, setApiError] = useState("");

    const formatTemperature = (value) => {
        if (typeof value !== 'number' || Number.isNaN(value)) {
            return '--';
        }

        return Math.trunc(value);
    };

    const renderTemperature = (value) => {
        const formattedValue = formatTemperature(value);

        return (
            <>
                {formattedValue}
                {formattedValue !== '--' && <span className='text-xs align-text-top'>°C</span>}
            </>
        );
    };

    const formatDate = (value) => {
        if (!value) {
            return '';
        }

        const options = {month: 'short', weekday: 'short', day: 'numeric'};
        return new Date(value * 1000).toLocaleDateString('tr-TR', options);
    };

    useEffect(() => {
        const fetchWeatherData = async () => {
            if (!weatherApiKey) {
                setApiError('NEXT_PUBLIC_WEATHER_KEY tanimli degil. Lutfen .env.local dosyasina OpenWeather API key ekleyin.');
                return;
            }

            try {
                const results = await Promise.allSettled(
                    provinces.map((city) =>
                        axios
                            .get('https://api.openweathermap.org/data/2.5/weather', {
                                params: {
                                    q: city.query,
                                    units: 'metric',
                                    lang: 'en',
                                    appid: weatherApiKey
                                }
                            })
                            .then((response) => ({ slug: city.slug, data: response.data }))
                    )
                );

                const weatherMap = {};
                let fulfilledCount = 0;

                results.forEach((result) => {
                    if (result.status === 'fulfilled') {
                        weatherMap[result.value.slug] = result.value.data;
                        fulfilledCount += 1;
                    }
                });

                setWeatherBySlug(weatherMap);

                if (fulfilledCount === 0) {
                    setApiError('Hava durumu verisi alinamadi. API key veya endpoint ayarini kontrol edin.');
                    return;
                }

                setApiError('');

            } catch (error) {
                const apiMessage = error?.response?.data?.message;
                setApiError(apiMessage ? `API hatasi: ${apiMessage}` : 'Hava durumu verisi alinamadi. API key veya endpoint ayarini kontrol edin.');
                console.error(error);
            }
        };

        fetchWeatherData();
    }, [weatherApiKey]);

    const featuredCityOrder = ['istanbul', 'ankara', 'izmir', 'bursa', 'antalya'];
    const featuredCities = featuredCityOrder
        .map((slug) => provinces.find((city) => city.slug === slug))
        .filter(Boolean);
    const orderedProvinces = [
        ...featuredCities,
        ...provinces.filter((city) => !featuredCityOrder.includes(city.slug))
    ];
    const navCities = orderedProvinces.slice(0, 6);

    const getWeatherIcon = (description) => {
        if (description === "sky is clear") return sun;
        if (description === "light rain") return lightrain;
        if (description === "moderate rain") return moderaterain;
        if (description === "heavy intensity rain") return heavyrain;
        if (description === "overcast clouds") return cloud;
        if (description === "broken clouds") return midcloud;
        if (description === "scattered clouds") return fewcloud;
        if (description === "few clouds") return fewcloud;
        if (description === "light snow" || description === "rain and snow" || description === "Snow") return snow;
        return sun;
    };
    return (
        <div className="p-4 md:p-8 min-h-screen">
            <div className="mb-6 md:mb-8 rounded-2xl border border-white/10 bg-transparent backdrop-blur-sm px-4 py-4 md:px-6 md:py-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-white text-2xl md:text-3xl font-semibold tracking-tight">Turkiye Il Il Hava Durumu</h1>
                        <p className="text-slate-300 text-sm md:text-base">81 il icin guncel sicaklik kartlari</p>
                    </div>
                    <nav className="flex flex-wrap items-center gap-2 md:justify-end">
                        {navCities.map((city) => (
                            <Link
                                key={city.slug}
                                href={`/hava/${city.slug}`}
                                className="rounded-full border border-white/20 bg-transparent px-3 py-1.5 text-xs md:text-sm text-white hover:bg-white/10 transition-colors"
                            >
                                {city.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
            {apiError && (
                <p className="rounded-lg bg-red-900/40 px-4 py-3 text-xs font-medium text-red-100 mb-6 w-full">
                    {apiError}
                </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {orderedProvinces.map((city, idx) => {
                    const cityWeather = weatherBySlug[city.slug];
                    const weatherDescription = cityWeather?.weather?.[0]?.description;
                    const cityDate = formatDate(cityWeather?.dt);

                    return (
                    <Link
                        key={idx}
                        href={`/hava/${city.slug}`}
                        className="cursor-pointer h-full block min-h-[200px]"
                    >
                        <div className="relative h-full rounded-2xl border border-white/10 p-2">
                            <GlowingEffect
                                spread={40}
                                glow={true}
                                disabled={false}
                                proximity={64}
                                inactiveZone={0.01}
                            />
                            <div className="relative flex h-full flex-col justify-between gap-3 overflow-hidden rounded-xl bg-transparent p-4 md:p-5 backdrop-blur-sm dark:shadow-[0px_0px_27px_0px_#2D2D2D]">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-white font-semibold text-xl md:text-2xl">{city.name}</h4>
                                        <p className="text-xs text-white/50 uppercase font-medium mt-0.5">{cityDate}</p>
                                    </div>
                                    {cityWeather && (
                                        <div className="max-w-[44px] md:max-w-[56px] shrink-0">
                                            <Image src={getWeatherIcon(weatherDescription)} alt="weather-icon" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-end justify-between">
                                    <div className="flex gap-5">
                                        <div>
                                            <p className="text-xs text-white/50 uppercase font-medium">Gündüz</p>
                                            <p className="text-lg md:text-xl text-white font-bold">{renderTemperature(cityWeather?.main?.temp_max)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/50 uppercase font-medium">Gece</p>
                                            <p className="text-lg md:text-xl text-white font-bold">{renderTemperature(cityWeather?.main?.temp_min)}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-white/60 bg-transparent border border-white/15 rounded px-2 py-1">15 Günlük</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                )})}
            </div>
        </div>
    );
}
