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
    let cartItem;
    
    // Handle packages and boxes (type-based items with fixed prices)
    if (product.type === 'package' || product.type === 'box') {
      const price = typeof product.price === 'string' 
        ? parseFloat(product.price.replace('$', '')) 
        : product.price;
      
      cartItem = {
        product_id: product.id,
        product_name: product.name,
        price: price,
        quantity: 1,
        weight: product.type === 'package' ? 'package' : 'box',
        subscribe: false,
        image: product.image,
        type: product.type
      };
      
      const existingIndex = cart.findIndex(
        item => item.product_id === product.id && item.type === product.type
      );

      if (existingIndex >= 0) {
        const newCart = [...cart];
        newCart[existingIndex].quantity += 1;
        setCart(newCart);
      } else {
        setCart([...cart, cartItem]);
      }
      return;
    }
    
    // Handle regular products with weight-based pricing
    const price = typeof product.price === 'string' 
      ? parseFloat(product.price.replace('$', '')) 
      : product.price;
    const weightOz = weight ? parseFloat(weight.replace('oz', '')) : 12;
    const pricePerOz = price / 12;
    const finalPrice = pricePerOz * weightOz;

    cartItem = {
      product_id: product._id || product.id,
      product_name: product.name,
      price: finalPrice,
      quantity: 1,
      weight: weight || '12oz',
      subscribe: subscribe || false,
      image: product.image
    };

    const existingIndex = cart.findIndex(
      item => item.product_id === (product._id || product.id) && item.weight === (weight || '12oz') && item.subscribe === (subscribe || false)
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
