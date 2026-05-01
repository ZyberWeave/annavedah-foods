export interface PackPrice {
  size: string
  price: number
}

export type ProductCategory =
  | 'Powders'
  | 'Grains'
  | 'Pulses'
  | 'Atta'
  | 'Essentials'
  | 'Papad'
  | 'Chutney'

export interface Product {
  id: number
  slug: string
  name: string
  nameHindi: string
  localName: string
  category: ProductCategory
  price: number
  originalPrice: number
  image: string
  description: string
  benefits: string[]
  usage: string
  highlights: string[]
  packPrices: PackPrice[]
  badge?: string
}

export interface BlogPost {
  slug: string
  title: string
  date: string
  summary: string
  tags: string[]
  body: string[]
  content?: string
}

export interface Testimonial {
  name: string
  location: string
  text: string
  rating: number
}

type ProductSeed = {
  slug: string
  name: string
  localName: string
  category: ProductCategory
  packPrices?: PackPrice[]
  image?: string
  badge?: string
  description?: string
  benefits?: string[]
  usage?: string
  highlights?: string[]
}

const categoryDefaults: Record<
  ProductCategory,
  {
    description: string
    benefits: string[]
    usage: string
    highlights: string[]
  }
> = {
  Powders: {
    description: 'Pure farm-sourced ingredient powder for convenient daily nutrition.',
    benefits: ['Pure & Farm-sourced', 'Easy daily use', 'Kitchen versatile'],
    usage: 'Mix into smoothies, soups, atta, batters, or warm water as needed.',
    highlights: [
      'Fine powder texture for quick mixing',
      'Farm-sourced for maximum purity',
      'Packed in practical family-size options',
    ],
  },
  Grains: {
    description: 'Pure, farm-sourced grains selected for balanced everyday meals.',
    benefits: ['Everyday staple', 'Directly from farms', 'Family friendly'],
    usage: 'Wash, soak where needed, and cook as rice, bhakri, porridge, or rotis.',
    highlights: [
      'Core kitchen essentials sourced with purity',
      'Works well for wholesome lunch and dinner meals',
      'Available in multiple pack sizes',
    ],
  },
  Pulses: {
    description: 'Pure farm-sourced pulse range for dal, sprouts, and protein-rich meals.',
    benefits: ['Protein source', 'Farm to kitchen', 'Suitable for regular cooking'],
    usage: 'Soak and cook as dal, curry, khichdi, sprouts, or flour blends.',
    highlights: [
      'Useful in daily Indian meal prep',
      'Pure choice for vegetarian protein',
      'Available in household quantity packs',
    ],
  },
  Atta: {
    description: 'Traditional flour blend for nourishing homemade recipes.',
    benefits: ['Ready blend', 'Traditional recipe base', 'Convenient prep'],
    usage: 'Use with water, curd, or buttermilk to prepare dough or batter.',
    highlights: [
      'Suitable for quick breakfast and snack recipes',
      'Traditional taste profile',
      'Handy for busy family kitchens',
    ],
  },
  Essentials: {
    description: 'Everyday pantry essentials curated for wholesome cooking.',
    benefits: ['Pantry basics', 'Multi-use products', 'Family pack options'],
    usage: 'Use according to recipe type: spreads, condiments, snacks, or meal boosters.',
    highlights: [
      'Complements core meal preparation',
      'Includes cooking and ready-to-eat options',
      'Select products offer multiple gram variants',
    ],
  },
  Papad: {
    description: 'Traditional crispy accompaniments and home-style dry snacks.',
    benefits: ['Meal companion', 'Traditional taste', 'Long shelf support'],
    usage: 'Roast or fry as preferred and serve with meals or evening snacks.',
    highlights: [
      'Pairs well with dal-rice meals',
      'Convenient side for quick serving',
      'Suitable for festive and daily menus',
    ],
  },
  Chutney: {
    description: 'Flavorful chutney blends to elevate home-cooked dishes.',
    benefits: ['Taste booster', 'Versatile use', 'Traditional profile'],
    usage: 'Serve dry or with oil/curd as a side with roti, bhakri, and snacks.',
    highlights: [
      'Instant flavor support for simple meals',
      'Works with breakfast and lunch plates',
      'Easy pantry storage option',
    ],
  },
}

const p = (size: string, price: number): PackPrice => ({ size, price })

