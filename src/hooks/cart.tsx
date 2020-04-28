import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const response = await AsyncStorage.getItem('@desafiorn:products');
      if (response) {
        setProducts(JSON.parse(response));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      let isNew = true;
      if (products.length > 0) {
        products.map((search, index) => {
          if (search.id === product.id) {
            isNew = false;
            const editProduct = search;
            editProduct.quantity += 1;
            setProducts(
              products.map(el => {
                el.id === editProduct.id ? editProduct : el;
              }),
            );
          }
        });
        if (isNew) {
          product.quantity = 1;
          setProducts([...products, product]);
        }
      } else {
        product.quantity = 1;
        setProducts([...products, product]);
      }

      await AsyncStorage.setItem(
        '@desafiorn:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // eslint-disable-next-line array-callback-return
      products.map(search => {
        if (search.id === id) {
          const editProduct = search;
          editProduct.quantity += 1;
          setProducts(
            products.map(product => (product.id === id ? search : product)),
          );
        }
      });
      await AsyncStorage.setItem(
        '@desafiorn:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      products.map(search => {
        if (search.id === id) {
          const editProduct = search;
          if (editProduct.quantity > 1) {
            editProduct.quantity -= 1;
            setProducts(
              products.map(product => (product.id === id ? search : product)),
            );
          }
        }
      });
      await AsyncStorage.setItem(
        '@desafiorn:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
