import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  Truck,
  Sparkles,
  ShoppingBag,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Info,
  ChevronRight,
  Package,
  Heart,
  Plus,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { MedicineProduct, MedicineCategory, PharmacyOrder } from '../types';

interface PharmacyStoreProps {
  initialCategory?: MedicineCategory | 'ALL';
}

export const PharmacyStore: React.FC<PharmacyStoreProps> = ({ initialCategory = 'ALL' }) => {
  const { addToCart, setIsCartOpen, totalItems } = useCart();
  const { user, token } = useAuth();

  const [products, setProducts] = useState<MedicineProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'store' | 'orders'>('store');
  const [orders, setOrders] = useState<PharmacyOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSpecies, setSelectedSpecies] = useState<string>('All');
  const [rxFilter, setRxFilter] = useState<'ALL' | 'RX_ONLY' | 'OTC_ONLY'>('ALL');
  const [sortOption, setSortOption] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');

  // Selected Product Detail Modal
  const [selectedProduct, setSelectedProduct] = useState<MedicineProduct | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const categories: { key: string; label: string; icon: string }[] = [
    { key: 'ALL', label: 'All Products', icon: '🐾' },
    { key: 'PRESCRIPTION_RX', label: 'Prescription Rx', icon: '💊' },
    { key: 'FLEA_TICK_DEWORMING', label: 'Flea & Tick Defense', icon: '🛡️' },
    { key: 'JOINT_MOBILITY', label: 'Joint & Mobility', icon: '🦴' },
    { key: 'DIGESTIVE_PROBIOTICS', label: 'Digestive & Gut', icon: '🌱' },
    { key: 'SKIN_DERMATOLOGY', label: 'Skin & Allergy', icon: '✨' },
    { key: 'ANTIBIOTICS_PAIN', label: 'Antibiotics & Pain', icon: '🩺' },
    { key: 'EAR_EYE_CARE', label: 'Ear & Eye Care', icon: '👁️' },
    { key: 'FIRST_AID_WELLNESS', label: 'First Aid & Recovery', icon: '🩹' },
  ];

  const speciesOptions = ['All', 'Dogs', 'Cats', 'Birds', 'Horses', 'Rabbits'];

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedSpecies, rxFilter, sortOption]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'ALL') {
        params.append('category', selectedCategory);
      }
      if (selectedSpecies && selectedSpecies !== 'All') {
        params.append('species', selectedSpecies);
      }
      if (rxFilter === 'RX_ONLY') {
        params.append('rxOnly', 'true');
      } else if (rxFilter === 'OTC_ONLY') {
        params.append('rxOnly', 'false');
      }
      if (sortOption) {
        params.append('sort', sortOption);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const res = await fetch(`/api/pharmacy/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Error fetching pharmacy products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders when orders tab is activated
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/pharmacy/orders', { headers });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load pharmacy orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleQuickAdd = (product: MedicineProduct) => {
    addToCart(product, 1);
    setAddedToast(`Added ${product.name} to cart`);
    setTimeout(() => setAddedToast(null), 2500);
  };

  const handleModalAddToCart = () => {
    if (!selectedProduct) return;
    addToCart(selectedProduct, modalQuantity);
    setAddedToast(`Added ${modalQuantity}x ${selectedProduct.name} to cart`);
    setSelectedProduct(null);
    setModalQuantity(1);
    setTimeout(() => setAddedToast(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Toast Feedback */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs border border-slate-800 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{addedToast}</span>
          <button
            onClick={() => setIsCartOpen(true)}
            className="ml-2 text-teal-400 hover:text-teal-300 font-bold underline"
          >
            View Bag
          </button>
        </div>
      )}

      {/* Top Hero Banner */}
      <div className="bg-gradient-to-b from-teal-900 via-teal-800 to-slate-900 text-white pt-6 pb-8 sm:pt-10 sm:pb-12 px-3 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-semibold backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
                <span>Licensed Veterinary Tele-Pharmacy</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-outfit text-white">
                Online Pet Pharmacy & Medicine Store
              </h1>
              <p className="text-sm text-teal-100/90 leading-relaxed">
                Order prescription medications authorized by your VetCare tele-veterinarian, preventative flea & tick chewables, joint supplements, and clinical pet wellness essentials with cold-chain guaranteed delivery.
              </p>
            </div>

            {/* View switcher pills */}
            <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80 shrink-0">
              <button
                onClick={() => setActiveTab('store')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === 'store'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Browse Medicines</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === 'orders'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>My Pharmacy Orders</span>
                {orders.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-teal-500/80 text-[10px] flex items-center justify-center text-white">
                    {orders.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 border-t border-teal-700/50 mt-8 text-xs">
            <div className="flex items-center gap-2 text-teal-100">
              <ShieldCheck className="w-4 h-4 text-teal-300 shrink-0" />
              <span>100% Genuine Certified Drugs</span>
            </div>
            <div className="flex items-center gap-2 text-teal-100">
              <Truck className="w-4 h-4 text-teal-300 shrink-0" />
              <span>Free Delivery Over $35</span>
            </div>
            <div className="flex items-center gap-2 text-teal-100">
              <Sparkles className="w-4 h-4 text-teal-300 shrink-0" />
              <span>Direct Telehealth Sync</span>
            </div>
            <div className="flex items-center gap-2 text-teal-100">
              <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
              <span>Refrigerated Cold-Chain</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {activeTab === 'store' ? (
          <div className="space-y-6">
            {/* Search & Species Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                {/* Search Form */}
                <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search medicine, active ingredient (e.g. Carprofen), or symptom..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-20 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-600 font-medium"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setTimeout(fetchProducts, 50);
                      }}
                      className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Search
                  </button>
                </form>

                {/* Filter toggles (Rx vs OTC & Sort) */}
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                  <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium shrink-0">
                    <button
                      onClick={() => setRxFilter('ALL')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        rxFilter === 'ALL'
                          ? 'bg-white text-slate-900 font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All Types
                    </button>
                    <button
                      onClick={() => setRxFilter('RX_ONLY')}
                      className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                        rxFilter === 'RX_ONLY'
                          ? 'bg-amber-100 text-amber-900 font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Rx Only</span>
                    </button>
                    <button
                      onClick={() => setRxFilter('OTC_ONLY')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        rxFilter === 'OTC_ONLY'
                          ? 'bg-emerald-100 text-emerald-900 font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Over-the-Counter
                    </button>
                  </div>

                  <select
                    value={sortOption}
                    onChange={(e: any) => setSortOption(e.target.value)}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-600 shrink-0"
                  >
                    <option value="featured">Featured First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>

              {/* Species Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-t border-slate-100 pt-3">
                <span className="text-slate-400 font-semibold text-[11px] shrink-0 uppercase tracking-wider">
                  Target Pet:
                </span>
                {speciesOptions.map((species) => {
                  const active = selectedSpecies === species;
                  return (
                    <button
                      key={species}
                      onClick={() => setSelectedSpecies(species)}
                      className={`px-3 py-1 rounded-full font-semibold transition shrink-0 ${
                        active
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {species}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Pills Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => {
                const active = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 flex items-center gap-2 border ${
                      active
                        ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:text-teal-700'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Loading veterinary medicine catalog...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No matching medicines found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search keywords, clear the Rx filter, or select "All Products" to view our complete pharmacy catalog.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                    setSelectedSpecies('All');
                    setRxFilter('ALL');
                    setSortOption('featured');
                  }}
                  className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-3xl border border-slate-200/90 hover:border-teal-500/70 hover:shadow-md transition duration-200 flex flex-col overflow-hidden group"
                  >
                    {/* Image Box */}
                    <div className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                      {/* Rx vs OTC Tag */}
                      <div className="absolute top-3 left-3">
                        {product.requiresPrescription ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                            <ShieldCheck className="w-3 h-3" /> Rx Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                            Over-the-Counter
                          </span>
                        )}
                      </div>

                      {/* Species badges */}
                      <div className="absolute bottom-3 left-3 flex gap-1 flex-wrap">
                        {product.targetSpecies.map((sp) => (
                          <span
                            key={sp}
                            className="px-2 py-0.5 rounded-md bg-slate-900/70 text-white backdrop-blur-xs text-[10px] font-semibold"
                          >
                            {sp}
                          </span>
                        ))}
                      </div>

                      {product.originalPrice && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
                          Save ${(product.originalPrice - product.price).toFixed(2)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-semibold truncate">{product.brand}</span>
                          <span className="flex items-center gap-1 text-amber-500 font-bold shrink-0">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {product.rating} <span className="text-slate-400">({product.reviewsCount})</span>
                          </span>
                        </div>

                        <h3
                          onClick={() => setSelectedProduct(product)}
                          className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-teal-700 cursor-pointer transition font-outfit"
                        >
                          {product.name}
                        </h3>

                        {product.strength && (
                          <p className="text-[11px] font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md inline-block">
                            Strength: {product.strength}
                          </p>
                        )}

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      {/* Price & Action */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-black text-slate-900 font-mono">
                              ${product.price.toFixed(2)}
                            </span>
                            {product.originalPrice && (
                              <span className="text-xs text-slate-400 line-through font-mono">
                                ${product.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[130px]">
                            {product.packageSize}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="p-2 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition"
                            title="Product details"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleQuickAdd(product)}
                            className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ORDERS & TRACKING TAB */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-outfit">My Pharmacy Orders & Deliveries</h2>
                <p className="text-xs text-slate-500">Track medication fulfillment, cold-chain courier dispatches, and past invoices</p>
              </div>
              <button
                onClick={fetchOrders}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Status</span>
              </button>
            </div>

            {ordersLoading ? (
              <div className="py-20 text-center">
                <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500 mt-2">Loading your prescription order history...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No pharmacy orders yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When you purchase veterinary medicines, joint supplements, or flea treatments, your live tracking details will show here.
                </p>
                <button
                  onClick={() => setActiveTab('store')}
                  className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const isDelivered = order.orderStatus === 'DELIVERED';
                  const isPendingRx = order.orderStatus === 'PHARMACIST_VERIFYING';
                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm font-mono">#{order.id}</span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                isDelivered
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isPendingRx
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-teal-100 text-teal-800'
                              }`}
                            >
                              {order.orderStatus.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Ordered on {new Date(order.createdAt).toLocaleDateString()} • {order.paymentMethod}
                          </span>
                        </div>

                        <div className="text-left sm:text-right">
                          <div className="text-sm font-extrabold text-slate-900 font-mono">
                            ${order.totalAmount.toFixed(2)}
                          </div>
                          <div className="text-[11px] text-teal-700 font-semibold flex items-center sm:justify-end gap-1">
                            <Truck className="w-3 h-3" />
                            <span>Tracking: {order.trackingNumber}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Stepper */}
                      <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60">
                        <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                          <div className="space-y-1">
                            <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center mx-auto text-[9px] font-bold">
                              ✓
                            </div>
                            <span className="font-bold text-slate-800 block">Placed</span>
                          </div>
                          <div className="space-y-1">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center mx-auto text-[9px] font-bold ${
                              order.orderStatus !== 'PHARMACIST_VERIFYING' ? 'bg-teal-600 text-white' : 'bg-slate-300 text-slate-600'
                            }`}>
                              ✓
                            </div>
                            <span className="font-bold text-slate-800 block">Rx Verified</span>
                          </div>
                          <div className="space-y-1">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center mx-auto text-[9px] font-bold ${
                              order.orderStatus === 'DISPATCHED' || order.orderStatus === 'DELIVERED' ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'
                            }`}>
                              3
                            </div>
                            <span className="font-medium text-slate-600 block">Cold Packed</span>
                          </div>
                          <div className="space-y-1">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center mx-auto text-[9px] font-bold ${
                              isDelivered ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                            }`}>
                              {isDelivered ? '✓' : '4'}
                            </div>
                            <span className={`font-medium block ${isDelivered ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                              {isDelivered ? 'Delivered' : 'In Transit'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Item rows */}
                      <div className="divide-y divide-slate-100">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                              />
                              <div>
                                <h4 className="font-bold text-slate-900">{item.productName}</h4>
                                <p className="text-[11px] text-slate-500">
                                  Qty: {item.quantity} • {item.dosageForm || item.packageSize}
                                </p>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-slate-800">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Footer & Destination */}
                      <div className="border-t border-slate-100 pt-3 flex flex-col sm:flex-row justify-between sm:items-center text-xs text-slate-600 gap-2">
                        <span>
                          <strong>Delivery To:</strong> {order.shippingAddress.fullName} • {order.shippingAddress.street}, {order.shippingAddress.city}
                        </span>
                        <span className="text-teal-700 font-semibold">
                          Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* DETAILED PRODUCT MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            {/* Modal Header Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                {selectedProduct.requiresPrescription ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" /> Prescription Required
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                    Over-the-Counter Medicine
                  </span>
                )}
                <span className="text-xs text-slate-500 font-medium">
                  {selectedProduct.brand}
                </span>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-5 text-xs text-slate-700">
              <div className="flex flex-col sm:flex-row gap-5">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-full sm:w-48 h-48 rounded-2xl object-cover border border-slate-100 shrink-0"
                />
                <div className="space-y-2 flex-1">
                  <h3 className="text-lg font-bold text-slate-900 font-outfit leading-tight">
                    {selectedProduct.name}
                  </h3>

                  {selectedProduct.genericName && (
                    <p className="text-xs text-slate-500 font-medium">
                      Active Molecule: <strong className="text-slate-700">{selectedProduct.genericName}</strong>
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      ${selectedProduct.price.toFixed(2)}
                    </span>
                    {selectedProduct.originalPrice && (
                      <span className="text-sm text-slate-400 line-through font-mono">
                        ${selectedProduct.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="pt-1 flex flex-wrap gap-2 text-[11px]">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-semibold text-slate-700">
                      Form: {selectedProduct.dosageForm || 'Standard'}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-semibold text-slate-700">
                      Pack: {selectedProduct.packageSize}
                    </span>
                    {selectedProduct.strength && (
                      <span className="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-800 font-bold">
                        {selectedProduct.strength}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Rx Dispensing Notice */}
              {selectedProduct.requiresPrescription && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>How Prescription Dispensing Works on VetCare</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    You can instantly attach a prescription issued by Dr. Sarah Jenkins or any of your past VetCare telehealth consultations at checkout. Alternatively, you may upload an image/PDF of a written slip from your local clinic.
                  </p>
                </div>
              )}

              {/* Indications */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Clinical Indications</h4>
                <p className="text-slate-600 leading-relaxed">{selectedProduct.indications}</p>
              </div>

              {/* Dosage Guide */}
              {selectedProduct.dosageGuide && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Dosage & Administration</h4>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedProduct.dosageGuide}
                  </p>
                </div>
              )}

              {/* Warnings / Side Effects */}
              {selectedProduct.warnings && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-red-800 text-xs uppercase tracking-wider">Precautions & Warnings</h4>
                  <p className="text-slate-600 leading-relaxed">{selectedProduct.warnings}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                  className="px-3 py-2 hover:bg-slate-100 text-slate-700 font-bold transition"
                >
                  -
                </button>
                <span className="px-3 py-2 text-xs font-bold text-slate-800 min-w-[32px] text-center">
                  {modalQuantity}
                </span>
                <button
                  onClick={() => setModalQuantity(modalQuantity + 1)}
                  className="px-3 py-2 hover:bg-slate-100 text-slate-700 font-bold transition"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleModalAddToCart}
                className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-600/20 transition flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart • ${(selectedProduct.price * modalQuantity).toFixed(2)}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
