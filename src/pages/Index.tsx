import { Link } from "react-router-dom";
import type { MouseEvent } from "react";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Brush,
  Check,
  ClipboardCheck,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import almostFullCard from "@/assets/Almost_Full_Card.png";
import customerScansSignupQr from "@/assets/how-it-works/customer-scans-signup-qr.png";
import signupForms from "@/assets/how-it-works/signup-forms.png";
import addToWallet from "@/assets/how-it-works/add-to-wallet.png";
import staffScansCustomersQr from "@/assets/how-it-works/staff-scans-customers-qr.png";
import staffStampingAction from "@/assets/how-it-works/staff-stamping-action.png";
import staffScansCustomersFullCard from "@/assets/how-it-works/staff-scans-customers-full-card.png";
import staffRedeemsPrize from "@/assets/how-it-works/staff-redeems-prize.png";
import giftCoffee from "@/assets/how-it-works/gift-coffee.png";
import WalletSetupDiagram from "@/components/WalletSetupDiagram";

const scrollToSection = (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const features = [
  {
    icon: Smartphone,
    title: "Uygulamasız kullanım",
    description:
      "Müşteriniz yeni bir uygulama indirmez veya şifre hatırlamaz. Kart, her zaman telefonundaki Apple Wallet'tadır.",
  },
  {
    icon: BarChart3,
    title: "Tüm hareketler tek panelde",
    description:
      "Hangi personelin, hangi müşteriye, ne zaman ve kaç damga verdiğini; ödül kullanımlarını ve tüm kullanıcı istatistiklerini görün.",
  },
  {
    icon: BellRing,
    title: "Ayda bir reklam bildirimi",
    description:
      "Kartınızı Apple Wallet'a ekleyen müşterilerinize ayda bir kez kampanya veya duyuru bildirimi gönderin.",
  },
  {
    icon: ShieldCheck,
    title: "Güvenli dijital damga",
    description:
      "Fiziksel kaşelerin kopyalanması veya evde sahte damga basılması gibi kötüye kullanım risklerini ortadan kaldırın.",
  },
  {
    icon: Brush,
    title: "Size özel tasarım",
    description:
      "Dijital sadakat kartınızı ve müşterilerinizin okutacağı QR kod posterini markanıza özel olarak biz tasarlayalım.",
  },
  {
    icon: Users,
    title: "Daha güçlü müşteri içgörüsü",
    description:
      "Müşterilerinizin izin verdiği verilerle onları daha iyi tanıyın, ilgi ve kullanım alışkanlıklarını anlayın.",
  },
];

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5" aria-label="WalletCo ana sayfa">
            <img
              src={`${import.meta.env.BASE_URL}walletco-logo.png`}
              alt=""
              className="h-9 w-9 rounded-lg object-contain"
            />
            <span className="text-lg font-semibold tracking-tight">WalletCo</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex" aria-label="Ana menü">
            <a
              href="#nasil-calisir"
              onClick={scrollToSection("nasil-calisir")}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Nasıl Çalışır?
            </a>
            <a
              href="#ozellikler"
              onClick={scrollToSection("ozellikler")}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Özellikler
            </a>
            <a
              href="#tasarim"
              onClick={scrollToSection("tasarim")}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Size Özel
            </a>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {user ? (
              <Button asChild>
                <Link to="/dashboard">Panele Git</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" className="hidden sm:inline-flex" asChild>
                  <Link to="/auth">Giriş Yap</Link>
                </Button>
                <Button asChild>
                  <Link to="/teklif">Teklif Al</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--accent)/0.16),transparent_34%),radial-gradient(circle_at_10%_10%,hsl(var(--secondary)),transparent_35%)]" />
          <div className="container mx-auto grid items-center gap-12 px-4 py-16 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:px-8 lg:py-24">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/70 px-3.5 py-1.5 text-sm font-medium text-primary shadow-sm">
                <span className="h-2 w-2 rounded-full bg-accent" />
                İşletmenize özel dijital sadakat kartı
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                Müşterileriniz geri gelsin.{" "}
                <span className="text-primary">
                  Kartınız hep yanlarında olsun.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Markanıza özel sadakat kartı doğrudan Apple Wallet&apos;a eklenir.
                Müşteriniz uygulama indirmez; siz damgaları, ödülleri ve müşteri
                hareketlerini tek panelden yönetirsiniz.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="h-12 rounded-xl px-6 text-base shadow-lg shadow-primary/15" asChild>
                  <Link to="/teklif">
                    Sadakat Kartını Oluştur <ArrowRight className="ml-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 rounded-xl bg-white/60 px-6 text-base" asChild>
                  <a href="#nasil-calisir" onClick={scrollToSection("nasil-calisir")}>
                    Nasıl çalıştığını gör
                  </a>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                {["Uygulama gerektirmez", "Kağıt kart masrafı yok", "Kurulumu kolay"].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-accent">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg lg:mr-0">
              <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-accent/20 via-secondary to-primary/10 blur-2xl" />
              <div className="relative rounded-[2rem] border border-white/80 bg-white/55 p-4 shadow-[0_30px_80px_hsl(25_25%_12%/0.16)] backdrop-blur-sm sm:p-6">
                <img
                  src={almostFullCard}
                  alt="Apple Wallet'ta bulunan WalletCo dijital sadakat kartı örneği"
                  className="mx-auto max-h-[580px] w-auto rounded-2xl object-contain"
                />
                <div className="absolute -bottom-4 -left-3 flex items-center gap-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-xl sm:-left-8">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
                    <Check className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">Kart durumu</p>
                    <p className="text-sm font-semibold">Apple Wallet&apos;a eklendi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="nasil-calisir" className="scroll-mt-20 border-t border-border/60 bg-white py-10 sm:py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-4xl font-semibold sm:text-5xl">Nasıl Çalışır?</h2>
              <p className="mt-4 text-xl font-medium text-foreground sm:text-2xl">
                Bir kez kayıt ol, sonraki ziyaretlerde QR kodunu okutarak damganı topla.
              </p>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                Müşteriniz ilk ziyarette kayıt olur ve sadakat kartını Apple Wallet&apos;a ekler.
                Sonraki ziyaretlerinde işletmenizin QR kodunu okutarak dijital damga kazanır.
                Kart tamamlandığında ödülünü kullanır.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white pb-20 pt-10 sm:pb-24 sm:pt-12">
          <div className="container mx-auto max-w-6xl px-4 lg:px-8">
            <h2 className="text-center text-3xl font-semibold sm:text-4xl">İlk Kurulum</h2>

            <div className="mt-8">
              <WalletSetupDiagram />
            </div>

            <h2 className="mt-20 text-center text-3xl font-semibold sm:mt-24 sm:text-4xl">Kayıt Oluşturma</h2>

            <div className="relative left-1/2 mt-8 w-screen -translate-x-1/2 px-2 sm:px-4">
              <div className="grid grid-cols-4 items-start gap-1 sm:gap-3">
                <figure className="-ml-4 sm:-ml-8">
                  <img
                    src={customerScansSignupQr}
                    alt="İlk kez gelen müşterinin QR posteri okutması"
                    className="mx-auto max-h-[480px] w-full object-contain object-left"
                    loading="lazy"
                    style={{ marginLeft: "50px" }}
                  />
                  <figcaption className="mt-3 text-center text-sm leading-6 text-muted-foreground">
                    Kayıt yapmak isteyen müşteri, QR posteri okutur.
                  </figcaption>
                </figure>

                <figure>
                  <img
                    src={signupForms}
                    alt="Müşterinin kayıt formunu doldurması ve KVKK metnini onaylaması"
                    className="mx-auto max-h-[480px] w-full object-contain"
                    loading="lazy"
                    style={{ marginLeft: "50px" }}
                  />
                  <figcaption className="mt-3 text-center text-sm leading-6 text-muted-foreground"
                  style={{ marginLeft: "10px" }}
                  >
                    İsim, soyisim ve telefon numarasını girererek kartını oluşturur.
                  </figcaption>
                </figure>

                <figure className="col-span-2">
                  <img
                    src={addToWallet}
                    alt="Müşterinin oluşturulan kartı Apple Wallet'a eklemesi"
                    className="mx-auto max-h-[480px] w-full object-contain"
                    loading="lazy"
                    style={{ marginLeft: "50px" }}
                  />
                  <figcaption
                    className="mt-3 text-center text-sm leading-6 text-muted-foreground"
                    style={{ marginLeft: "50px" }}
                  >
                    Müşteri oluşan kartını Apple Wallet&apos;a ekler.
                  </figcaption>
                </figure>
              </div>
            </div>

            <h2 className="mt-20 text-center text-3xl font-semibold sm:mt-24 sm:text-4xl">Damga Toplama</h2>

            <div className="mt-8 grid grid-cols-2 items-start gap-3 sm:gap-8">
              <figure>
                <img
                  src={staffScansCustomersQr}
                  alt="Personelin müşterinin kartındaki QR kodu okutması"
                  className="mx-auto max-h-[680px] w-full object-contain"
                  loading="lazy"
                />
                <figcaption className="mt-3 text-center text-sm leading-6 text-muted-foreground">
                  Müşteri Apple Wallet&apos;tan kartını açar ve QR kodu personele gösterir. Personel kodu telefonuyla okutur.
                </figcaption>
              </figure>
              <figure>
                <img
                  src={staffStampingAction}
                  alt="Personelin müşteriye dijital damga vermesi"
                  className="mx-auto max-h-[680px] w-full object-contain"
                  loading="lazy"
                />
                <figcaption className="mt-3 text-center text-sm leading-6 text-muted-foreground">
                  Müşterinin bilgileri ve damga sayısı görünür. Personel “Damga Ver” tuşuna basar ve kart güncellenir.
                </figcaption>
              </figure>
            </div>

            <h2 className="mt-20 text-center text-3xl font-semibold sm:mt-24 sm:text-4xl">Ödül Kullanma</h2>

            <div className="relative left-1/2 mt-8 w-screen -translate-x-1/2 px-4 sm:px-8">
              <div className="mx-auto grid max-w-7xl grid-cols-3 items-start gap-3 sm:gap-6">
                <figure>
                  <img
                    src={staffScansCustomersFullCard}
                    alt="Personelin damgaları dolu müşteri kartını okutması"
                    className="mx-auto max-h-[720px] w-full object-contain"
                    loading="lazy"
                  />
                  <figcaption className="mt-3 text-center text-sm leading-6 text-muted-foreground">
                    Kartını dolduran müşteri QR kodunu yeniden personele gösterir. Personel kodu telefonuyla okutur.
                  </figcaption>
                </figure>
                <figure>
                  <img
                    src={staffRedeemsPrize}
                    alt="Personelin müşterinin ödülünü kullanması"
                    className="mx-auto max-h-[720px] w-full object-contain"
                    loading="lazy"
                  />
                  <figcaption className="mt-3 text-center text-sm leading-6 text-muted-foreground">
                    Personel “Ödülü Kullan” tuşuna basar. Ödül kullanılır ve kartın damgaları sıfırlanır.
                  </figcaption>
                </figure>
                <figure>
                  <img
                    src={giftCoffee}
                    alt="Personelin müşteriye ödülünü vermesi"
                    className="mx-auto max-h-[720px] w-full object-contain"
                    loading="lazy"
                    style={{ transform: "scale(0.6)" }}
                  />
                  <figcaption className="mt-3 text-center text-sm leading-6 text-muted-foreground">
                    Personel müşteriye ödülünü verir.
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </section>

        <section id="ozellikler" className="scroll-mt-20 py-20 sm:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Her şey kontrolünüzde</p>
                <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Basit görünür, güçlü çalışır.</h2>
                <p className="mt-5 text-lg leading-8 text-muted-foreground">
                  WalletCo günlük kullanımı kolaylaştırırken işletmenizin müşteri sadakatini ölçülebilir ve
                  güvenli hale getirir.
                </p>
                <div className="mt-8 rounded-2xl bg-primary p-6 text-primary-foreground">
                  <ClipboardCheck className="h-7 w-7 text-accent" />
                  <p className="mt-4 text-lg font-semibold">Kağıt kart ve kaşe masrafına son</p>
                  <p className="mt-2 text-sm leading-6 text-primary-foreground/70">
                    Kart basımı, yenileme ve fiziksel kaşe maliyeti olmadan tamamen dijital çalışın.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {features.map((feature) => (
                  <article
                    key={feature.title}
                    className="group rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="tasarim" className="scroll-mt-20 bg-primary py-20 text-primary-foreground sm:py-24">
          <div className="container mx-auto grid items-center gap-12 px-4 lg:grid-cols-2 lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Markanıza özel</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Sadece sistem değil, hazır bir deneyim.</h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-primary-foreground/70">
                Kartınızın görünümünü ve mağazanızda kullanılacak QR kod posterini işletmenizin kimliğine
                uygun şekilde biz tasarlıyoruz. Size sadece müşterilerinize sunmak kalıyor.
              </p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  "İşletmenize özel kart tasarımı",
                  "Hazır QR kod posteri",
                  "Kolay personel kullanımı",
                  "Tek panelden yönetim",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <ScanLine className="h-7 w-7 text-accent" />
                <p className="mt-10 text-3xl font-semibold">QR</p>
                <p className="mt-1 text-sm text-primary-foreground/60">ile saniyeler içinde katılım</p>
              </div>
              <div className="translate-y-8 rounded-2xl border border-white/10 bg-white/5 p-5">
                <BellRing className="h-7 w-7 text-accent" />
                <p className="mt-10 text-3xl font-semibold">1×</p>
                <p className="mt-1 text-sm text-primary-foreground/60">aylık reklam bildirimi</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <ShieldCheck className="h-7 w-7 text-accent" />
                <p className="mt-10 text-3xl font-semibold">%100</p>
                <p className="mt-1 text-sm text-primary-foreground/60">dijital damga sistemi</p>
              </div>
              <div className="translate-y-8 rounded-2xl border border-white/10 bg-white/5 p-5">
                <BarChart3 className="h-7 w-7 text-accent" />
                <p className="mt-10 text-3xl font-semibold">Canlı</p>
                <p className="mt-1 text-sm text-primary-foreground/60">müşteri ve personel verileri</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-secondary px-6 py-12 text-center sm:px-12 sm:py-16">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
              <div className="relative mx-auto max-w-2xl">
                <h2 className="text-3xl font-semibold sm:text-4xl">Sadakat kartınız müşterilerinizle buluşsun.</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Uygulamasız, masrafsız ve işletmenize özel dijital sadakat sisteminizi bugün oluşturun.
                </p>
                <Button size="lg" className="mt-8 h-12 rounded-xl px-7 text-base" asChild>
                  <Link to="/teklif">
                    Bizimle İletişime Geç <ArrowRight className="ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 bg-white py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-5 px-4 text-sm text-muted-foreground sm:flex-row lg:px-8">
          <div className="flex items-center gap-2">
            <img
              src={`${import.meta.env.BASE_URL}walletco-logo.png`}
              alt=""
              className="h-7 w-7 rounded-md object-contain"
            />
            <span>© {new Date().getFullYear()} WalletCo</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            <Link to="/user-agreement" className="transition-colors hover:text-foreground">
              Kullanıcı Sözleşmesi
            </Link>
            <Link to="/privacy-policy" className="transition-colors hover:text-foreground">
              Gizlilik Politikası
            </Link>
            <Link to="/support" className="transition-colors hover:text-foreground">
              Destek
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
