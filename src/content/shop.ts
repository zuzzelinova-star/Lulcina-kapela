/**
 * Obchod. Ceny sú v centoch. Nové veci stačí dopísať do zoznamu.
 * - `category` určuje záložku v obchode,
 * - `repeatable` = dá sa kúpiť znova (občerstvenie pre kapelu),
 * - `requiresCents` = ukáže sa až po odomknutí centov,
 * - `needs` = dá sa kúpiť až po inej veci (napr. bunda pre basistku).
 */
export type ShopCategory = 'oblecenie' | 'nastroje' | 'kapela' | 'podium' | 'obcerstvenie'

export interface ShopItem {
  id: string
  name: string
  price: number
  category: ShopCategory
  repeatable?: boolean
  requiresCents?: boolean
  needs?: string
}

export const CATEGORY_TITLES: Record<ShopCategory, string> = {
  oblecenie: 'Oblečenie',
  nastroje: 'Nástroje',
  kapela: 'Kapela',
  podium: 'Pódium',
  obcerstvenie: 'Občerstvenie',
}

export const SHOP: ShopItem[] = [
  // Oblečenie a doplnky
  { id: 'okuliare', name: 'Slnečné okuliare pre jednorožca', price: 400, category: 'oblecenie' },
  { id: 'satka', name: 'Ružová šatka pre jednorožca', price: 500, category: 'oblecenie' },
  { id: 'korunka', name: 'Strieborná korunka pre vílu', price: 700, category: 'oblecenie' },
  { id: 'bunda-vila', name: 'Kožená bunda pre vílu', price: 900, category: 'oblecenie' },
  // Nástroje
  { id: 'mikrofon', name: 'Mikrofón pre jednorožca', price: 600, category: 'nastroje' },
  { id: 'trblietava-gitara', name: 'Trblietavá gitara', price: 1500, category: 'nastroje' },
  { id: 'blesk-gitara', name: 'Gitara v tvare blesku', price: 3000, category: 'nastroje', needs: 'trblietava-gitara' },
  // Pódium
  { id: 'balony', name: 'Balóny', price: 400, category: 'podium' },
  { id: 'hviezdy', name: 'Girlanda z hviezd', price: 500, category: 'podium' },
  { id: 'disko-gula', name: 'Disko guľa', price: 1200, category: 'podium' },
  { id: 'reflektory', name: 'Farebné reflektory', price: 1800, category: 'podium' },
  { id: 'dym', name: 'Dymostroj', price: 2000, category: 'podium' },
  { id: 'napis', name: 'Svietiaci nápis Elektrické víly', price: 3500, category: 'podium' },
  // Noví členovia kapely – na tieto sa šetrí asi týždeň
  { id: 'bubenicka', name: 'Bubeníčka Iskra (jednorožec)', price: 15000, category: 'kapela' },
  { id: 'basistka', name: 'Basistka Luna (víla)', price: 20000, category: 'kapela', needs: 'bubenicka' },
  { id: 'klavesistka', name: 'Klávesistka Hviezdička (jednorožec)', price: 25000, category: 'kapela', needs: 'basistka' },
  // Občerstvenie – dá sa kupovať stále dokola
  { id: 'limonada', name: 'Limonáda pre kapelu', price: 200, category: 'obcerstvenie', repeatable: true },
  { id: 'pizza', name: 'Pizza pre kapelu', price: 600, category: 'obcerstvenie', repeatable: true },
  { id: 'torta', name: 'Torta pre kapelu', price: 900, category: 'obcerstvenie', repeatable: true },
  { id: 'zuvacky', name: 'Žuvačky', price: 80, category: 'obcerstvenie', repeatable: true, requiresCents: true },
  { id: 'lizatko', name: 'Lízatko', price: 150, category: 'obcerstvenie', repeatable: true, requiresCents: true },
  { id: 'cokolada', name: 'Čokoláda', price: 250, category: 'obcerstvenie', repeatable: true, requiresCents: true },
]
