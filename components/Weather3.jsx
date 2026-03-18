import React, {useEffect, useState} from "react";
import {Card, CardHeader, CardFooter, Button} from "@nextui-org/react";
import axios from "axios";
import cloud from "../icons/cloud.png";
import fewcloud from "../icons/mostly_sunny.png"
import midcloud from "../icons/partly_sunny.png"
import sun from "../icons/sunny.png";
import snow from "../icons/snowflake.png"
import lightrain from "../icons/partly_sunny_rain.png"
import moderaterain from "../icons/rain_cloud.png"
import heavyrain from "../icons/thunder_cloud_and_rain.png"
import Image from "next/image";
import {useRouter} from 'next/router';

const provinces = [
    { name: 'Adana', slug: 'adana', query: 'Adana,TR' },
    { name: 'Adiyaman', slug: 'adiyaman', query: 'Adiyaman,TR' },
    { name: 'Afyonkarahisar', slug: 'afyonkarahisar', query: 'Afyonkarahisar,TR' },
    { name: 'Agri', slug: 'agri', query: 'Agri,TR' },
    { name: 'Amasya', slug: 'amasya', query: 'Amasya,TR' },
    { name: 'Ankara', slug: 'ankara', query: 'Ankara,TR' },
    { name: 'Antalya', slug: 'antalya', query: 'Antalya,TR' },
    { name: 'Artvin', slug: 'artvin', query: 'Artvin,TR' },
    { name: 'Aydin', slug: 'aydin', query: 'Aydin,TR' },
    { name: 'Balikesir', slug: 'balikesir', query: 'Balikesir,TR' },
    { name: 'Bilecik', slug: 'bilecik', query: 'Bilecik,TR' },
    { name: 'Bingol', slug: 'bingol', query: 'Bingol,TR' },
    { name: 'Bitlis', slug: 'bitlis', query: 'Bitlis,TR' },
    { name: 'Bolu', slug: 'bolu', query: 'Bolu,TR' },
    { name: 'Burdur', slug: 'burdur', query: 'Burdur,TR' },
    { name: 'Bursa', slug: 'bursa', query: 'Bursa,TR' },
    { name: 'Canakkale', slug: 'canakkale', query: 'Canakkale,TR' },
    { name: 'Cankiri', slug: 'cankiri', query: 'Cankiri,TR' },
    { name: 'Corum', slug: 'corum', query: 'Corum,TR' },
    { name: 'Denizli', slug: 'denizli', query: 'Denizli,TR' },
    { name: 'Diyarbakir', slug: 'diyarbakir', query: 'Diyarbakir,TR' },
    { name: 'Edirne', slug: 'edirne', query: 'Edirne,TR' },
    { name: 'Elazig', slug: 'elazig', query: 'Elazig,TR' },
    { name: 'Erzincan', slug: 'erzincan', query: 'Erzincan,TR' },
    { name: 'Erzurum', slug: 'erzurum', query: 'Erzurum,TR' },
    { name: 'Eskisehir', slug: 'eskisehir', query: 'Eskisehir,TR' },
    { name: 'Gaziantep', slug: 'gaziantep', query: 'Gaziantep,TR' },
    { name: 'Giresun', slug: 'giresun', query: 'Giresun,TR' },
    { name: 'Gumushane', slug: 'gumushane', query: 'Gumushane,TR' },
    { name: 'Hakkari', slug: 'hakkari', query: 'Hakkari,TR' },
    { name: 'Hatay', slug: 'hatay', query: 'Hatay,TR' },
    { name: 'Isparta', slug: 'isparta', query: 'Isparta,TR' },
    { name: 'Mersin', slug: 'mersin', query: 'Mersin,TR' },
    { name: 'Istanbul', slug: 'istanbul', query: 'Istanbul,TR' },
    { name: 'Izmir', slug: 'izmir', query: 'Izmir,TR' },
    { name: 'Kars', slug: 'kars', query: 'Kars,TR' },
    { name: 'Kastamonu', slug: 'kastamonu', query: 'Kastamonu,TR' },
    { name: 'Kayseri', slug: 'kayseri', query: 'Kayseri,TR' },
    { name: 'Kirklareli', slug: 'kirklareli', query: 'Kirklareli,TR' },
    { name: 'Kirsehir', slug: 'kirsehir', query: 'Kirsehir,TR' },
    { name: 'Kocaeli', slug: 'kocaeli', query: 'Kocaeli,TR' },
    { name: 'Konya', slug: 'konya', query: 'Konya,TR' },
    { name: 'Kutahya', slug: 'kutahya', query: 'Kutahya,TR' },
    { name: 'Malatya', slug: 'malatya', query: 'Malatya,TR' },
    { name: 'Manisa', slug: 'manisa', query: 'Manisa,TR' },
    { name: 'Kahramanmaras', slug: 'kahramanmaras', query: 'Kahramanmaras,TR' },
    { name: 'Mardin', slug: 'mardin', query: 'Mardin,TR' },
    { name: 'Mugla', slug: 'mugla', query: 'Mugla,TR' },
    { name: 'Mus', slug: 'mus', query: 'Mus,TR' },
    { name: 'Nevsehir', slug: 'nevsehir', query: 'Nevsehir,TR' },
    { name: 'Nigde', slug: 'nigde', query: 'Nigde,TR' },
    { name: 'Ordu', slug: 'ordu', query: 'Ordu,TR' },
    { name: 'Rize', slug: 'rize', query: 'Rize,TR' },
    { name: 'Sakarya', slug: 'sakarya', query: 'Sakarya,TR' },
    { name: 'Samsun', slug: 'samsun', query: 'Samsun,TR' },
    { name: 'Siirt', slug: 'siirt', query: 'Siirt,TR' },
    { name: 'Sinop', slug: 'sinop', query: 'Sinop,TR' },
    { name: 'Sivas', slug: 'sivas', query: 'Sivas,TR' },
    { name: 'Tekirdag', slug: 'tekirdag', query: 'Tekirdag,TR' },
    { name: 'Tokat', slug: 'tokat', query: 'Tokat,TR' },
    { name: 'Trabzon', slug: 'trabzon', query: 'Trabzon,TR' },
    { name: 'Tunceli', slug: 'tunceli', query: 'Tunceli,TR' },
    { name: 'Sanliurfa', slug: 'sanliurfa', query: 'Sanliurfa,TR' },
    { name: 'Usak', slug: 'usak', query: 'Usak,TR' },
    { name: 'Van', slug: 'van', query: 'Van,TR' },
    { name: 'Yozgat', slug: 'yozgat', query: 'Yozgat,TR' },
    { name: 'Zonguldak', slug: 'zonguldak', query: 'Zonguldak,TR' },
    { name: 'Aksaray', slug: 'aksaray', query: 'Aksaray,TR' },
    { name: 'Bayburt', slug: 'bayburt', query: 'Bayburt,TR' },
    { name: 'Karaman', slug: 'karaman', query: 'Karaman,TR' },
    { name: 'Kirikkale', slug: 'kirikkale', query: 'Kirikkale,TR' },
    { name: 'Batman', slug: 'batman', query: 'Batman,TR' },
    { name: 'Sirnak', slug: 'sirnak', query: 'Sirnak,TR' },
    { name: 'Bartin', slug: 'bartin', query: 'Bartin,TR' },
    { name: 'Ardahan', slug: 'ardahan', query: 'Ardahan,TR' },
    { name: 'Igdir', slug: 'igdir', query: 'Igdir,TR' },
    { name: 'Yalova', slug: 'yalova', query: 'Yalova,TR' },
    { name: 'Karabuk', slug: 'karabuk', query: 'Karabuk,TR' },
    { name: 'Kilis', slug: 'kilis', query: 'Kilis,TR' },
    { name: 'Osmaniye', slug: 'osmaniye', query: 'Osmaniye,TR' },
    { name: 'Duzce', slug: 'duzce', query: 'Duzce,TR' }
];

