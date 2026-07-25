import walletTemplate from "@/assets/how-it-works/wallet-template.png";
import qrPosterDesign from "@/assets/how-it-works/qr-poster-design.png";

const WalletSetupDiagram = () => {
  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[hsl(33_38%_93%)] py-14 sm:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-40 h-[30rem] w-[30rem] rounded-full bg-accent/35 blur-[110px]" />
        <div className="absolute -bottom-56 -right-32 h-[34rem] w-[34rem] rounded-full bg-primary/20 blur-[130px]" />
        <div className="absolute right-1/4 top-0 h-72 w-72 rounded-full bg-[hsl(38_70%_62%/0.35)] blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[hsl(25_55%_35%/0.14)] blur-[100px]" />
        <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/4 rounded-full bg-accent/18 blur-[120px]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl grid-cols-2 items-end gap-4 px-4 sm:gap-10 lg:px-8">
        <figure>
          <img
            src={walletTemplate}
            alt="İşletmeye özel dijital sadakat kartı şablonu"
            className="mx-auto max-h-[560px] w-full object-contain"
            loading="lazy"
            style={{ transform: "scale(1.1)" }}
          />
          <figcaption className="mt-3 text-center text-sm leading-6 text-muted-foreground">
            Dijital kartınız tasarlanır
          </figcaption>
        </figure>

        <figure>
          <img
            src={qrPosterDesign}
            alt="İşletmeye özel QR posterinin hazırlanması ve yerleştirilmesi"
            className="mx-auto max-h-[560px] w-full object-contain"
            loading="lazy"
          />
          <figcaption className="mt-3 text-center text-sm leading-6 text-muted-foreground">
            İşletmenize özel QR posteri yerleştirilir.
          </figcaption>
        </figure>
      </div>
    </div>
  );
};

export default WalletSetupDiagram;
