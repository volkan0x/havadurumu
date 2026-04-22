# Search Console Weekly Loop

Bu dokuman, Search Console verilerini haftalik ritimde izleyip trafik artisi icin karar almaya yonelik operasyon planidir.

## 1) Ilk Kurulum (Tek Sefer)

1. Search Console property ekle: `https://www.havadurumu15.com/`.
2. Domain veya URL-prefix dogrulamasi tamamla.
3. Sitemap gonder:
   - `https://www.havadurumu15.com/sitemap.xml`
4. URL denetimi ile ornek 5 sehir sayfasini test et:
   - `/hava/istanbul`
   - `/hava/ankara`
   - `/hava/izmir`
   - `/hava/bursa`
   - `/hava/antalya`
5. Performance raporunda varsayilan karsilastirma olustur:
   - Son 7 gun vs onceki 7 gun
   - Search type: Web
6. Google Sheets tablosu olustur ve `templates/search-console-weekly-log.csv` dosyasini ice aktar.

## 2) Haftalik Calisma Ritmi (Her Pazartesi)

- Sure: 35-45 dk
- Veri penceresi:
  - Bu hafta: son 7 gun
  - Karsilastirma: onceki 7 gun

### A. Index Kapsami Kontrolu (10 dk)

1. Indexing > Pages ekraninda asagilari not et:
   - Indexed sayfa sayisi
   - Not indexed sayfa sayisi
   - Yeni hata tipleri (404, crawled currently not indexed vb.)
2. Hata varsa `templates/search-console-issues.md` icinde ilgili haftaya kaydet.
3. Kritik hata varsa ayni gun fix backlog'una gorev ac.

### B. Query CTR Kontrolu (15 dk)

1. Performance > Search results
2. Query sekmesinde filtre uygula:
   - Impressions > 100
   - Position <= 20
3. Asagidaki 3 segmenti ayri ayri cikar:
   - Kaybedenler: CTR dusmus, impression benzer veya artmis
   - Firsatlar: Position 8-20 arasi, impression yuksek, CTR dusuk
   - Kazananlar: Click ve CTR artmis queryler
4. Ilk 10 query icin aksiyon karari al:
   - Title/description revizyonu
   - Icerik zenginlestirme
   - Ic link kuvvetlendirme

### C. Sayfa Bazli Kazanim Takibi (10 dk)

1. Pages sekmesinde son 7 gun vs onceki 7 gun karsilastir.
2. Sehir sayfalarini filtrele: URL contains `/hava/`.
3. En cok kazanan 10 sayfayi ve en cok kaybeden 10 sayfayi logla.
4. Kaybedenler icin neden hipotezi yaz:
   - Baslik CTR yetersiz
   - Rakip SERP ozellikleri
   - Index/crawl problemi
   - Icerik niyeti uyumsuzlugu

## 3) Karar Kurallari (Aksiyon Esikleri)

- Kural 1: Impression artiyor, CTR 0.8 puan ve daha fazla dusuyorsa
  - Snippet revizyonu yap (title + meta description)
  - 7 gun sonra yeniden olc

- Kural 2: Position 8-20, impression > 500, CTR < %2.5
  - Sayfaya hedef query odakli alt baslik/metin ekle
  - Ic linklerden 3-5 yeni baglanti ver

- Kural 3: Page clickleri haftalik %20+ dususte
  - Indexing hatasi var mi kontrol et
  - Yoksa icerik update (bugun/yarin/haftalik blok) yap

- Kural 4: Indexlenmeyen sehir sayfasi varsa
  - URL Inspection > Request indexing
  - Ic linklerde ilgili sayfaya baglanti arttir

## 4) Haftalik Cikti Formati

Her haftanin sonunda 1 sayfalik ozet cikar:

- En iyi 3 kazanim
- En kritik 3 kayip
- Bu hafta yapilan SEO degisiklikleri
- Gelecek hafta uygulanacak 5 aksiyon

Bu ozeti `docs/search-console/weekly-notes.md` dosyasina hafta basligiyla ekle.

## 5) Aylik Gozden Gecirme (Ayda 1)

- Son 4 haftayi birlestir
- En yuksek buyuyen query gruplarini cikar
- En iyi performans gosteren sehir sayfasi semasini digerlerine uygula
- Duzelmeyen sayfalar icin yeniden yazim plani olustur
