
# Crisp O'quent - NuxtJS

Bu projede, TypeScript ve JavaScript kullanılarak bir API istemcisi oluşturulmuştur. Bu istemci, API'den veri getirmek için kullanılan bir dizi sınıf ve araç içerir.

## Özellikler

- `CrispOquentConfig`: Bu sınıf, API'nin temel URI'sini ve diğer genel ayarları içerir.
- `Builder`: Bu sınıf, API'den veri çekmek için kullanılan bir sorgu oluşturucudur. `where` ve `orderBy` gibi metotlarla sorgular oluşturabilir ve `paginate` metoduyla sonuçları sayfalayabilirsiniz.
- `PaginatedResults`: Bu sınıf, API'den dönen sayfalı sonuçları temsil eder. Toplam sonuç sayısı, mevcut sayfa numarası ve sayfa başına sonuç sayısı gibi bilgileri içerir.

## Başlarken

Bu projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin.

### Önkoşullar

Bu projeyi çalıştırmak için Node.js ve npm'in yüklü olması gerekmektedir.

### Nuxt-Js Kurulum + Özelleştirme

```bash
$ npm i crisp-oquent
```

```js
import {CrispOquent} from "@crisp-oquent";

export default defineNuxtPlugin((nuxtApp) => {
    CrispOquent.initialize(
        {
            baseUri: 'https://bir-tan.com',
        }
    );
});
```