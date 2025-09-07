"use client";

import { Box, Container, Typography, Paper, Grid, Card, CardContent, CardActions, Button, LinearProgress, Alert, AlertTitle, Chip, List, ListItem, ListItemText, ListItemIcon, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, TextField, Tabs, Tab, IconButton, Tooltip, Badge, Avatar, Rating, Divider } from "@mui/material";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCartIcon,
  AddShoppingCartIcon,
  FavoriteIcon,
  FavoriteBorderIcon,
  SearchIcon,
  FilterListIcon,
  SortIcon,
  LocalShippingIcon,
  PaymentIcon,
  SecurityIcon,
  StarIcon,
  TrendingUpIcon,
  CategoryIcon,
  ShoppingBagIcon,
  ReceiptIcon,
  StoreIcon,
  DiscountIcon
} from "@mui/icons-material";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  category: string;
  brand: string;
  image: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  discount?: number;
  tags: string[];
  seller: {
    id: string;
    name: string;
    rating: number;
    verified: boolean;
  };
}

interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  addedAt: string;
}

interface WishlistItem {
  id: string;
  product: Product;
  addedAt: string;
}

export default function ShoppingPage() {
  const { data: session, status } = useSession();
  const { user } = useUser();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: '', label: 'All Categories', icon: <CategoryIcon /> },
    { value: 'electronics', label: 'Electronics', icon: <TrendingUpIcon /> },
    { value: 'clothing', label: 'Clothing', icon: <ShoppingBagIcon /> },
    { value: 'home', label: 'Home & Garden', icon: <StoreIcon /> },
    { value: 'books', label: 'Books', icon: <ReceiptIcon /> },
    { value: 'sports', label: 'Sports', icon: <StarIcon /> },
    { value: 'beauty', label: 'Beauty', icon: <FavoriteIcon /> }
  ];

  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest' }
  ];

  // Mock products data
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones',
      description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
      price: 199.99,
      originalPrice: 249.99,
      currency: 'USD',
      category: 'electronics',
      brand: 'TechSound',
      image: '/api/placeholder/300/200',
      rating: 4.5,
      reviewCount: 128,
      inStock: true,
      discount: 20,
      tags: ['wireless', 'bluetooth', 'noise-cancellation'],
      seller: {
        id: 'seller1',
        name: 'TechStore Pro',
        rating: 4.8,
        verified: true
      }
    },
    {
      id: '2',
      name: 'Organic Cotton T-Shirt',
      description: 'Comfortable and sustainable organic cotton t-shirt in various colors.',
      price: 29.99,
      currency: 'USD',
      category: 'clothing',
      brand: 'EcoWear',
      image: '/api/placeholder/300/200',
      rating: 4.2,
      reviewCount: 89,
      inStock: true,
      tags: ['organic', 'cotton', 'sustainable'],
      seller: {
        id: 'seller2',
        name: 'Green Fashion',
        rating: 4.6,
        verified: true
      }
    },
    {
      id: '3',
      name: 'Smart Home Security Camera',
      description: 'AI-powered security camera with night vision and mobile app control.',
      price: 149.99,
      originalPrice: 199.99,
      currency: 'USD',
      category: 'electronics',
      brand: 'SecureHome',
      image: '/api/placeholder/300/200',
      rating: 4.7,
      reviewCount: 203,
      inStock: true,
      discount: 25,
      tags: ['smart-home', 'security', 'ai'],
      seller: {
        id: 'seller3',
        name: 'Smart Solutions',
        rating: 4.9,
        verified: true
      }
    }
  ];

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    fetchShoppingData();
  }, [session, status, router]);

  const fetchShoppingData = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from API
      setProducts(mockProducts);
      setCart([]);
      setWishlist([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: Date.now().toString(),
        product,
        quantity: 1,
        addedAt: new Date().toISOString()
      }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const toggleWishlist = (product: Product) => {
    const existingItem = wishlist.find(item => item.product.id === product.id);
    if (existingItem) {
      setWishlist(wishlist.filter(item => item.product.id !== product.id));
    } else {
      setWishlist([...wishlist, {
        id: Date.now().toString(),
        product,
        addedAt: new Date().toISOString()
      }]);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.product.id === productId);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id.localeCompare(a.id);
      default:
        return b.reviewCount - a.reviewCount; // popularity
    }
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (status === "loading" || loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading Shopping Hub...
            </Typography>
          </Paper>
        </motion.div>
      </Box>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      pt: 8, // Account for navbar
    }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              fontWeight="bold" 
              sx={{ 
                color: 'white', 
                mb: 2,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              Shopping Hub
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Discover amazing products and deals from verified sellers
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}

          {/* Main Content */}
          <Paper sx={{ 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            p: 3
          }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ mb: 3 }}
            >
              <Tab 
                label={
                  <Badge badgeContent={getCartItemCount()} color="primary">
                    <ShoppingCartIcon sx={{ mr: 1 }} />
                    Products
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={cart.length} color="primary">
                    <ShoppingCartIcon sx={{ mr: 1 }} />
                    Cart
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={wishlist.length} color="secondary">
                    <FavoriteIcon sx={{ mr: 1 }} />
                    Wishlist
                  </Badge>
                } 
              />
            </Tabs>

            {/* Products Tab */}
            {activeTab === 0 && (
              <Box>
                {/* Search and Filters */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      ),
                    }}
                    sx={{ minWidth: 300 }}
                  />
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      label="Category"
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.value} value={category.value}>
                          {category.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      label="Sort By"
                    >
                      {sortOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    Filters
                  </Button>
                </Box>

                {/* Price Range Filter */}
                {showFilters && (
                  <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" gutterBottom>
                      Price Range
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <TextField
                        label="Min Price"
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        size="small"
                      />
                      <Typography>-</Typography>
                      <TextField
                        label="Max Price"
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        size="small"
                      />
                    </Box>
                  </Paper>
                )}

                {/* Products Grid */}
                <Grid container spacing={3}>
                  {sortedProducts.map((product, index) => (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Card sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            transition: 'transform 0.2s ease-in-out'
                          }
                        }}>
                          {product.discount && (
                            <Chip
                              label={`${product.discount}% OFF`}
                              color="error"
                              size="small"
                              sx={{ 
                                position: 'absolute', 
                                top: 8, 
                                left: 8, 
                                zIndex: 1 
                              }}
                            />
                          )}
                          
                          <IconButton
                            sx={{ 
                              position: 'absolute', 
                              top: 8, 
                              right: 8, 
                              zIndex: 1,
                              bgcolor: 'rgba(255,255,255,0.9)'
                            }}
                            onClick={() => toggleWishlist(product)}
                          >
                            {isInWishlist(product.id) ? 
                              <FavoriteIcon color="error" /> : 
                              <FavoriteBorderIcon />
                            }
                          </IconButton>

                          <CardContent sx={{ flexGrow: 1, p: 2 }}>
                            <Box sx={{ 
                              height: 200, 
                              bgcolor: 'grey.100', 
                              borderRadius: 1, 
                              mb: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Typography color="text.secondary">
                                {product.name}
                              </Typography>
                            </Box>
                            
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                              {product.name}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {product.description}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <Rating value={product.rating} readOnly size="small" />
                              <Typography variant="caption" color="text.secondary">
                                ({product.reviewCount})
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <Typography variant="h6" fontWeight="bold" color="primary">
                                {formatCurrency(product.price, product.currency)}
                              </Typography>
                              {product.originalPrice && (
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    textDecoration: 'line-through',
                                    color: 'text.secondary'
                                  }}
                                >
                                  {formatCurrency(product.originalPrice, product.currency)}
                                </Typography>
                              )}
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                                {product.seller.name.charAt(0)}
                              </Avatar>
                              <Typography variant="caption">
                                {product.seller.name}
                              </Typography>
                              {product.seller.verified && (
                                <SecurityIcon color="primary" fontSize="small" />
                              )}
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {product.tags.slice(0, 2).map((tag, tagIndex) => (
                                <Chip
                                  key={tagIndex}
                                  label={tag}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </CardContent>
                          
                          <CardActions sx={{ p: 2, pt: 0 }}>
                            <Button
                              variant="contained"
                              fullWidth
                              startIcon={<AddShoppingCartIcon />}
                              onClick={() => addToCart(product)}
                              disabled={!product.inStock}
                            >
                              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                            </Button>
                          </CardActions>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Cart Tab */}
            {activeTab === 1 && (
              <Box>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                  Shopping Cart ({getCartItemCount()} items)
                </Typography>
                
                {cart.length === 0 ? (
                  <Box textAlign="center" py={6}>
                    <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                      Your cart is empty
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                      Add some products to get started!
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => setActiveTab(0)}
                    >
                      Continue Shopping
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <List>
                      {cart.map((item) => (
                        <ListItem key={item.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 2 }}>
                          <ListItemIcon>
                            <Box sx={{ 
                              width: 60, 
                              height: 60, 
                              bgcolor: 'grey.100', 
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <ShoppingBagIcon />
                            </Box>
                          </ListItemIcon>
                          <ListItemText
                            primary={item.product.name}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {item.product.brand}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                  <Button
                                    size="small"
                                    onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                                  >
                                    -
                                  </Button>
                                  <Typography variant="body1" fontWeight="medium">
                                    {item.quantity}
                                  </Typography>
                                  <Button
                                    size="small"
                                    onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                                  >
                                    +
                                  </Button>
                                  <Typography variant="h6" color="primary" sx={{ ml: 2 }}>
                                    {formatCurrency(item.product.price * item.quantity, item.product.currency)}
                                  </Typography>
                                </Box>
                              </Box>
                            }
                          />
                          <IconButton
                            onClick={() => removeFromCart(item.product.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItem>
                      ))}
                    </List>
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h5" fontWeight="bold">
                        Total: {formatCurrency(getCartTotal(), 'USD')}
                      </Typography>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<PaymentIcon />}
                        sx={{ borderRadius: 2 }}
                      >
                        Checkout
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {/* Wishlist Tab */}
            {activeTab === 2 && (
              <Box>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                  Wishlist ({wishlist.length} items)
                </Typography>
                
                {wishlist.length === 0 ? (
                  <Box textAlign="center" py={6}>
                    <FavoriteIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                      Your wishlist is empty
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                      Save products you love for later!
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => setActiveTab(0)}
                    >
                      Browse Products
                    </Button>
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {wishlist.map((item, index) => (
                      <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                          <Card sx={{ 
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative'
                          }}>
                            <IconButton
                              sx={{ 
                                position: 'absolute', 
                                top: 8, 
                                right: 8, 
                                zIndex: 1,
                                bgcolor: 'rgba(255,255,255,0.9)'
                              }}
                              onClick={() => toggleWishlist(item.product)}
                            >
                              <FavoriteIcon color="error" />
                            </IconButton>

                            <CardContent sx={{ flexGrow: 1, p: 2 }}>
                              <Box sx={{ 
                                height: 200, 
                                bgcolor: 'grey.100', 
                                borderRadius: 1, 
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <Typography color="text.secondary">
                                  {item.product.name}
                                </Typography>
                              </Box>
                              
                              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                                {item.product.name}
                              </Typography>
                              
                              <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
                                {formatCurrency(item.product.price, item.product.currency)}
                              </Typography>
                            </CardContent>
                            
                            <CardActions sx={{ p: 2, pt: 0 }}>
                              <Button
                                variant="contained"
                                fullWidth
                                startIcon={<AddShoppingCartIcon />}
                                onClick={() => addToCart(item.product)}
                              >
                                Add to Cart
                              </Button>
                            </CardActions>
                          </Card>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
