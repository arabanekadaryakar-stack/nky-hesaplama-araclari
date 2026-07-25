# Aynı Repoya Eklenecek Ek Araçlar

Bu pakette iki klasör vardır:

- `surus-skoru-testi/`
- `yakit-gunlugu/`

## GitHub'a yükleme

Mevcut `nky-hesaplama-araclari` reposunun kök dizinine iki klasörü aynen yükleyin.

Beklenen adresler:

- https://arabanekadaryakar-stack.github.io/nky-hesaplama-araclari/surus-skoru-testi/
- https://arabanekadaryakar-stack.github.io/nky-hesaplama-araclari/yakit-gunlugu/

## Blogger

- `blogger-surus-skoru-sayfasi.html` içeriğini mevcut Sürüş Skoru Blogger sayfasının HTML görünümüne yapıştırın.
- `blogger-yakit-gunlugu-sayfasi.html` içeriğini mevcut Yakıt Günlüğü Blogger sayfasının HTML görünümüne yapıştırın.

GitHub araç sayfaları `noindex,follow` olarak hazırlanmıştır. İndekslenmesi gereken sayfalar Blogger sayfalarıdır.

## Yakıt günlüğü için önemli not

Yakıt günlüğünün kayıtları iframe'in çalıştığı GitHub alan adının localStorage alanında tutulur.
Daha önce doğrudan Blogger sayfasında oluşturulan localStorage kayıtları otomatik taşınmaz.
Repo veya klasör yolu değiştirilirse mevcut kayıtlar yeni adreste görünmeyebilir.