const productCatalog: ProductSeed[] = [
  {
    slug: 'moringa-powder',
    name: 'Moringa Powder',
    localName: 'Moringa Powder',
    category: 'Powders',
    image: '/Products/dried powders/Moringa powder.webp',
    badge: 'Bestseller',
    packPrices: [p('100gm', 175), p('250gm', 299), p('500gm', 575), p('1000gm', 1100)],
  },
  {
    slug: 'tomato-powder',
    name: 'Tomato Powder',
    localName: 'Tomato Powder',
    category: 'Powders',
    image: '/Products/dried powders/Tomato powder.webp',
    packPrices: [p('100gm', 110), p('250gm', 249), p('500gm', 549), p('1000gm', 1025)],
  },
  {
    slug: 'ginger-powder',
    name: 'Ginger Powder',
    localName: 'Ginger Powder',
    category: 'Powders',
    image: '/Products/dried powders/ginger powder.webp',
    packPrices: [p('100gm', 125), p('250gm', 249), p('500gm', 549), p('1000gm', 1025)],
  },
  {
    slug: 'onion-powder',
    name: 'Onion Powder',
    localName: 'Onion Powder',
    category: 'Powders',
    image: '/Products/dried powders/Onion powder.webp',
    packPrices: [p('100gm', 110), p('250gm', 249), p('500gm', 549), p('1000gm', 1025)],
  },
  {
    slug: 'garlic-powder',
    name: 'Garlic Powder',
    localName: 'Garlic Powder',
    category: 'Powders',
    image: '/Products/dried powders/garlic powder.webp',
    packPrices: [p('100gm', 110), p('250gm', 249), p('500gm', 549), p('1000gm', 1025)],
  },
  {
    slug: 'basil-powder',
    name: 'Basil Powder',
    localName: 'Basil Powder',
    category: 'Powders',
    image: '/Products/dried powders/Basil powder.webp',
    packPrices: [p('100gm', 110), p('250gm', 249), p('500gm', 549), p('1000gm', 1025)],
  },
  {
    slug: 'sweet-potato-powder',
    name: 'Sweet Potato Powder',
    localName: 'Sweet Potato Powder',
    category: 'Powders',
    image: '/Products/dried powders/sweeet potato.webp',
    packPrices: [p('100gm', 110), p('250gm', 249), p('500gm', 549), p('1000gm', 1025)],
  },
  {
    slug: 'tamarind-powder',
    name: 'Tamarind Powder',
    localName: 'Tamarind Powder',
    category: 'Powders',
    image: '/Products/dried powders/Tamarind powder.webp',
    packPrices: [p('100gm', 199), p('250gm', 299), p('500gm', 575), p('1000gm', 1100)],
  },
  {
    slug: 'turmeric-powder',
    name: 'Turmeric Powder',
    localName: 'Turmeric Powder',
    category: 'Powders',
    image: '/Products/dried powders/turmeric powder.webp',
    badge: 'Popular',
    packPrices: [p('100gm', 110), p('250gm', 249), p('500gm', 549), p('1000gm', 1025)],
  },
  {
    slug: 'amla-powder',
    name: 'Amla Powder',
    localName: 'Amla Powder',
    category: 'Powders',
    image: '/Products/dried powders/01 product.webp',
    packPrices: [p('100gm', 150), p('250gm', 249), p('500gm', 549), p('1000gm', 1025)],
  },
  {
    slug: 'beetroot-powder',
    name: 'Beetroot Powder',
    localName: 'Beetroot Powder',
    category: 'Powders',
    image: '/Products/dried powders/beetroot powder.webp',
    badge: 'New',
    packPrices: [p('100gm', 175), p('250gm', 299), p('500gm', 575), p('1000gm', 1100)],
  },
  {
    slug: 'curry-leaf-powder',
    name: 'Curry Leaf Powder',
    localName: 'Curry Leaf Powder',
    category: 'Powders',
    image: '/Products/dried powders/curry leaf powder.webp',
    packPrices: [p('100gm', 110), p('250gm', 249), p('500gm', 549), p('1000gm', 1025)],
  },
  {
    slug: 'gahu-chik-powder',
    name: 'Gahu Chik Powder',
    localName: 'Gahu Chik Powder',
    category: 'Powders',
    image: '/Products/dried powders/gavhachya chikachi powder.webp',
    packPrices: [],
  },

  {
    slug: 'indrayani-rice',
    name: 'Indrayani Rice',
    localName: 'Indrayani Tandul',
    category: 'Grains',
    image: '/Products/grains/indrayani tandul.webp',
    packPrices: [p('1kg', 70), p('2kg', 140), p('5kg', 350)],
  },
  {
    slug: 'unpolished-indrayani-rice',
    name: 'Unpolished Indrayani Rice',
    localName: 'Haatsadicha Indrayani Tandul',
    category: 'Grains',
    image: '/Products/grains/unpolished indrayani tandul.webp',
    packPrices: [p('1kg', 80), p('2kg', 160), p('5kg', 400)],
  },
  {
    slug: 'maldandi-gawran-jowari',
    name: 'Maldandi Gawran Jowari',
    localName: 'Maldandi Jowari',
    category: 'Grains',
    image: '/Products/grains/Maldandi Jowar.webp',
    packPrices: [p('1kg', 70), p('2kg', 140), p('5kg', 350)],
  },
  {
    slug: 'dagadi-jowari',
    name: 'Dagadi Jowari',
    localName: 'Dagadi Jowari',
    category: 'Grains',
    image: '/Products/grains/Dagadi Jowar.webp',
    packPrices: [p('1kg', 80), p('2kg', 160), p('5kg', 400)],
  },
  {
    slug: 'lokwan-gahu',
    name: 'Lokwan Gahu',
    localName: 'Lokwan Gahu',
    category: 'Grains',
    image: '/Products/grains/Lokwan gahu.webp',
    packPrices: [p('1kg', 45), p('2kg', 90), p('5kg', 225)],
  },
  {
    slug: 'bajra',
    name: 'Bajra',
    localName: 'Bajri',
    category: 'Grains',
    image: '/Products/grains/Bajra.webp',
    packPrices: [p('1kg', 60), p('2kg', 120), p('5kg', 300)],
  },
  {
    slug: 'ragi',
    name: 'Ragi',
    localName: 'Nachni',
    category: 'Grains',
    image: '/Products/grains/Nachani.webp',
    packPrices: [p('1kg', 75), p('2kg', 150), p('5kg', 375)],
  },
  {
    slug: 'unpolished-red-rice',
    name: 'Unpolished Red Rice',
    localName: 'Haatsadicha Lal Tandul',
    category: 'Grains',
    image: '/Products/grains/Red Rice.webp',
    packPrices: [p('1kg', 150), p('2kg', 300), p('5kg', 750)],
  },

  {
    slug: 'pivala-mung',
    name: 'Pivala Mung',
    localName: 'Gawran Pivale Moog',
    category: 'Pulses',
    image: '/Products/grains/Pivla moong.webp',
    packPrices: [p('500gm', 125), p('1000gm', 250)],
  },
  {
    slug: 'hirve-mung',
    name: 'Hirve Mung',
    localName: 'Gawran Hirve Moog',
    category: 'Pulses',
    image: '/Products/grains/Hirve mug.webp',
    packPrices: [p('500gm', 75), p('1000gm', 150)],
  },
  {
    slug: 'matki',
    name: 'Matki',
    localName: 'Gawran Matki',
    category: 'Pulses',
    image: '/Products/grains/Matki.webp',
    packPrices: [p('500gm', 125), p('1000gm', 250)],
  },
  {
    slug: 'rajma',
    name: 'Rajma',
    localName: 'Waghya Ghevda',
    category: 'Pulses',
    image: '/Products/grains/RAJMA.webp',
    packPrices: [p('500gm', 150), p('1000gm', 300)],
  },
  {
    slug: 'chana-dal',
    name: 'Chana Dal',
    localName: 'Gawran Harbhara Dal',
    category: 'Pulses',
    image: '/Products/grains/Chana Dal.webp',
    packPrices: [p('500gm', 60), p('1000gm', 120)],
  },
  {
    slug: 'moong-dal',
    name: 'Moong Dal',
    localName: 'Gawran Moog Dal',
    category: 'Pulses',
    image: '/Products/grains/MOONG DAL.webp',
    packPrices: [],
  },
  {
    slug: 'toor-dal',
    name: 'Toor Dal',
    localName: 'Gawran Toor Dal',
    category: 'Pulses',
    image: '/Products/grains/Toor Dal.webp',
    packPrices: [],
  },
  {
    slug: 'harbhara',
    name: 'Harbhara',
    localName: 'Gawran Harbhara',
    category: 'Pulses',
    image: '/Products/grains/Harbhara.webp',
    packPrices: [p('500gm', 75), p('1000gm', 150)],
  },
  {
    slug: 'masoor',
    name: 'Masoor',
    localName: 'Gawran Masoor',
    category: 'Pulses',
    image: '/Products/grains/Masoor.webp',
    packPrices: [p('500gm', 90), p('1000gm', 180)],
  },
  {
    slug: 'urad-dal',
    name: 'Urad Dal',
    localName: 'Gawran Udid Dal',
    category: 'Pulses',
    image: '/Products/grains/Urad Dal.webp',
    packPrices: [p('500gm', 90), p('1000gm', 180)],
  },
  {
    slug: 'kala-ghevda',
    name: 'Kala Ghevda',
    localName: 'Gawran Kala Ghevda',
    category: 'Pulses',
    image: '/Products/grains/Black Beans.webp',
    packPrices: [p('500gm', 75), p('1000gm', 150)],
  },
  {
    slug: 'kala-ghevda-dal',
    name: 'Kala Ghevda Dal',
    localName: 'Gawran Kala Ghevda Dal',
    category: 'Pulses',
    image: '/Products/grains/Black Beans Dal.webp',
    packPrices: [p('500gm', 75), p('1000gm', 150)],
  },
  {
    slug: 'hulga',
    name: 'Hulga',
    localName: 'Gawran Hulge',
    category: 'Pulses',
    image: '/Products/grains/Hulga.webp',
    packPrices: [p('500gm', 75), p('1000gm', 150)],
  },
  {
    slug: 'gavran-dhane',
    name: 'Gavran Dhane',
    localName: 'Gawran Dhane',
    category: 'Pulses',
    image: '/Products/grains/dhane.webp',
    packPrices: [p('500gm', 100), p('1000gm', 200)],
  },
  {
    slug: 'kadve-waal',
    name: 'Kadve Waal',
    localName: 'Kadve Waal',
    category: 'Pulses',
    image: '/Products/grains/Kadve waal.webp',
    packPrices: [p('500gm', 140), p('1000gm', 280)],
  },
  {
    slug: 'lal-chavli',
    name: 'Lal Chavli',
    localName: 'Gawran Lal Chavli',
    category: 'Pulses',
    image: '/Products/grains/lal chavli.webp',
    packPrices: [p('500gm', 90), p('1000gm', 180)],
  },

  {
    slug: 'thalipeeth-bhajani',
    name: 'Thalipeeth Bhajani',
    localName: 'Thalipeeth Bhajani',
    category: 'Atta',
    image: '/Products/essentials/Thalipeeth Bhajni.webp',
    packPrices: [p('500gm', 110), p('1000gm', 200)],
  },

  {
    slug: 'raw-forest-honey',
    name: 'Raw Forest Honey',
    localName: 'Madh',
    category: 'Essentials',
    image: '/Products/essentials/Honey.webp',
    packPrices: [],
  },
  {
    slug: 'a2-gir-cow-ghee',
    name: 'A2 Gir Cow Ghee',
    localName: 'Toop',
    category: 'Essentials',
    image: '/Products/essentials/Gir cow ghee.webp',
    packPrices: [p('500gm', 1050), p('1000gm', 1800)],
  },
  {
    slug: 'a2-desi-cow-ghee',
    name: 'A2 Desi Cow Ghee',
    localName: 'Toop',
    category: 'Essentials',
    image: '/Products/essentials/A2 Desi Cow ghee.webp',
    packPrices: [p('500gm', 1150), p('1000gm', 2250)],
  },
  {
    slug: 'gulkand',
    name: 'Gulkand',
    localName: 'Gulkand',
    category: 'Essentials',
    image: '/Products/essentials/Gulkanda.webp',
    packPrices: [p('250gm', 150), p('500gm', 325)],
  },
  {
    slug: 'sukeli',
    name: 'Sukeli',
    localName: 'Sukeli',
    category: 'Essentials',
    packPrices: [p('250gm', 250)],
  },
  {
    slug: 'mix-dried-vegetables-peri-peri',
    name: 'Mix Dried Vegetables - Peri Peri',
    localName: 'Mix Dried Vegetables Peri Peri',
    category: 'Essentials',
    image: '/Products/essentials/Mix Dried Vegetable Peri-peri.webp',
    packPrices: [p('150gm', 349), p('250gm', 549), p('500gm', 949), p('1000gm', 1749)],
  },
  {
    slug: 'mix-dried-vegetables-chaat',
    name: 'Mix Dried Vegetables - Chaat',
    localName: 'Mix Dried Vegetables Chaat',
    category: 'Essentials',
    image: '/Products/essentials/Mix Dried Vegetable Chaat Masala.webp',
    packPrices: [p('150gm', 349), p('250gm', 549), p('500gm', 949), p('1000gm', 1749)],
  },
  {
    slug: 'mix-dried-vegetables-salted',
    name: 'Mix Dried Vegetables - Salted',
    localName: 'Mix Dried Vegetables Salted',
    category: 'Essentials',
    image: '/Products/essentials/Mix Dried Vegetable Salted.webp',
    packPrices: [p('150gm', 325), p('250gm', 525), p('500gm', 925), p('1000gm', 1699)],
  },
  {
    slug: 'raw-mango-pickle',
    name: 'Raw Mango Pickle',
    localName: 'Gawran Kairiche Madavyatle Lonache',
    category: 'Essentials',
    image: '/Products/essentials/Raw Mango Pickle.webp',
    packPrices: [p('250gm', 150)],
  },
  {
    slug: 'pivla-moong-ladu',
    name: 'Pivla Moong Ladu',
    localName: 'Pivla Moong Ladu',
    category: 'Essentials',
    packPrices: [],
  },
  {
    slug: 'dry-fruits-ladu',
    name: 'Dry Fruits Ladu',
    localName: 'Dry Fruits Ladu',
    category: 'Essentials',
    packPrices: [],
  },
  {
    slug: 'sugar-free-dry-fruit-ladu',
    name: 'Sugar Free Dry Fruit Ladu',
    localName: 'Sugar Free Dry Fruit Ladu',
    category: 'Essentials',
    packPrices: [],
  },
  {
    slug: 'protin-powder',
    name: 'Protin Powder',
    localName: 'Protin Powder',
    category: 'Essentials',
    packPrices: [],
  },

  {
    slug: 'kurdai',
    name: 'Kurdai',
    localName: 'Kurdai',
    category: 'Papad',
    image: '/Products/essentials/Kurdai.webp',
    packPrices: [p('250gm', 80), p('500gm', 160), p('1000gm', 320)],
  },
  {
    slug: 'tandalache-khicche',
    name: 'Tandalache Khicche',
    localName: 'Tandalache Khicche',
    category: 'Papad',
    image: '/Products/essentials/Tandalache khicche.webp',
    packPrices: [],
  },
  {
    slug: 'garlic-papad',
    name: 'Garlic Papad',
    localName: 'Garlic Papad',
    category: 'Papad',
    image: '/Products/essentials/Papad.webp',
    packPrices: [],
  },
  {
    slug: 'nachni-papad',
    name: 'Nachni Papad',
    localName: 'Nachni Papad',
    category: 'Papad',
    image: '/Products/essentials/Nachani Papad.webp',
    packPrices: [],
  },
  {
    slug: 'sabudana-papadi',
    name: 'Sabudana Papadi',
    localName: 'Sabudana Papadi',
    category: 'Papad',
    image: '/Products/essentials/sabudana papadi.webp',
    packPrices: [],
  },
  {
    slug: 'vermicelli',
    name: 'Vermicelli',
    localName: 'Shevai',
    category: 'Papad',
    image: '/Products/essentials/shevai.webp',
    packPrices: [],
  },
  {
    slug: 'sandge',
    name: 'Sandge',
    localName: 'Sandge',
    category: 'Papad',
    image: '/Products/essentials/sandge.webp',
    packPrices: [],
  },

  {
    slug: 'shengdana-chutney',
    name: 'Shengdana Chutney',
    localName: 'Shengdana Chutney',
    category: 'Chutney',
    image: '/Products/essentials/shengdana chutni.webp',
    packPrices: [],
  },
  {
    slug: 'onion-garlic-chutney',
    name: 'Onion Garlic Chutney',
    localName: 'Kanda Lasun Chutney',
    category: 'Chutney',
    image: '/Products/essentials/javs chatni.webp',
    packPrices: [],
  },
]

