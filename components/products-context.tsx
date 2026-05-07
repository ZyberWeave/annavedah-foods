'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Product } from '@/lib/content';

type ProductsContextValue = {
  products: Product[];
  productMap: Map<number, Product>;
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({
  children,
  initialProducts,
}: {
  children: ReactNode;
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState(initialProducts);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const value = useMemo(
    () => ({
      products,
      productMap: new Map(products.map((product) => [product.id, product])),
    }),
    [products],
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProductsData() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProductsData must be used within ProductsProvider');
  }

  return context;
}