export default function App() {
    const router = useRouter();
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

    const handleCardClick = (city) => {
        router.push(`/hava/${city.toLowerCase()}`);
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
            <div className="mb-6 md:mb-8 rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-4 md:px-6 md:py-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-white text-2xl md:text-3xl font-semibold tracking-tight">Turkiye Il Il Hava Durumu</h1>
                        <p className="text-slate-300 text-sm md:text-base">81 il icin guncel sicaklik kartlari</p>
                    </div>
                    <nav className="flex flex-wrap items-center gap-2 md:justify-end">
                        {navCities.map((city) => (
                            <button
                                key={city.slug}
                                onClick={() => handleCardClick(city.slug)}
                                className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs md:text-sm text-white hover:bg-white/20 transition-colors"
                            >
                                {city.name}
                            </button>
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
                    <div 
                        key={idx} 
                        onClick={() => handleCardClick(city.slug)} 
                        className="cursor-pointer h-full"
                    >
                        <Card 
                            isFooterBlurred
                            className="bg-gray-600 rounded-xl h-[200px] hover:opacity-90 transition-opacity w-full"
                        >
                            <CardHeader className="flex absolute z-10 p-4 md:p-6 pb-24 items-start w-full">
                                <div className="w-full">
                                    <div>
                                        <h4 className="text-white font-medium text-2xl md:text-3xl">{city.name}</h4>
                                        <p className="text-xs text-white/60 uppercase font-bold">{cityDate && cityDate}</p>
                                    </div>
                                    <div className="flex space-x-6 md:space-x-8 pt-4 pb-4 md:pt-6">
                                        <div>
                                            <p className="text-xs text-white/60 uppercase font-medium">GÜN:</p>
                                            <p className="text-lg md:text-xl text-white uppercase font-bold mb-6">{renderTemperature(cityWeather?.main?.temp_max)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/60 uppercase font-medium">GECE:</p>
                                            <p className="text-lg md:text-xl text-white uppercase font-bold mb-6">{renderTemperature(cityWeather?.main?.temp_min)}</p>
                                        </div>
                                    </div>
                                </div>
                                {cityWeather &&
                                <div className="absolute top-4 md:top-6 right-4 md:right-6 max-w-[48px] md:max-w-[62px]">
                                    <Image src={getWeatherIcon(weatherDescription)} alt='weather-icon'/>
                                </div>}
                            </CardHeader>
                            <CardFooter className="absolute bg-white/30 bottom-0 border-t-0 border-zinc-100/50 z-10 justify-between w-full px-4 md:px-6">
                                <div>
                                    <p className="text-white/80 text-xs md:text-sm">Yağmur ihtimali %80</p>
                                </div>
                                <Button 
                                    className="text-xs md:text-sm text-white/80 bg-black/40 rounded p-1 m-1 md:m-2" 
                                >
                                    15 Günlük
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                )})}
            </div>
        </div>
    );
}