export const products: Product[] = productCatalog.map((item, index) => {
  const defaults = categoryDefaults[item.category]
  const packPrices = item.packPrices ?? []
  const basePrice = packPrices[0]?.price ?? 0
  const topPrice = packPrices.length > 1 ? packPrices[packPrices.length - 1].price : basePrice

  return {
    id: index + 1,
    slug: item.slug,
    name: item.name,
    nameHindi: item.name,
    localName: item.name,
    category: item.category,
    price: basePrice,
    originalPrice: topPrice,
    image: item.image ?? '/placeholder.jpg',
    description: item.description ?? defaults.description,
    benefits: item.benefits ?? defaults.benefits,
    usage: item.usage ?? defaults.usage,
    highlights: item.highlights ?? defaults.highlights,
    packPrices,
    badge: item.badge,
  }
})

export const banners = [
  {
    desktop: '/Banners/Atta.jpeg',
    tablet: '/Banners/Atta_tablet.jpeg',
    mobile: '/Banners/Atta_mobile.jpeg',
  },
  {
    desktop: '/Banners/Chutney.jpeg',
    tablet: '/Banners/Chutney_tablet.jpeg',
    mobile: '/Banners/Chutney_mobile.jpeg',
  },
  {
    desktop: '/Banners/Essentials.jpeg',
    tablet: '/Banners/Essentials_tablet.jpeg',
    mobile: '/Banners/Essentials_mobile.jpeg',
  },
  {
    desktop: '/Banners/Grains.jpeg',
    tablet: '/Banners/grain_tablet.jpeg',
    mobile: '/Banners/grain_mobile.jpeg',
  },
  {
    desktop: '/Banners/Papad.jpeg',
    tablet: '/Banners/papad_tablet.jpeg',
    mobile: '/Banners/papad_mobile.jpeg',
  },
  {
    desktop: '/Banners/Powders.jpeg',
    tablet: '/Banners/Powders_tablet.jpeg',
    mobile: '/Banners/Powders_mobile.jpeg',
  },
  {
    desktop: '/Banners/pulses.jpeg',
    tablet: '/Banners/pulses_tablet.jpeg',
    mobile: '/Banners/pulses _mobile.jpeg',
  },
]

