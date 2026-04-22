import '@/styles/globals.css'
import App  from 'next/app';
import {DefaultSeo} from 'next-seo'
import React from 'react'
import { BackgroundBeams } from '@/components/ui/background-beams'
import GlobalNavbar from '@/components/GlobalNavbar'


// export default function MyApp({ Component, pageProps }) {
//   return <Component {...pageProps} />
// }

export default class MyApp extends App {
        render() {
        const { Component, pageProps } = this.props;
        return (
            <React.Fragment>
              <div className="fixed inset-0 z-0 bg-neutral-950 pointer-events-none">
                <BackgroundBeams />
              </div>
              <GlobalNavbar />
              <div className="relative z-10">
                <DefaultSeo
                title="Hava Durumu 15 Gunluk"
                defaultDescription="Turkiye geneli il il 15 gunluk hava durumu tahminleri, anlik sicaklik, nem ve yagis olasiligi verileri."
                titleTemplate="%s | Hava Durumu 15"
                defaultTitle="Hava Durumu 15"
                description="Turkiye geneli il il 15 gunluk hava durumu tahminleri, anlik sicaklik, nem ve yagis olasiligi verileri."
                canonical='https://www.havadurumu15.com/'
                languageAlternates={[
                  {
                    hrefLang: 'tr-TR',
                    href: 'https://www.havadurumu15.com/'
                  }
                ]}
                openGraph={{
                  title: 'Hava durumu 15 - Hava durumu tahminleri',
                  description: 'Havadurumu15 ile sehriniz icin anlik ve 15 gunluk hava durumu tahminlerini takip edin.',
                  type: 'website',
                  locale: 'tr_TR',
                  url: 'https://www.havadurumu15.com/',
                  siteName: 'Havadurumu15',
                }}
                twitter={{
                  cardType: 'summary_large_image'
                }}
              />
              <div className="pt-24">
                <Component {...pageProps} />
              </div>
              </div>
          </React.Fragment>
        );
    }
  }