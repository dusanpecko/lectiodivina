import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Podmienky používania | Lectio Divina',
  description: 'Podmienky používania webovej aplikácie Lectio Divina'
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Podmienky používania
          </h1>
          
          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Všeobecné ustanovenia</h2>
              <p>
                Tieto podmienky používania upravujú pravidlá používania webovej aplikácie 
                Lectio Divina (ďalej len &ldquo;Aplikácia&rdquo;). Používaním Aplikácie vyjadrujete súhlas 
                s týmito podmienkami.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Popis služby</h2>
              <p>
                Aplikácia poskytuje duchovné čítania, modlitby a meditácie v metóde Lectio Divina. 
                Služba je určená na osobné duchovné použitie.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Používateľský účet</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Pri registrácii je potrebné poskytnúť pravdivé údaje</li>
                <li>Používateľ je zodpovedný za bezpečnosť svojho hesla</li>
                <li>Jeden účet môže používať iba jedna osoba</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Ochrana osobných údajov</h2>
              <p>
                Vaše osobné údaje spracovávame v súlade s GDPR. Viac informácií nájdete 
                v našich Zásadách ochrany osobných údajov.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Duševné vlastníctvo</h2>
              <p>
                Všetok obsah Aplikácie, vrátane textov, grafiky a kódu, je chránený autorským právom. 
                Obsah je určený len na osobné použitie.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Zodpovednosť</h2>
              <p>
                Aplikácia je poskytovaná &ldquo;tak ako je&rdquo;. Neposkytujeme žiadne záruky týkajúce sa 
                dostupnosti alebo funkčnosti služby. Nezodpovedáme za škody vzniknuté používaním Aplikácie.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Zmeny podmienok</h2>
              <p>
                Vyhradzujeme si právo kedykoľvek zmeniť tieto podmienky. Zmeny nadobúdajú účinnosť 
                ich zverejnením na tejto stránke.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Kontakt</h2>
              <p>
                Pri otázkach týkajúcich sa týchto podmienok nás kontaktujte na:{' '}
                <a href="mailto:info@lectio.one" className="text-blue-600 hover:text-blue-800 underline">
                  info@lectio.one
                </a>
              </p>
            </section>

            <div className="mt-12 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Posledná aktualizácia: 14. október 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
