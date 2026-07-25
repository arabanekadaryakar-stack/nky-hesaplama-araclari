# Ne Kadar Yakar? — Ayrı Hesaplama Sayfaları

Bu paket üç hesaplama aracını tek GitHub reposunda yayınlamak için hazırlanmıştır.

## Neden tek repo?

- Ortak CSS, araç kataloğu, fiyat servisi ve il/ilçe verisi tek yerde tutulur.
- Bir düzeltme üç araçta da uygulanabilir.
- GitHub Pages için yalnız bir yayın ayarı yapılır.
- Üç ayrı repo yönetme, sürümleme ve bağlantı takibi gerekmez.

## Dizinler

- `ayrintili-hesaplama/`: rota, gidiş-dönüş, ek gider ve kişi başı maliyet
- `arac-karsilastirma/`: iki araç için rota, mesafe ve aylık kullanım karşılaştırması
- `aylik-hesaplama/`: aylık ve yıllık yakıt/şarj gideri
- `shared/`: ortak stil, API, araç arama ve Türkiye il/ilçe verisi
- `blogger-iframe-kodlari.txt`: Blogger sayfalarına yapıştırılacak kodlar

## GitHub kurulumu

1. GitHub hesabınızda **New repository** seçin.
2. Repo adını `nky-hesaplama-araclari` yapın.
3. Repo görünürlüğünü `Public` seçin.
4. Repo oluşturulduktan sonra **Add file → Upload files** seçin.
5. Bu paketin içindeki dosya ve klasörlerin tamamını repo köküne yükleyin.
6. **Commit changes** ile kaydedin.
7. Repo içinde **Settings → Pages** bölümüne girin.
8. **Build and deployment → Source** alanında `Deploy from a branch` seçin.
9. Branch olarak `main`, klasör olarak `/(root)` seçip **Save** düğmesine basın.
10. GitHub Pages adresi oluştuğunda kök test sayfasını açın:

`https://KULLANICI-ADINIZ.github.io/nky-hesaplama-araclari/`

## Önce yapılacak testler

1. Üç sayfanın da açıldığını kontrol edin.
2. Araç aramasına `Omoda`, `Egea`, `Togg` yazın.
3. Ankara fiyatını getirin.
4. Ayrıntılı sayfada Ankara → İstanbul rotasını deneyin.
5. Aynı il testi olarak Ankara/Sincan → Ankara/Gölbaşı deneyin.
6. Elektrikli araç seçip AC ve DC fiyatlarını ayrı ayrı deneyin.
7. Chrome geliştirici araçlarında mobil ekranı ve gerçek telefonda sayfayı kontrol edin.

## Blogger kurulumu

1. Blogger → **Sayfalar → Yeni Sayfa** seçin.
2. Sayfa başlığını yazın.
3. Düzenleyicide **HTML görünümüne** geçin.
4. `blogger-iframe-kodlari.txt` içindeki ilgili kodu yapıştırın.
5. `USERNAME` ve `REPO` alanlarını kendi bilgilerinizle değiştirin.
6. Önizleme yapın ve ardından yayınlayın.

Önerilen Blogger sayfa adresleri:

- `/p/ayrintili-yakit-maliyeti-hesaplama.html`
- `/p/iki-araci-karsilastir.html`
- `/p/aylik-yakit-gideri-hesaplama.html`

## Önemli mimari not

GitHub Pages iframe’i ile Blogger sayfası farklı origin kullanır. Bu nedenle Blogger ana sayfasının `localStorage` verisi iframe tarafından doğrudan okunamaz. İlk sürümde her araç bağımsız çalışır. Daha sonra ana sayfadaki araç seçimi `?vehicle=arac-kimligi` parametresi veya `postMessage` ile aktarılabilir.

## Ana temayı ne zaman temizleyeceğiz?

Üç GitHub Pages sayfası ve üç Blogger iframe sayfası doğrulandıktan sonra:

1. Ana sayfadaki ayrıntılı hesap HTML’i kaldırılır.
2. Araç karşılaştırma HTML’i kaldırılır.
3. Aylık hesap HTML’i kaldırılır.
4. Bu bölümlere özel CSS ve JavaScript temizlenir.
5. Ana sayfadaki butonlar yeni Blogger sayfalarına yönlendirilir.
6. Hızlı hesaplama ana sayfada korunur.

Ana tema temizliği, sayfalar test edilmeden yapılmamalıdır.