export const testimonials: Testimonial[] = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai',
    text: 'The quality is consistent and my family enjoys adding these products to everyday meals.',
    rating: 5,
  },
  {
    name: 'Rahul Desai',
    location: 'Pune',
    text: 'Great range of traditional staples and powders in practical pack sizes.',
    rating: 5,
  },
  {
    name: 'Anita Kulkarni',
    location: 'Bengaluru',
    text: 'Simple ordering experience and dependable pantry products for weekly use.',
    rating: 5,
  },
]

export const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-choose-powders',
    title: 'How to Choose the Right Powder for Daily Use',
    date: '2026-01-15',
    summary: 'A practical guide to selecting powders by routine, taste, and meal type.',
    tags: ['Nutrition', 'Cooking', 'Wellness'],
    body: [
      'Start with one product and build a repeatable routine around meals you already cook often.',
      'For beginners, choose one neutral-taste powder and use it in one fixed recipe for 10-14 days.',
      'Once the habit sticks, add a second product only if it fits your existing meal pattern.',
    ],
  },
  {
    slug: 'traditional-grains-comeback',
    title: 'Traditional Grains for Modern Kitchens',
    date: '2026-01-10',
    summary: 'Why grains like bajra, ragi, and jowari are back in everyday cooking.',
    tags: ['Grains', 'Heritage', 'Meals'],
    body: [
      'Traditional grains bring variety, texture, and flexible use across breakfast, lunch, and dinner.',
      'Rotating grains through the week can help keep meals interesting without major recipe changes.',
      'Simple planning like pre-soaking and batch-cooking can make heritage grains practical for weekdays.',
    ],
  },
  {
    slug: 'easy-pulse-prep',
    title: 'Easy Pulse Prep for Busy Weekdays',
    date: '2026-01-05',
    summary: 'Simple soaking and batch-cooking tips for pulses and dals.',
    tags: ['Pulses', 'Meal Prep', 'Kitchen'],
    body: [
      'Pre-soak in batches and refrigerate cooked portions to reduce weekday cooking time.',
      'Store cooked dal portions in small containers so meals can be assembled quickly on workdays.',
      'Use one base tempering and adjust final seasoning to create variety with minimal extra effort.',
    ],
  },
]

export const benefits = [
  {
    title: 'Farm-Sourced & Pure',
    description: 'Everything is farm-sourced with no middlemen, ensuring the best quality and purity for your family.',
  },
  {
    title: 'Nutrient Focused',
    description: 'Products designed for practical daily nutrition with minimal processing steps and no hidden chemicals.',
  },
  {
    title: 'Traditional Range',
    description: 'Includes pure grains, pulses, powders, and pantry essentials in one place.',
  },
  {
    title: 'Family Pack Options',
    description: 'Multiple pack sizes available across major categories for convenient household use.',
  },
]

export const categories: string[] = ['All', 'Grains', 'Pulses', 'Powders', 'Atta', 'Essentials', 'Papad', 'Chutney']

