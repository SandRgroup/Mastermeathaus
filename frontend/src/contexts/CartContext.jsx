import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, weight, subscribe) => {
    const price = parseFloat(product.price.replace('$', ''));
    const weightOz = parseFloat(weight.replace('oz', ''));
    const pricePerOz = price / 12;
    const finalPrice = pricePerOz * weightOz;

    const cartItem = {
      product_id: product._id,
      product_name: product.name,
      price: finalPrice,
      quantity: 1,
      weight: weight,
      subscribe: subscribe,
      image: product.image
    };

    const existingIndex = cart.findIndex(
      item => item.product_id === product._id && item.weight === weight && item.subscribe === subscribe
    );

    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, cartItem]);
    }
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, quantity) => {
    if (quantity <= 0) {
      removeFromCart(index);
    } else {
      const newCart = [...cart];
      newCart[index].quantity = quantity;
      setCart(newCart);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotal = () => {
    return cart.reduce((total, item) => {
      let itemTotal = item.price * item.quantity;
      if (item.subscribe) {
        itemTotal *= 0.9;
      }
      return total + itemTotal;
    }, 0);
  };

  const getItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotal,
      getItemCount,
      isOpen,
      setIsOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};
