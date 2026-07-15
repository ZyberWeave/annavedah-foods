export interface Testimonial {
  name: string
  location: string
  text: string
  rating: number
}

export interface BlogPost {
  slug: string
  title: string
  date: string
  summary: string
  tags: string[]
  body: string[]
  content?: string
  image?: string
}

export const banners = [
  {
    category: 'Atta',
    desktop: '/Banners/landscape/Atta.png',
    tablet: '/Banners/landscape/Atta.png',
    mobile: '/Banners/square/Atta.png',
  },
  {
    category: 'Chutney',
    desktop: '/Banners/landscape/Chutney.png',
    tablet: '/Banners/landscape/Chutney.png',
    mobile: '/Banners/square/Chutney.jpeg',
  },
  {
    category: 'Grains',
    desktop: '/Banners/landscape/Grains..png',
    tablet: '/Banners/landscape/Grains..png',
    mobile: '/Banners/square/Grains.png',
  },
  {
    category: 'Papad',
    desktop: '/Banners/landscape/Papad.png',
    tablet: '/Banners/landscape/Papad.png',
    mobile: '/Banners/square/Papad.png',
  },
  {
    category: 'Powders',
    desktop: '/Banners/landscape/Powders.png',
    tablet: '/Banners/landscape/Powders.png',
    mobile: '/Banners/square/Powder.png',
  },
  {
    category: 'Pulses',
    desktop: '/Banners/landscape/Pulses.png',
    tablet: '/Banners/landscape/Pulses.png',
    mobile: '/Banners/square/Pluses.jpeg',
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

export const categories: string[] = ['All', 'Grains', 'Pulses', 'Powders', 'Atta', 'Essentials', 'Papad', 'Chutney']

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
  {
    slug: 'moringa-powder-benefits',
    title: 'The Superfood Benefits of Moringa Powder',
    date: '2026-02-01',
    summary: 'Discover how adding a simple green powder to your diet can boost energy and immunity.',
    tags: ['Superfoods', 'Nutrition', 'Health'],
    body: [
      'Moringa powder is incredibly rich in vitamins, minerals, and amino acids. It serves as an excellent natural supplement.',
      'You can easily mix it into warm water, smoothies, or even your daily chapati dough for an effortless nutrient boost.',
      'Its antioxidant properties help fight inflammation and protect your cells from damage over time.',
    ],
  },
  {
    slug: 'unpolished-indrayani-rice',
    title: 'Why Unpolished Indrayani Rice Belongs in Your Pantry',
    date: '2026-02-05',
    summary: 'Understanding the nutritional difference between polished and unpolished traditional rice.',
    tags: ['Grains', 'Rice', 'Health'],
    body: [
      'Unpolished rice retains the nutrient-dense bran layer, providing more fiber and essential minerals than its polished counterpart.',
      'Indrayani rice is known for its sweet aroma and slightly sticky texture, making it perfect for traditional comfort foods like khichdi.',
      'Switching to unpolished rice helps regulate blood sugar levels due to its lower glycemic index.',
    ],
  },
  {
    slug: 'magic-of-thalipeeth',
    title: 'The Magic of Traditional Thalipeeth Bhajani',
    date: '2026-02-10',
    summary: 'A deep dive into Maharashtrias favorite multi-grain breakfast.',
    tags: ['Breakfast', 'Heritage', 'Recipes'],
    body: [
      'Thalipeeth Bhajani is a pre-roasted mix of various grains, pulses, and spices, making it a nutritional powerhouse.',
      'It provides a balanced combination of complex carbohydrates and plant-based protein to keep you full for hours.',
      'Preparation is quick and simple: just add chopped onions, coriander, water, and cook it on a hot griddle.',
    ],
  },
  {
    slug: 'benefits-of-a2-ghee',
    title: 'A2 Gir Cow Ghee: Liquid Gold for Health',
    date: '2026-02-15',
    summary: 'Exploring the Ayurvedic and modern health benefits of pure A2 ghee.',
    tags: ['Ghee', 'Ayurveda', 'Wellness'],
    body: [
      'A2 Ghee is made from the milk of indigenous cow breeds like Gir, which produce milk containing only the easily digestible A2 protein.',
      'Rich in Omega-3 fatty acids and butyric acid, it promotes gut health and reduces inflammation.',
      'It has a high smoke point, making it the safest and healthiest choice for everyday Indian cooking and frying.',
    ],
  },
  {
    slug: 'dehydrated-veg-powders',
    title: 'Cooking Smart with Dehydrated Vegetable Powders',
    date: '2026-02-20',
    summary: 'How to save time without compromising on nutrition using dehydrated powders.',
    tags: ['Cooking Hacks', 'Vegetables', 'Time-saving'],
    body: [
      'Tomato, onion, and garlic powders can instantly flavor your gravies and marinades without the prep work.',
      'Dehydration locks in the nutrients at their peak, meaning you get the same vitamins as fresh vegetables.',
      'They have a long shelf life, reducing kitchen waste while providing intense, concentrated flavors.',
    ],
  },
  {
    slug: 'incorporating-ragi',
    title: 'Creative Ways to Incorporate Ragi (Nachni)',
    date: '2026-02-25',
    summary: 'Moving beyond porridge: how to use this calcium-rich millet daily.',
    tags: ['Millets', 'Ragi', 'Recipes'],
    body: [
      'Ragi is one of the highest non-dairy sources of calcium, essential for bone health across all ages.',
      'Instead of just porridge, try making ragi dosas, idlis, or mixing it into your regular wheat flour for rotis.',
      'For a healthy sweet treat, ragi laddoos made with jaggery and ghee are both delicious and nutritious.',
    ],
  },
  {
    slug: 'raw-forest-honey',
    title: 'The Unfiltered Truth About Raw Forest Honey',
    date: '2026-03-02',
    summary: 'Why you should choose raw, unprocessed honey over commercial alternatives.',
    tags: ['Honey', 'Natural Sweeteners', 'Health'],
    body: [
      'Raw forest honey is never pasteurized, preserving its natural enzymes, vitamins, and antioxidants.',
      'It acts as a powerful natural remedy for soothing sore throats and boosting the immune system.',
      'Unlike processed sugar, it provides a slow release of energy, preventing sharp spikes in blood glucose levels.',
    ],
  },
  {
    slug: 'spices-for-digestion',
    title: 'Essential Spices for Better Digestion',
    date: '2026-03-05',
    summary: 'How everyday Indian spices act as natural digestive aids.',
    tags: ['Spices', 'Ayurveda', 'Digestion'],
    body: [
      'Spices like cumin (jeera) and coriander (dhaniya) stimulate the secretion of digestive enzymes.',
      'Adding a pinch of ginger powder to your tea or meals can effectively reduce bloating and nausea.',
      'Properly tempered spices not only enhance flavor but also help the body absorb nutrients from the food more efficiently.',
    ],
  },
  {
    slug: 'maharashtrian-dry-snacks',
    title: 'A Guide to Traditional Maharashtrian Dry Snacks',
    date: '2026-03-10',
    summary: 'Discover the joy of Sandge, Kurdai, and other heritage accompaniments.',
    tags: ['Snacks', 'Heritage', 'Culture'],
    body: [
      'Traditional sun-dried snacks like Kurdai and Sandge were ingenious ways to preserve food before modern refrigeration.',
      'Made from fermented wheat or mixed pulses, they are deep-fried to create crispy, flavor-packed meal accompaniments.',
      'They offer a perfect textural contrast to soft rice and dal, elevating a simple daily meal to something special.',
    ],
  },
  {
    slug: 'fasting-foods-sabudana',
    title: 'Fasting Made Easy with Sabudana Papadi',
    date: '2026-03-15',
    summary: 'Quick and reliable options for your fasting days.',
    tags: ['Fasting', 'Snacks', 'Tradition'],
    body: [
      'Sabudana (tapioca pearls) provides the quick carbohydrate energy needed during fasting (vrat) days.',
      'Ready-to-fry Sabudana Papadi is a convenient alternative to the time-consuming preparation of sabudana khichdi or wada.',
      'Pair it with roasted peanut chutney (shengdana chutney) for a satisfying and traditional fasting meal.',
    ],
  },
  {
    slug: 'protein-packed-rajma',
    title: 'Plant Protein Power: Rajma and Kala Ghevda',
    date: '2026-03-20',
    summary: 'Building muscle and staying full with traditional beans.',
    tags: ['Protein', 'Beans', 'Nutrition'],
    body: [
      'Kidney beans (Rajma) and Black Beans (Kala Ghevda) are excellent sources of plant-based protein and dietary fiber.',
      'Soaking them overnight is crucial to neutralize phytic acid and make the nutrients more bioavailable.',
      'Combining these beans with rice or roti creates a complete protein profile, providing all essential amino acids.',
    ],
  },
  {
    slug: 'turmeric-golden-spice',
    title: 'Turmeric: The Golden Spice of India',
    date: '2026-03-25',
    summary: 'Maximizing the benefits of curcumin in your daily diet.',
    tags: ['Spices', 'Immunity', 'Wellness'],
    body: [
      'Curcumin, the active compound in turmeric, is a potent anti-inflammatory and antioxidant agent.',
      'To maximize absorption, turmeric should always be consumed with a source of fat (like ghee) and a pinch of black pepper.',
      'Beyond curries, stirring a spoonful of pure turmeric powder into warm milk creates a soothing, immune-boosting evening drink.',
    ],
  },
  {
    slug: 'beetroot-powder-uses',
    title: 'Beetroot Powder: Natural Color and Health Booster',
    date: '2026-03-28',
    summary: 'Enhance your recipes visually and nutritionally with beetroot powder.',
    tags: ['Superfoods', 'Cooking Hacks', 'Nutrition'],
    body: [
      'Beetroot powder is rich in dietary nitrates, which help improve blood flow and lower blood pressure.',
      'It acts as a vibrant, 100% natural red food coloring for red velvet cakes, smoothies, and homemade pastas.',
      'A small scoop adds earthy sweetness and a massive dose of antioxidants without the mess of peeling and grating fresh beets.',
    ],
  },
  {
    slug: 'perfect-dal-guide',
    title: 'The Secret to Making Perfect Dal Every Time',
    date: '2026-04-02',
    summary: 'Mastering the ultimate Indian comfort food.',
    tags: ['Cooking Tips', 'Pulses', 'Comfort Food'],
    body: [
      'The foundation of a great dal is using unpolished pulses, which retain their natural flavor and texture better during cooking.',
      'Always skim the white foam that rises to the top when boiling dal, as it contains impurities that can cause bloating.',
      'The "tadka" (tempering) should be done in ghee at the very end, pouring it sizzling hot over the cooked lentils to lock in the aroma.',
    ],
  },
  {
    slug: 'summer-cooling-foods',
    title: 'Traditional Foods to Beat the Summer Heat',
    date: '2026-04-07',
    summary: 'Ayurvedic wisdom for staying cool during the hot months.',
    tags: ['Seasonal', 'Ayurveda', 'Wellness'],
    body: [
      'Incorporating Gulkand (rose petal preserve) into milk or water acts as a powerful natural coolant for the body.',
      'Substituting heavy wheat with lighter grains like Jowar (sorghum) helps maintain energy without sluggishness.',
      'Spices like coriander and fennel seeds should be prioritized over heat-generating spices like black pepper and cloves.',
    ],
  },
  {
    slug: 'winter-immunity-boosters',
    title: 'Building Winter Immunity with Heritage Foods',
    date: '2026-04-12',
    summary: 'Preparing your body for the cold season with traditional ingredients.',
    tags: ['Seasonal', 'Immunity', 'Health'],
    body: [
      'Bajra (pearl millet) is a winter staple because it naturally generates heat in the body and provides sustained energy.',
      'Dry fruit laddoos made with pure ghee and jaggery deliver dense nutrition and healthy fats needed to fight off winter colds.',
      'Adding ginger and turmeric powders to daily soups and teas helps keep the respiratory system clear and strong.',
    ],
  },
  {
    slug: 'lokwan-wheat-benefits',
    title: 'Why Choose Lokwan Wheat?',
    date: '2026-04-17',
    summary: 'The benefits of this specific regional wheat variety for daily rotis.',
    tags: ['Grains', 'Wheat', 'Nutrition'],
    body: [
      'Lokwan wheat is renowned for its excellent gluten quality, which makes soft, pliable rotis that stay fresh longer.',
      'Sourced directly from farmers, it avoids the harsh processing and bleaching that commercial flours undergo.',
      'Its naturally sweeter taste and golden color make it superior to generic blended market wheat.',
    ],
  },
  {
    slug: 'sweet-benefits-gulkand',
    title: 'Gulkand: More Than Just a Sweet Treat',
    date: '2026-04-22',
    summary: 'The medicinal and culinary uses of traditional rose preserve.',
    tags: ['Essentials', 'Ayurveda', 'Sweeteners'],
    body: [
      'Authentic Gulkand is sun-cooked over several weeks, a slow process that preserves the cooling properties of the rose petals.',
      'It is highly effective in treating acidity, heartburn, and lethargy, especially during the summer months.',
      'A spoonful after meals aids digestion and acts as a natural, healthy mouth freshener.',
    ],
  },
  {
    slug: 'garlic-onion-powder',
    title: 'The Convenience of Garlic and Onion Powder',
    date: '2026-04-27',
    summary: 'Elevating everyday meals with instant flavor boosters.',
    tags: ['Spices', 'Cooking Hacks', 'Convenience'],
    body: [
      'Garlic and onion powders provide a concentrated, robust flavor profile that distributes more evenly in dishes than fresh pieces.',
      'They are perfect for dry rubs, marinades, and sprinkling over roasted snacks where moisture from fresh alliums is unwanted.',
      'Having these powders on hand eliminates peeling and chopping time, making weeknight dinners significantly faster.',
    ],
  },
  {
    slug: 'farm-to-table-journey',
    title: 'The Annavedah Farm to Table Journey',
    date: '2026-05-02',
    summary: 'How we ensure purity from the soil to your pantry.',
    tags: ['Transparency', 'Farming', 'Quality'],
    body: [
      'We partner directly with local farmers, eliminating middlemen to ensure fair compensation and traceabilty of every grain.',
      'Our products undergo minimal processing; we rely on traditional methods like sun-drying and stone-grinding whenever possible.',
      'This direct supply chain guarantees that the food reaches your kitchen faster, fresher, and without synthetic preservatives.',
    ],
  },
  {
    slug: 'exploring-chutneys',
    title: 'Exploring Traditional Maharashtrian Chutneys',
    date: '2026-05-07',
    summary: 'Adding a punch of flavor to every meal.',
    tags: ['Chutney', 'Condiments', 'Heritage'],
    body: [
      'Dry chutneys like Shengdana (peanut) and Kanda Lasun (onion garlic) are staples that instantly elevate a simple meal of dal and rice.',
      'They are made by dry-roasting ingredients to perfection, which extends their shelf life naturally without chemical preservatives.',
      'Mixing a spoonful of dry chutney with yogurt or cold-pressed oil creates a quick, delicious dip for bhakris and snacks.',
    ],
  },
  {
    slug: 'sweet-potato-powder',
    title: 'Baking and Cooking with Sweet Potato Powder',
    date: '2026-05-12',
    summary: 'A versatile, gluten-free addition to your pantry.',
    tags: ['Superfoods', 'Baking', 'Gluten-Free'],
    body: [
      'Sweet potato powder is a fantastic gluten-free flour alternative that adds natural sweetness and moisture to baked goods.',
      'It is rich in beta-carotene, supporting eye health and immune function naturally.',
      'You can easily use it to thicken soups or mix it into pancake batters for a nutritious breakfast upgrade.',
    ],
  },
  {
    slug: 'benefits-of-amla-powder',
    title: 'Amla Powder: The Vitamin C Powerhouse',
    date: '2026-05-17',
    summary: 'Incorporating the Indian gooseberry into your daily routine.',
    tags: ['Nutrition', 'Ayurveda', 'Immunity'],
    body: [
      'Amla is one of the most concentrated natural sources of Vitamin C, containing significantly more than oranges.',
      'Regular consumption of amla powder supports healthy hair, glowing skin, and a robust immune system.',
      'Mix half a teaspoon with warm water and honey on an empty stomach for an invigorating morning detox drink.',
    ],
  },
  {
    slug: 'understanding-unpolished-pulses',
    title: 'Why Unpolished Pulses Cook and Taste Better',
    date: '2026-05-22',
    summary: 'The difference between shiny market dals and farm-fresh pulses.',
    tags: ['Pulses', 'Nutrition', 'Cooking'],
    body: [
      'Polished pulses undergo treatments with oil, water, or leather to look shiny, which strips away essential surface nutrients.',
      'Unpolished dals retain their natural fiber, which helps in better digestion and a steadier release of energy.',
      'They offer a more authentic, earthy flavor and tend to hold their shape better when cooked, avoiding the mushiness of processed dals.',
    ],
  },
  {
    slug: 'heritage-of-bhakri',
    title: 'The Heritage of Bhakri: A Nutritional Staple',
    date: '2026-05-27',
    summary: 'Celebrating the traditional millet flatbread of Maharashtra.',
    tags: ['Heritage', 'Millets', 'Breads'],
    body: [
      'Bhakri is a rustic, unleavened flatbread made from millets like Jowar or Bajra, requiring more skill to hand-press than wheat rotis.',
      'It is completely gluten-free and has a lower glycemic index, making it ideal for sustained energy and blood sugar management.',
      'Paired with a spicy dry chutney or a rich curry, Bhakri represents the wholesome essence of traditional Maharashtrian village cuisine.',
    ],
  },
  {
    slug: 'the-importance-of-pure-spices',
    title: 'The Importance of Pure, Unadulterated Spices',
    date: '2026-06-01',
    summary: 'Why the quality of your spice rack matters for your health.',
    tags: ['Spices', 'Quality', 'Health'],
    body: [
      'Many commercial spices contain fillers, artificial colors, or anti-caking agents that dilute their natural benefits.',
      'Pure, stone-ground spices retain their essential oils, meaning you need to use less to achieve the same depth of flavor.',
      'Investing in high-quality spices ensures you receive the full medicinal benefits of compounds like curcumin in turmeric or piperine in black pepper.',
    ],
  },
  {
    slug: 'sustainable-eating-with-millets',
    title: 'Sustainable Eating: The Return of Millets',
    date: '2026-06-05',
    summary: 'How ancient grains are good for you and the planet.',
    tags: ['Sustainability', 'Millets', 'Environment'],
    body: [
      'Millets are highly resilient crops that require significantly less water to grow compared to rice or wheat, making them environmentally sustainable.',
      'They thrive in poor soil conditions without the need for synthetic fertilizers or pesticides.',
      'By incorporating millets into our diet, we not only improve our own nutrition but also support a more sustainable and climate-resilient food system.',
    ],
  },
]

const blogImageMap: Record<string, string> = {
  'how-to-choose-powders': '/blog/choose-powders.png',
  'traditional-grains-comeback': '/blog/traditional-grains.png',
  'easy-pulse-prep': '/blog/pulse-prep.png',
  'moringa-powder-benefits': '/blog/moringa-benefits.png',
  'unpolished-indrayani-rice': '/blog/indrayani-rice.png',
  'magic-of-thalipeeth': '/blog/thalipeeth.png',
  'benefits-of-a2-ghee': '/blog/a2-ghee.png',
  'dehydrated-veg-powders': '/blog/dehydrated-veg.png',
  'incorporating-ragi': '/blog/ragi-recipes.png',
  'raw-forest-honey': '/blog/raw-honey.png',
  'spices-for-digestion': '/blog/digestive-spices.png',
  'maharashtrian-dry-snacks': '/blog/dry-snacks.png',
  'fasting-foods-sabudana': '/blog/sabudana-fasting.png',
  'protein-packed-rajma': '/blog/rajma-protein.png',
  'turmeric-golden-spice': '/blog/turmeric-golden.png',
  'beetroot-powder-uses': '/blog/beetroot-powder.png',
  'perfect-dal-guide': '/blog/perfect-dal.png',
  'summer-cooling-foods': '/blog/summer-cooling.png',
  'winter-immunity-boosters': '/blog/winter-immunity.png',
  'lokwan-wheat-benefits': '/blog/lokwan-wheat.png',
  'sweet-benefits-gulkand': '/blog/gulkand.png',
  'garlic-onion-powder': '/blog/garlic-onion.png',
  'farm-to-table-journey': '/blog/farm-to-table.png',
  'exploring-chutneys': '/blog/chutneys.png',
  'sweet-potato-powder': '/blog/sweet-potato.png',
  'benefits-of-amla-powder': '/blog/amla-powder.png',
  'understanding-unpolished-pulses': '/blog/unpolished-pulses.png',
  'heritage-of-bhakri': '/blog/bhakri-heritage.png',
  'the-importance-of-pure-spices': '/blog/pure-spices.png',
  'sustainable-eating-with-millets': '/blog/millets-sustainable.png',
}

blogPosts.forEach((post) => {
  if (blogImageMap[post.slug]) post.image = blogImageMap[post.slug]
})
