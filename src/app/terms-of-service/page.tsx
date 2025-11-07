'use client';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6">Všeobecné obchodné podmienky</h1>
          <p className="text-sm text-gray-500 mb-8">Platné od: 6. novembra 2025</p>

          <div className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Úvodné ustanovenia</h2>
              <p className="text-gray-700">
                Tieto všeobecné obchodné podmienky (ďalej len &quot;VOP&quot;) upravujú vzťahy medzi poskytovateľom služieb
                Lectio.one (ďalej len &quot;Poskytovateľ&quot;) a používateľmi aplikácie a webu Lectio.one (ďalej len &quot;Používateľ&quot;).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Služby</h2>
              <p className="text-gray-700 mb-3">
                Lectio.one poskytuje digitálne služby zamerané na duchovný rast prostredníctvom denných Lectio Divina textov,
                audio nahrávok, modlitieb a ďalšieho duchovného obsahu.
              </p>
              <p className="text-gray-700">
                Služby sú dostupné vo forme:
              </p>
              <ul className="list-disc pl-6 mt-2 text-gray-700">
                <li>Bezplatného prístupu k základným funkciám</li>
                <li>Predplatného s rozšírenými funkciami</li>
                <li>Dobrovoľných príspevkov na podporu projektu</li>
                <li>E-shopu s fyzickými produktmi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Predplatné a platby</h2>
              <p className="text-gray-700 mb-3">
                <strong>3.1 Mesačné predplatné:</strong> Automaticky sa obnovuje každý mesiac. Môže byť kedykoľvek zrušené.
              </p>
              <p className="text-gray-700 mb-3">
                <strong>3.2 Ročné predplatné:</strong> Platba na 12 mesiacov vopred. Môže byť zrušené, vrátenie sumy je pomerne rozdelené.
              </p>
              <p className="text-gray-700 mb-3">
                <strong>3.3 Platobné metódy:</strong> Kreditné karty, PayPal, bankový prevod (prostredníctvom Stripe).
              </p>
              <p className="text-gray-700">
                <strong>3.4 Zrušenie:</strong> Predplatné môže byť zrušené kedykoľvek v nastaveniach účtu. Prístup zostáva aktívny do konca plateného obdobia.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. E-shop a fyzické produkty</h2>
              <p className="text-gray-700 mb-3">
                <strong>4.1 Objednávky:</strong> Objednávky sú platné po dokončení platby cez Stripe Checkout.
              </p>
              <p className="text-gray-700 mb-3">
                <strong>4.2 Dodanie:</strong> Fyzické produkty sú dodávané v rámci SK, CZ, AT, HU, PL, DE. Dodacia lehota 5-14 pracovných dní.
              </p>
              <p className="text-gray-700 mb-3">
                <strong>4.3 Vrátenie:</strong> Produkty je možné vrátiť do 14 dní od doručenia v nepoškodenom stave. Náklady na vrátenie znáša kupujúci.
              </p>
              <p className="text-gray-700">
                <strong>4.4 Reklamácie:</strong> Reklamácie je možné podať emailom na info@lectiodivina.sk do 2 rokov od kúpy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Dobrovoľné príspevky (dary)</h2>
              <p className="text-gray-700">
                Dobrovoľné príspevky sú nezáväzné dary na podporu projektu. Dary sú nevratné a slúžia na financovanie prevádzky,
                tvorby obsahu a rozvoja aplikácie. Darcovia môžu získať daňové potvrdenie na žiadosť.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Ochrana osobných údajov</h2>
              <p className="text-gray-700">
                Poskytovateľ spracováva osobné údaje v súlade s GDPR. Viac informácií nájdete v{' '}
                <a href="/privacy-policy" className="text-blue-600 hover:underline">
                  Zásadách ochrany osobných údajov
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Zodpovednosť</h2>
              <p className="text-gray-700">
                Poskytovateľ nezodpovedá za škody vzniknuté nesprávnym používaním služby. Obsah je poskytovaný &quot;ako je&quot;
                bez záruky úplnosti alebo správnosti.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Zmeny VOP</h2>
              <p className="text-gray-700">
                Poskytovateľ si vyhradzuje právo zmeniť tieto VOP. Používatelia budú o zmenách informovaní emailom
                minimálne 14 dní vopred.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Kontakt</h2>
              <p className="text-gray-700">
                Pre akékoľvek otázky alebo problémy kontaktujte:
                <br />
                Email: info@lectiodivina.sk
                <br />
                Web: lectio.one
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Záverečné ustanovenia</h2>
              <p className="text-gray-700">
                Tieto VOP sa riadia právom Slovenskej republiky. Prípadné spory budú riešené príslušnými súdmi SR.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Posledná aktualizácia: 6. november 2025
              <br />
              Lectio.one © 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
