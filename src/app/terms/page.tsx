"use client";

import { motion } from "framer-motion";
import Link from "next/link";

// SVG ikony
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ShoppingCartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20 pb-8">
      {/* Breadcrumb Header */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="inline-flex items-center space-x-2 text-white hover:text-gray-100 transition-colors group px-4 py-2 rounded-lg"
              style={{ backgroundColor: '#40467b' }}
            >
              <div className="group-hover:-translate-x-1 transition-transform">
                <ArrowLeftIcon />
              </div>
              <span className="font-medium">Späť na hlavnú stránku</span>
            </Link>
            
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
              Platné od 13. novembra 2025
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        {/* OBCHODNÉ PODMIENKY - Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: '#40467b' }}
              >
                <ShoppingCartIcon />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: '#40467b' }}>
                Obchodné podmienky
              </h1>
            </div>
            <p className="text-gray-600 mb-4">
              platné pre internetový predaj na podporu projektu Lectio Divina (lectio.one)
            </p>
            <div className="w-24 h-1.5 mx-auto rounded-full" style={{ backgroundColor: '#40467b' }}></div>
          </div>
        </motion.div>

        {/* Sections - Business Terms */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20"
        >
          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            {/* 1. Všeobecné ustanovenia */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Všeobecné ustanovenia</h2>
              <p className="mb-3">
                <strong>1.1.</strong> Tieto obchodné podmienky upravujú práva a povinnosti zmluvných strán vyplývajúce z kúpnej zmluvy uzatvorenej na diaľku medzi predávajúcim a kupujúcim prostredníctvom webového sídla{' '}
                <a href="https://lectio.one" className="text-blue-600 hover:text-blue-800 underline">https://lectio.one</a>{' '}
                (ďalej len &ldquo;internetový obchod&rdquo;), ktorej predmetom je kúpa a predaj tovaru (napr. kalendár Lectio Divina, šnúrky, perá, duchovné a podporné materiály) určeného na podporu projektu Lectio Divina.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-3">
                <p className="mb-2"><strong>1.2. Predávajúci:</strong></p>
                <ul className="list-none space-y-1 ml-4">
                  <li>lectio.one</li>
                  <li>Jána Kalinčiaka 1</li>
                  <li>010 01 Žilina</li>
                  <li>IČO: 55971521</li>
                  <li>Registračné číslo: VVS/1-900/90-68879</li>
                  <li>Registrový úrad: Okresný úrad Bratislava</li>
                  <li>E-mail: <a href="mailto:info@lectio.one" className="text-blue-600 hover:text-blue-800 underline">info@lectio.one</a></li>
                </ul>
                <p className="mt-2 text-sm">(ďalej len &ldquo;predávajúci&rdquo;)</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg mb-3">
                <p className="mb-2"><strong>1.3. Orgán dozoru:</strong></p>
                <ul className="list-none space-y-1 ml-4">
                  <li>Slovenská obchodná inšpekcia</li>
                  <li>Inšpektorát SOI pre Žilinský kraj</li>
                  <li>Predmestská 71, P. O. BOX B-89, 011 79 Žilina 1</li>
                  <li>tel.: 041/763 21 30</li>
                </ul>
              </div>
              <p className="mb-2">
                <strong>1.4.</strong> Tieto obchodné podmienky v znení platnom v deň uzatvorenia kúpnej zmluvy tvoria jej neoddeliteľnú súčasť. Ak sa predávajúci a kupujúci dohodnú písomne inak, má takáto dohoda prednosť pred týmito obchodnými podmienkami, nesmie však byť v rozpore so zákonom.
              </p>
              <p className="mb-2">
                <strong>1.5.</strong> Všetky zmluvné vzťahy sa riadia právnym poriadkom Slovenskej republiky, najmä Občianskym zákonníkom a zákonom o ochrane spotrebiteľa pri predaji na diaľku.
              </p>
              <p className="mb-2">
                <strong>1.6.</strong> Ceny tovaru uvedené v internetovom obchode sú konečné (ak je predávajúci neplatiteľom DPH, cena je uvedená bez nároku na odpočet DPH). Cena nezahŕňa náklady na dopravu, pokiaľ nie je uvedené inak.
              </p>
              <p>
                <strong>1.7.</strong> Predávajúci si vyhradzuje právo ceny tovaru meniť; na už odoslané a potvrdené objednávky sa však vzťahuje cena platná v čase odoslania objednávky.
              </p>
            </section>

            {/* 2. Uzatvorenie kúpnej zmluvy */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Uzatvorenie kúpnej zmluvy</h2>
              <p className="mb-2">
                <strong>2.1.</strong> Kupujúci odoslaním objednávky cez formulár na stránke predávajúceho podáva návrh na uzavretie kúpnej zmluvy.
              </p>
              <p className="mb-2">
                <strong>2.2.</strong> Po odoslaní objednávky systém zašle na e-mail kupujúceho automatické potvrdenie o prijatí objednávky. Toto potvrdenie nie je akceptáciou návrhu.
              </p>
              <p className="mb-2">
                <strong>2.3.</strong> Kúpna zmluva je uzatvorená až v momente, keď predávajúci kupujúcemu objednávku potvrdí (akceptuje) – e-mailom alebo iným trvanlivým médiom. V potvrdení môžu byť uvedené aj dodacie a platobné údaje.
              </p>
              <p className="mb-2">
                <strong>2.4.</strong> Predávajúci je povinný ešte pred odoslaním objednávky zrozumiteľne informovať kupujúceho o cene, doprave, spôsobe platby, práve odstúpiť, o reklamáciách a kontaktných údajoch – tieto informácie sú uvedené v týchto obchodných podmienkach a na stránke predávajúceho.
              </p>
              <p>
                <strong>2.5.</strong> Ak predávajúci zistí, že objednaný tovar nie je dostupný (napr. limitovaná séria na podporu projektu), bezodkladne kupujúceho kontaktuje s návrhom náhrady alebo s možnosťou objednávku zrušiť. Ak už bola platba uhradená, predávajúci ju vráti do 14 dní.
              </p>
            </section>

            {/* 3. Práva a povinnosti predávajúceho */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Práva a povinnosti predávajúceho</h2>
              <p className="mb-2">
                <strong>3.1.</strong> Predávajúci sa zaväzuje dodať kupujúcemu objednaný tovar v dohodnutom množstve a kvalite, riadne zabalený, a spolu s dokladom o kúpe.
              </p>
              <p className="mb-2">
                <strong>3.2.</strong> Predávajúci má právo na zaplatenie kúpnej ceny riadne a včas.
              </p>
              <p>
                <strong>3.3.</strong> Ak tovar nie je možné dodať, predávajúci ponúkne kupujúcemu náhradné plnenie alebo vráti uhradenú sumu.
              </p>
            </section>

            {/* 4. Práva a povinnosti kupujúceho */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Práva a povinnosti kupujúceho</h2>
              <p className="mb-2">
                <strong>4.1.</strong> Kupujúci je povinný uviesť správne a úplné údaje potrebné na doručenie.
              </p>
              <p className="mb-2">
                <strong>4.2.</strong> Kupujúci je povinný prevziať objednaný tovar a zaplatiť cenu v súlade s objednávkou.
              </p>
              <p>
                <strong>4.3.</strong> Kupujúci má právo na dodanie tovaru v súlade s potvrdenou objednávkou.
              </p>
            </section>

            {/* 5. Dodacie a platobné podmienky */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Dodacie a platobné podmienky</h2>
              <p className="mb-2">
                <strong>5.1.</strong> Spôsob dopravy (kuriér, pošta, osobné prevzatie – ak sa poskytuje) a cena dopravy sú uvedené pri objednávke.
              </p>
              <p className="mb-2">
                <strong>5.2.</strong> Predávajúci sa spravidla zaväzuje dodať tovar do 30 dní od uzavretia zmluvy, zvyčajne však skôr (najmä pri sezónnych produktoch, ako je kalendár).
              </p>
              <p className="mb-2">
                <strong>5.3.</strong> Ak kupujúci tovar neprevezme bez riadneho dôvodu, predávajúci si môže uplatniť náhradu skutočných nákladov spojených s opakovaným doručením.
              </p>
              <p>
                <strong>5.4.</strong> Platba môže byť vykonaná vopred prevodom, prípadne dobierkou alebo iným spôsobom uvedeným v objednávke.
              </p>
            </section>

            {/* 6. Cena */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Cena</h2>
              <p className="mb-2">
                <strong>6.1.</strong> Cena tovaru je uvedená pri konkrétnom produkte. Cena je platná v okamihu odoslania objednávky.
              </p>
              <p className="mb-2">
                <strong>6.2.</strong> K cene môže byť pripočítaná cena dopravy podľa zvoleného spôsobu dodania.
              </p>
              <p>
                <strong>6.3.</strong> Ak z technickej alebo zjavnej chyby došlo k uvedeniu nesprávnej (neprimerane nízkej) ceny, predávajúci má právo objednávku neakceptovať a kupujúcemu navrhnúť kúpu za správnu cenu.
              </p>
            </section>

            {/* 7. Nadobudnutie vlastníctva a prechod nebezpečenstva škody */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Nadobudnutie vlastníctva a prechod nebezpečenstva škody</h2>
              <p className="mb-2">
                <strong>7.1.</strong> Vlastnícke právo prechádza na kupujúceho prevzatím tovaru a zaplatením kúpnej ceny.
              </p>
              <p>
                <strong>7.2.</strong> Nebezpečenstvo škody na tovare prechádza na kupujúceho prevzatím tovaru od dopravcu.
              </p>
            </section>

            {/* 8. Zodpovednosť za vady a reklamácie */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Zodpovednosť za vady a reklamácie</h2>
              <p className="mb-2">
                <strong>8.1.</strong> Predávajúci zodpovedá za vady, ktoré má tovar pri prevzatí kupujúcim a ktoré sa prejavia v záručnej dobe v súlade s Občianskym zákonníkom.
              </p>
              <p className="mb-2">
                <strong>8.2.</strong> Kupujúci je povinný pri prevzatí skontrolovať zásielku; ak je poškodená, spísať s dopravcom záznam alebo zásielku neprevziať.
              </p>
              <p className="mb-2">
                <strong>8.3.</strong> Reklamácie sa uplatňujú písomne alebo e-mailom na kontakt predávajúceho; predávajúci vybavuje reklamácie bez zbytočného odkladu, najneskôr do 30 dní.
              </p>
              <p className="mb-2">
                <strong>8.4.</strong> Pri oprávnenej reklamácii má kupujúci právo najmä na:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>bezplatné odstránenie vady,</li>
                <li>primeranú zľavu z ceny,</li>
                <li>výmenu tovaru, alebo</li>
                <li>odstúpenie od zmluvy, ak ide o podstatné porušenie.</li>
              </ul>
            </section>

            {/* 9. Ochrana osobných údajov */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Ochrana osobných údajov</h2>
              <p className="mb-2">
                <strong>9.1.</strong> Pri objednávke produktov kupujúci poskytuje svoje osobné údaje v rozsahu potrebnom na vybavenie objednávky (meno, adresa, e-mail, telefón). Bez ich poskytnutia nie je možné objednávku vybaviť.
              </p>
              <p>
                <strong>9.2.</strong> Osobné údaje sú spracúvané v súlade s &ldquo;Podmienkami spracúvania osobných údajov&rdquo; predávajúceho zverejnenými na stránke{' '}
                <a href="https://lectio.one/privacy-policy" className="text-blue-600 hover:text-blue-800 underline">lectio.one</a>.
              </p>
            </section>

            {/* 10. Odstúpenie od zmluvy (spotrebiteľ) */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Odstúpenie od zmluvy (spotrebiteľ)</h2>
              <p className="mb-2">
                <strong>10.1.</strong> Kupujúci – spotrebiteľ má právo odstúpiť od zmluvy uzavretej na diaľku bez udania dôvodu do 14 dní odo dňa prevzatia tovaru.
              </p>
              <p className="mb-2">
                <strong>10.2.</strong> Odstúpenie sa uplatňuje e-mailom alebo písomne na adrese predávajúceho. Predávajúci odporúča uviesť číslo objednávky, dátum nákupu a číslo účtu pre vrátenie platby.
              </p>
              <p className="mb-2">
                <strong>10.3.</strong> Kupujúci je povinný vrátiť tovar najneskôr do 14 dní od odstúpenia; náklady na vrátenie znáša kupujúci.
              </p>
              <p className="mb-2">
                <strong>10.4.</strong> Predávajúci vráti kupujúcemu cenu zaplatenú za tovar vrátane základného poštovného najneskôr do 14 dní odo dňa doručenia odstúpenia, avšak nie skôr, než mu bude tovar vrátený alebo kupujúci nepreukáže jeho odoslanie.
              </p>
              <p className="mb-2">
                <strong>10.5.</strong> Kupujúci zodpovedá za zníženie hodnoty tovaru, ktoré vzniklo používaním nad rámec potrebný na zistenie jeho povahy a vlastností.
              </p>
              <p>
                <strong>10.6.</strong> Odstúpiť nie je možné pri tovare zhotovenom podľa osobitnej požiadavky kupujúceho alebo pri digitálnom obsahu dodanom s jeho súhlasom.
              </p>
            </section>

            {/* 11. Alternatívne riešenie sporov */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Alternatívne riešenie sporov</h2>
              <p className="mb-2">
                <strong>11.1.</strong> Ak kupujúci – spotrebiteľ nie je spokojný so spôsobom vybavenia reklamácie alebo sa domnieva, že predávajúci porušil jeho práva, môže sa obrátiť na predávajúceho so žiadosťou o nápravu na{' '}
                <a href="mailto:info@lectio.one" className="text-blue-600 hover:text-blue-800 underline">info@lectio.one</a>.
              </p>
              <p>
                <strong>11.2.</strong> Ak predávajúci na žiadosť nereaguje do 30 dní alebo ju vybaví zamietavo, spotrebiteľ sa môže obrátiť na príslušný subjekt alternatívneho riešenia sporov (napr. Slovenská obchodná inšpekcia).
              </p>
            </section>

            {/* 12. Záverečné ustanovenia */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Záverečné ustanovenia</h2>
              <p className="mb-2">
                <strong>12.1.</strong> Tieto obchodné podmienky nadobúdajú účinnosť dňom zverejnenia na stránke{' '}
                <a href="https://lectio.one" className="text-blue-600 hover:text-blue-800 underline">https://lectio.one</a>.
              </p>
              <p>
                <strong>12.2.</strong> Predávajúci si vyhradzuje právo tieto obchodné podmienky meniť; na už uzatvorené zmluvy sa vzťahuje znenie platné v čase objednávky.
              </p>
            </section>

            {/* Príloha - Formulár na odstúpenie */}
            <section className="mt-12 pt-8 border-t-2 border-gray-300">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Príloha – Formulár na odstúpenie od zmluvy</h2>
              <p className="text-sm italic mb-4">(doplňte a zašlite len v prípade, že si želáte odstúpiť od zmluvy)</p>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="mb-6">
                  <p className="font-semibold mb-2">Adresát:</p>
                  <ul className="list-none space-y-1 ml-4">
                    <li>lectio.one</li>
                    <li>Jána Kalinčiaka 1</li>
                    <li>010 01 Žilina</li>
                    <li>E-mail: <a href="mailto:info@lectio.one" className="text-blue-600 hover:text-blue-800 underline">info@lectio.one</a></li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <p className="font-semibold">Oznamujem, že odstupujem od zmluvy uzavretej na diaľku.</p>
                  
                  <div className="space-y-3 text-sm">
                    <p>Dátum objednania / dátum prijatia tovaru: _______________________</p>
                    <p>Číslo objednávky: _______________________</p>
                    <p>Názov tovaru / produktov: _______________________</p>
                    <p>Suma uhradená: _______________________</p>
                    <p>Meno a priezvisko spotrebiteľa: _______________________</p>
                    <p>Adresa spotrebiteľa: _______________________</p>
                    <p>Telefón / e-mail: _______________________</p>
                    <p>Spôsob vrátenia peňazí (č. účtu / IBAN): _______________________</p>
                  </div>

                  <div className="mt-6 space-y-3 text-sm">
                    <p>V __________________ dňa _____________</p>
                    <p>Podpis spotrebiteľa (len pri papierovej forme): _____________________</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </motion.section>

        {/* DAROVACIE PODMIENKY - Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center"
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: '#40467b' }}
              >
                <HeartIcon />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: '#40467b' }}>
                Darovacie podmienky
              </h1>
            </div>
            <p className="text-gray-600 mb-4">
              pre prijímanie darov na podporu projektu Lectio Divina (lectio.one)
            </p>
            <div className="w-24 h-1.5 mx-auto rounded-full" style={{ backgroundColor: '#40467b' }}></div>
          </div>
        </motion.div>

        {/* Donation Terms Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20"
        >
          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            {/* DAROVACIE PODMIENKY */}
            <section>

              {/* Čl. 1 - Základné pojmy */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Čl. 1 – ZÁKLADNÉ POJMY</h2>
                <p className="mb-4">
                  Tieto Darovacie podmienky upravujú vzťahy pri poskytovaní a správe dobrovoľných finančných darov prostredníctvom webových stránok a aplikácie lectio.one (ďalej len &ldquo;stránky a aplikácie&rdquo;) v prospech prevádzkovateľa projektu Lectio Divina.
                </p>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="mb-2 font-semibold">Prevádzkovateľom stránok a aplikácie a príjemcom darov je:</p>
                  <ul className="list-none space-y-1 ml-4">
                    <li>lectio.one</li>
                    <li>Jána Kalinčiaka 1</li>
                    <li>010 01 Žilina</li>
                    <li>IČO: 55971521</li>
                    <li>Registračné číslo: VVS/1-900/90-68879</li>
                    <li>Registrový úrad: Okresný úrad Bratislava</li>
                    <li>e-mail: <a href="mailto:info@lectio.one" className="text-blue-600 hover:text-blue-800 underline">info@lectio.one</a></li>
                  </ul>
                  <p className="mt-2 text-sm">(ďalej len &ldquo;Prevádzkovateľ&rdquo;)</p>
                </div>

                <p className="mb-3">
                  <strong>Dar</strong> je dobrovoľný peňažný príspevok poskytnutý fyzickou alebo právnickou osobou prostredníctvom stránok a aplikácie v prospech Prevádzkovateľa na všeobecnú podporu, prevádzku a rozvoj projektu Lectio Divina, podľa rozhodnutia Prevádzkovateľa. Dar je bezodplatný a nevzniká naň právny nárok.
                </p>

                <p className="mb-3">
                  <strong>Darca</strong> je fyzická alebo právnická osoba, ktorá prostredníctvom stránok a aplikácie poskytne Dar a súhlasí s týmito Darovacími podmienkami.
                </p>

                <p>
                  <strong>Darovacia zmluva</strong> je dohoda medzi Darcom a Prevádzkovateľom, ktorá sa uzatvára okamihom, keď Darca cez stránky a aplikáciu odošle Dar a odsúhlasí tieto podmienky. Uzatvára sa v elektronickej forme.
                </p>
              </div>

              {/* Čl. 2 - Poskytnutie a použitie daru */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Čl. 2 – POSKYTNUTIE A POUŽITIE DARU</h2>
                <p className="mb-3">
                  Darca je oprávnený poskytnúť Dar bezplatne a dobrovoľne prostredníctvom platobnej brány alebo bankového prevodu, ak je uvedený. Dar je poskytnutý okamihom pripísania sumy na účet Prevádzkovateľa.
                </p>

                <p className="mb-3">
                  Všetky prijaté dary sa používajú na všeobecnú podporu, prevádzku a rozvoj projektu Lectio Divina (stránky, aplikácie, obsah, technické zabezpečenie, misijné materiály). Konkrétny spôsob použitia Daru určuje Prevádzkovateľ podľa aktuálnych potrieb projektu.
                </p>

                <p className="mb-3">
                  Dar je dobrovoľný a bez protiplnenia; poskytnutím Daru nevzniká Darcovi nárok na akúkoľvek službu ani na vrátenie Daru.
                </p>

                <p className="mb-3">
                  Darca je povinný pri darovaní uvádzať pravdivé identifikačné a kontaktné údaje (najmä e-mail), aby mu mohol byť zaslaný prípadný doklad o prijatí Daru.
                </p>

                <p className="mb-3">
                  <strong>Platobná brána:</strong> pri online daroch je využívaná platobná služba Stripe (Stripe Payments Europe, Limited). Údaje o platobnej karte spracúva výlučne Stripe podľa svojich bezpečnostných štandardov. Prevádzkovateľ nemá prístup k údajom o platobnej karte Darcu.
                </p>

                <p className="mb-3">
                  Ak Darca zvolí pravidelné (opakované) darovanie, udeľuje tým súhlas s pravidelným zaťažením svojej platobnej karty prostredníctvom Stripe. Tento súhlas môže Darca kedykoľvek odvolať podľa pokynov na stránke alebo e-mailom na{' '}
                  <a href="mailto:info@lectio.one" className="text-blue-600 hover:text-blue-800 underline">info@lectio.one</a>.
                  Odvolanie má účinok do budúcna.
                </p>

                <p>
                  Vrátenie Daru je možné len vo výnimočných, odôvodnených prípadoch (napr. zjavne duplicitná platba) a po dohode s Prevádzkovateľom; vždy sa postupuje podľa Občianskeho zákonníka.
                </p>
              </div>

              {/* Čl. 3 - Riešenie sporov */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Čl. 3 – RIEŠENIE SPOROV</h2>
                <p className="mb-3">
                  Prevádzkovateľ nezodpovedá za škody spôsobené nesprávne zadanými údajmi Darcom alebo za technické výpadky na strane poskytovateľov platobných služieb.
                </p>

                <p className="mb-3">
                  Právne vzťahy vzniknuté na základe týchto Darovacích podmienok sa spravujú právnym poriadkom Slovenskej republiky.
                </p>

                <p>
                  Spory sa riešia prednostne dohodou. Ak nedôjde k dohode, je príslušný súd podľa sídla Prevádzkovateľa.
                </p>
              </div>

              {/* Čl. 4 - Ochrana osobných údajov */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Čl. 4 – OCHRANA OSOBNÝCH ÚDAJOV</h2>
                <p className="mb-3">
                  Pri prijímaní darov Prevádzkovateľ spracúva osobné údaje Darcov v rozsahu nevyhnutnom na prijatie Daru, komunikáciu s Darcom a vedenie evidencie darov.
                </p>

                <p className="mb-3">
                  Spracúvanie osobných údajov sa riadi dokumentom &ldquo;Podmienky spracúvania osobných údajov lectio.one&rdquo; zverejneným na stránke{' '}
                  <a href="https://lectio.one/privacy-policy" className="text-blue-600 hover:text-blue-800 underline">https://lectio.one</a>.
                  Darca súhlasí so spracúvaním podľa tohto dokumentu.
                </p>

                <p>
                  Údaje o platobných kartách spracúva výlučne Stripe; Prevádzkovateľ k nim nemá prístup.
                </p>
              </div>

              {/* Čl. 5 - Záverečné ustanovenia */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Čl. 5 – ZÁVEREČNÉ USTANOVENIA</h2>
                <p className="mb-3">
                  Prevádzkovateľ je oprávnený tieto Darovacie podmienky kedykoľvek zmeniť alebo doplniť. Nové znenie nadobúda účinnosť dňom zverejnenia na stránkach a v aplikácii.
                </p>

                <p className="mb-3">
                  Ak Darca poskytne Dar po zverejnení nového znenia, má sa za to, že s ním súhlasí.
                </p>

                <p>
                  Tieto podmienky sú vyhotovené na účely transparentného a zákonného prijímania darov na podporu projektu Lectio Divina.
                </p>
              </div>

              {/* Formulár na vrátenie daru */}
              <div className="mt-12 pt-8 border-t-2 border-gray-300">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Formulár na žiadosť o vrátenie daru</h2>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="mb-6">
                    <p className="font-semibold mb-2">Adresát:</p>
                    <ul className="list-none space-y-1 ml-4">
                      <li>lectio.one</li>
                      <li>Jána Kalinčiaka 1</li>
                      <li>010 01 Žilina</li>
                      <li>E-mail: <a href="mailto:info@lectio.one" className="text-blue-600 hover:text-blue-800 underline">info@lectio.one</a></li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <p className="font-semibold">Ja, nižšie podpísaný/á, týmto žiadam o vrátenie daru poskytnutého cez stránky / aplikáciu lectio.one.</p>
                    
                    <div className="space-y-3 text-sm">
                      <p>Meno a priezvisko / Názov: _______________________</p>
                      <p>Adresa / sídlo: _______________________</p>
                      <p>E-mail (zadaný pri darovaní): _______________________</p>
                      <p>Dátum darovania: _______________________</p>
                      <p>Suma daru: _______________________</p>
                      <p>Spôsob darovania (Stripe / karta / prevod): _______________________</p>
                      <p>Posledné 4 čísla karty (ak Stripe): _______________________</p>
                      <p>Dôvod žiadosti o vrátenie daru: _______________________</p>
                      <p>Číslo účtu / IBAN na vrátenie (ak je potrebné): _______________________</p>
                    </div>

                    <div className="mt-6 space-y-3 text-sm">
                      <p>V __________________ dňa _____________</p>
                      <p>Podpis (pri listinnej forme): _____________________</p>
                    </div>

                    <p className="mt-4 text-sm italic text-gray-600">
                      Poznámka: vrátenie daru je možné len vo výnimočných a odôvodnených prípadoch podľa darovacích podmienok lectio.one.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-12 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Posledná aktualizácia: 13. november 2025
              </p>
            </div>
          </div>
        </motion.section>

        {/* Contact Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-8 text-center border border-white/20"
        >
          <div 
            className="inline-block px-6 py-3 rounded-xl text-white mb-4"
            style={{ backgroundColor: '#40467b' }}
          >
            <h3 className="text-xl font-bold">Máte otázky?</h3>
          </div>
          <p className="mb-6 text-gray-600">Kontaktujte nás, radi vám pomôžeme</p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a 
              href="mailto:info@lectio.one"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors text-white hover:opacity-90 shadow-md"
              style={{ backgroundColor: '#40467b' }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span className="font-medium">info@lectio.one</span>
            </a>
            <a 
              href="tel:+421902575575"
              className="inline-flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-lg transition-colors text-gray-700"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span className="font-medium">+421 902 575 575</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
