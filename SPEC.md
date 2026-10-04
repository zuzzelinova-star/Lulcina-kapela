# Lulčina kapela – zadanie pre Claude Code

Postav matematickú hru pre 7-ročné dievča (Lulu, 2. ročník ZŠ na Slovensku). Celé rozhranie je po slovensky. Pred písaním kódu mi ukáž plán a opýtaj sa na všetko, čo nie je jasné. Stavaj po fázach (pozri koniec) a po každej sa zastav, nech si to vyskúšam.

## 1. Pre koho a prečo

- Lulu počíta do 10 na prstoch a má problém s prechodom cez 10. Cieľ je, aby si spoje do 10 a do 20 naozaj zautomatizovala a až potom išla ďalej.
- Číta krátke vety. Každé zadanie má najviac jednu krátku vetu a tlačidlo reproduktora, ktoré ho prečíta nahlas po slovensky (Web Speech API, `sk-SK`). Ak slovenský hlas na zariadení chýba, tlačidlo skry a nezhadzuj appku.
- Baví ju odškrtávať a vyfarbovať políčka za hotové úlohy, víly, jednorožce a počítanie s peniazmi.
- Žiadna časomiera, žiadne odpočítavanie, žiadne strácanie životov. Chyba nie je trest.

## 2. Platforma

- PWA (inštalovateľná na plochu) pre iPhone a iPad, Safari. Na iPhone na výšku, na iPade na výšku aj na šírku. Veľké dotykové plochy (min. 56 px), žiadne písanie na klávesnici okrem vlastnej číselnej klávesnice v hre.
- Návrh stacku: React + TypeScript + Vite. Ak máš dôvod na iný, povedz.
- Musí fungovať offline; zmeny sa zosynchronizujú, keď je sieť.
- Synchronizácia progresu medzi dvoma zariadeniami cez bezplatnú cloud databázu. Preferujem riešenie so zabudovaným offline režimom (napr. Firebase Firestore). Prihlásenie: rodič sa raz prihlási e-mailom a heslom na každom zariadení, dieťa nič nezadáva. Pri konflikte vyhráva novší záznam na úrovni jednotlivej položky, nie celého profilu.
- Hosting zadarmo (napr. Firebase Hosting, Netlify alebo Vercel). Prevedieš ma nastavením krok za krokom.
- Grafika čisto v SVG a CSS, bez externých obrázkov a licencovaných postáv.

## 3. Téma a vzhľad

Rockové víly a jednorožce. Hlavné farby fialová a čierna, doplnky neónová ružová a strieborná. Jednorožce v kožených bundách, víly s gitarami, blesky, hviezdy, pódium, reflektory. Milé, nie strašidelné (žiadne lebky).

Príbeh: Lulu je manažérka kapely. Za úlohy zarába mince a kupuje nástroje, oblečenie, členov kapely a výzdobu pódia. Kapela a pódium sú viditeľné na domovskej obrazovke a menia sa podľa toho, čo kúpila.

## 4. Matematický obsah (rebrík zručností)

Každá zručnosť má vlastnú množinu položiek (konkrétnych príkladov).

1. Počet do 10 na pohľad (bodky, desiatkový rámček), porovnávanie
2. Rozklad čísel do 5
3. Rozklad čísel do 10, „kamaráti do 10" (7+3, 6+4…)
4. Sčítanie do 10
5. Odčítanie do 10
6. Čísla 11–20: desiatka a jednotky
7. Sčítanie a odčítanie do 20 bez prechodu
8. Dvojičky (6+6, 7+7) a takmer dvojičky (6+7)
9. Sčítanie s prechodom cez 10 cez doplnenie do desiatky (8+5 = 8+2+3)
10. Odčítanie s prechodom cez 10
11. Čísla do 100, desiatky a jednotky, počítanie s celými desiatkami
12. Sčítanie a odčítanie do 100 bez prechodu
13. Sčítanie a odčítanie do 100 s prechodom

Peniaze idú súbežne:
- od zručnosti 4: len celé eurá (mince 1€ a 2€, bankovky 5€, 10€, 20€), platenie presnej sumy
- od zručnosti 7: výdavok v celých eurách
- od zručnosti 11: centy (mince 1, 2, 5, 10, 20, 50 centov), sumy ako 2,50€

Rebrík musí byť dátový (konfiguračný súbor), aby sa dal neskôr rozšíriť, napr. o násobilku.

