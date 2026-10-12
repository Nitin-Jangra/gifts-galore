import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem('gg_cart');
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('gg_cart', JSON.stringify(items));
    } catch (err) {
      console.error('Failed to sync cart to localStorage:', err);
    }
  }, [items]);

  const addToCart = (product, quantity = 1, customizationSnapshot = null) => {
    setItems((prev) => {
      // If product has customization, treat each unique customization as a separate line item
      const itemKey = customizationSnapshot
        ? `${product.id}_${Date.now()}`
        : product.id;

      const existingIndex = prev.findIndex((i) => i.itemKey === itemKey);

      if (existingIndex > -1 && !customizationSnapshot) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [
        ...prev,
        {
          itemKey,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
          imageUrl: product.images?.[0]?.imageUrl || '',
          sellerName: product.seller?.storeName || 'Gifts Galore, Loharu',
          quantity,
          customizationSnapshot,
        },
      ];
    });
  };

  const removeFromCart = (itemKey) => {
    setItems((prev) => prev.filter((i) => i.itemKey !== itemKey));
  };

  const updateQuantity = (itemKey, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemKey);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.itemKey === itemKey ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const effectivePrice = item.discountPrice || item.price;
    return sum + effectivePrice * item.quantity;
  }, 0);

  const shipping = subtotal >= 999 || items.length === 0 ? 0 : 99;
  const grandTotal = subtotal + shipping;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemsCount,
        subtotal,
        shipping,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
