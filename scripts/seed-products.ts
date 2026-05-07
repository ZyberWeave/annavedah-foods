import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  const { seedCurrentProducts } = await import('@/lib/products');
  const count = await seedCurrentProducts();
  console.log(`Seeded ${count} products.`);
}

main().catch((error) => {
  console.error('Product seed failed:', error);
  process.exit(1);
});