Na začiatku krátka rozraďovacia hra (asi 15 úloh, tvári sa ako „konkurz do kapely"), aby Lulu nezačínala na tom, čo už vie.

## 5. Osvojenie a postup

- Každá položka má úroveň 0–4 (Leitnerov systém). Správne bez nápovede = o úroveň vyššie. Chyba alebo nápoveda = o úroveň nižšie a položka sa v tom istom kole ešte raz vráti.
- Položka môže stúpnuť najviac o jednu úroveň za deň. Osvojenie teda vyžaduje správne odpovede vo viacerých dňoch.
- Zručnosť je osvojená, keď je aspoň 90% jej položiek na úrovni 3 a vyššie. Vtedy sa odomkne ďalšia (s malou oslavou: nový koncert).
- Osvojené položky sa vracajú na opakovanie po 1, 3, 7 a 14 dňoch. Ak ich pokazí, klesnú a zručnosť sa môže znova otvoriť.
- Čas odpovede potichu meraj a ukladaj (rýchla odpoveď znamená, že nepočíta na prstoch). Dieťaťu ho nikdy neukazuj. V rodičovskej časti ho zobraz ako informáciu, postup neblokuje.
- Pri chybe: najprv vizuálna nápoveda (desiatkový rámček, číselná os alebo mince), potom druhý pokus. Správnu odpoveď ukáž až po druhej chybe, vždy s obrázkom, prečo.

## 6. Proti nude

- Jedno kolo = „setlist" s 12–15 políčkami. Každá hotová úloha vyfarbí políčko. Kolo trvá približne 10–15 minút. Po dokončení môže hrať ďalšie, appka nič nezamyká.
- Zloženie kola: asi 60% aktuálna zručnosť, 30% opakovanie starších, 1 akčná misia, na konci návšteva obchodu.
- Tá istá zručnosť sa precvičuje v rôznych aktivitách. Nikdy nie viac ako 3 úlohy rovnakého typu za sebou a nikdy ten istý príklad dvakrát po sebe.

## 7. Aktivity

1. **Skúšobňa** – príklad s bodkami alebo desiatkovým rámčekom, odpoveď na číselnej klávesnici alebo výberom z možností.
2. **Kamaráti do 10** – spájanie dvojíc (noty, ktoré spolu dajú 10, neskôr iné číslo).
3. **Ladenie gitary** – chýbajúce číslo (4 + ▢ = 9).
4. **Kto je hlasnejší** – porovnávanie čísel a výsledkov (<, >, =).
5. **Schody na pódium** – číselná os, skoky dopredu a dozadu, prechod cez 10 v dvoch krokoch.
6. **Obchod** – cenovka a peňaženka; ťahaním mincí a bankoviek zaplatiť presnú sumu, neskôr skontrolovať alebo vydať výdavok. Tu Lulu reálne míňa zarobené mince.
7. **Slovná úloha** – jedna krátka veta z prostredia kapely („Na pódiu je 6 víl. Prišli 3 jednorožce. Koľko ich je?"), s čítaním nahlas.
8. **Koncert** – krátke oslavné kolo len z osvojených položiek, kapela hrá podľa správnych odpovedí.
9. **Akčná misia** – pozri nižšie.

## 8. Akčné misie

- Úloha mimo obrazovky, napr. „Choď do kuchyne. Spočítaj vidličky v príborníku a v umývačke. Koľko ich je spolu?" Typy: spočítaj, spočítaj dve skupiny a sčítaj, porovnaj, čoho je viac o koľko, spočítaj mince v pokladničke.
- Misie sú v konfiguračnom súbore, aby som ich vedela ľahko pridávať a upravovať. Priprav aspoň 30 pre bežnú domácnosť, s úrovňou podľa rebríka.
- Lulu zadá číslo. Misia prejde do stavu „čaká na mamu" a hra pokračuje ďalej, nič sa neblokuje.
- Rodič po zadaní PIN-u vidí čakajúce misie: zadanie, Lulina odpoveď, tlačidlá „Sedí" a „Nesedí" (pri „Nesedí" možnosť zadať správne číslo). Odmena sa pripíše až po potvrdení, pri „Nesedí" dostane menšiu odmenu za snahu.
- Najviac jedna nová misia na kolo. Dá sa preskočiť bez trestu.

## 9. Ekonomika

- Mince za každú správnu odpoveď (aj po nápovede, vtedy menej), bonus za dokončený setlist a za potvrdenú misiu.
- Ceny v obchode v celých eurách, kým sa neodomknú centy. Lacné veci dostupné po jednom kole, veľké (nový člen kapely) po približne týždni.
- Mince sa nedajú stratiť chybou.

## 10. Rodičovská časť (za PIN-om)

- 4-miestny PIN, nastaví sa pri prvom spustení. Ukladaj len hash.
- Čakajúce akčné misie.
- Prehľad: zručnosti a ich stav, položky, ktoré robia problém, počet odohraných dní, priemerný čas odpovede podľa zručnosti.
- Ručné posunutie na inú zručnosť (hore aj dole), reset progresu, zapnutie a vypnutie zvukov a čítania nahlas.

## 11. Dáta

Ukladaj: stav každej položky (úroveň, dátum posledného pokusu, dátum ďalšieho opakovania, počet pokusov, posledné časy odpovede), stav zručností, mince, kúpené veci, zloženie kapely, akčné misie a ich stav, nastavenia. O dieťati nič okrem prezývky.

## 12. Kvalita

- Logiku osvojenia a zostavovania kola napíš ako čisté funkcie oddelené od UI a pokry ju unit testami (postup úrovní, limit jednej úrovne za deň, plánovanie opakovania, miešanie typov úloh).
- Generátor príkladov nesmie vytvoriť príklad mimo rozsahu zručnosti (napr. záporný výsledok alebo prechod cez 10 tam, kde nemá byť). Otestuj to.
- Vyskúšaj rozloženie na šírke 375 px (iPhone) a 768–1024 px (iPad).

## 13. Fázy

1. Jadro: rebrík, generátor príkladov, logika osvojenia s testami, aktivity 1–3, ukladanie len lokálne.
2. Zvyšné aktivity, obchod, ekonomika, kapela na domovskej obrazovke, čítanie nahlas.
3. Akčné misie a rodičovská časť.
4. Cloud synchronizácia, PWA inštalácia, nasadenie.
