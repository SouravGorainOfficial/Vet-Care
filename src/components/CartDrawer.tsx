import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ShieldCheck,
  Truck,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { PharmacyCheckoutModal } from './PharmacyCheckoutModal';
import { PharmacyOrder } from '../types';

interface CartDrawerProps {
  onNavigateToOrders?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigateToOrders }) => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    totalItems,
  } = useCart();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<PharmacyOrder | null>(null);

  if (!isCartOpen) return null;

  const freeShippingThreshold = 35;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleOrderSuccess = (order: PharmacyOrder) => {
    setCompletedOrder(order);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          onClick={() => setIsCartOpen(false)}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        />

        {/* Slide-over panel */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm font-outfit">Pharmacy Shopping Cart</h3>
                  <p className="text-[11px] text-slate-500">{totalItems} medication item{totalItems !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Tracker */}
            <div className="px-5 py-3 bg-teal-50/60 border-b border-teal-100">
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span className="flex items-center gap-1.5 text-teal-800">
                  <Truck className="w-3.5 h-3.5" />
                  {remainingForFreeShipping === 0 ? (
                    <span className="font-bold text-emerald-700">✓ You unlocked FREE standard shipping!</span>
                  ) : (
                    <span>Add <strong className="text-teal-900">${remainingForFreeShipping.toFixed(2)}</strong> for FREE Shipping</span>
                  )}
                </span>
                <span className="text-[11px] text-teal-700 font-semibold">{progressPercent.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-teal-200/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-16 px-4 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Your pharmacy bag is empty</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Browse licensed pet medications, flea & tick prevention, supplements, and prescription remedies.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition"
                  >
                    Browse Online Pharmacy
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition shadow-2xs space-y-2.5"
                  >
                    <div className="flex gap-3">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-slate-900 text-xs truncate">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-slate-400 hover:text-red-500 p-1 transition"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {item.product.brand} • {item.product.dosageForm || item.product.packageSize}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5">
                          {item.product.requiresPrescription ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                              <ShieldCheck className="w-3 h-3" /> Rx Required
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Over the Counter
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-slate-200 text-slate-600 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 py-1 text-xs font-semibold text-slate-800 bg-white min-w-[28px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-slate-200 text-slate-600 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-slate-400 block">
                            (${item.product.price.toFixed(2)} each)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout Trigger */}
            {cartItems.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-900 font-mono">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Shipping:</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {subtotal >= 35 ? 'FREE' : '$4.99'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Estimated Total:</span>
                    <span className="text-teal-700 font-mono text-base">
                      ${(subtotal + (subtotal >= 35 ? 0 : 4.99)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-600/20 transition flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Licensed Dispensary
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-teal-600" /> Cold-Chain Safe
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <PharmacyCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Confirmed Banner / Modal */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-200 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Order Confirmed
              </span>
              <h3 className="text-xl font-bold text-slate-900 font-outfit mt-1">
                Medicine Order Dispatched!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Order <strong className="text-slate-800">#{completedOrder.id}</strong> has been received by our certified pharmacy staff.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Tracking Code:</span>
                <span className="font-mono font-bold text-teal-700">{completedOrder.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Delivery:</span>
                <span className="font-medium text-slate-800">
                  {new Date(completedOrder.estimatedDelivery).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    weekday: 'short',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deliver to:</span>
                <span className="font-medium text-slate-800 truncate max-w-[180px]">
                  {completedOrder.shippingAddress.street}, {completedOrder.shippingAddress.city}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900">
                <span>Total Charged:</span>
                <span className="font-mono text-teal-700">${completedOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setCompletedOrder(null);
                  setIsCartOpen(false);
                  if (onNavigateToOrders) onNavigateToOrders();
                }}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition"
              >
                View Order Tracking in Pharmacy
              </button>
              <button
                onClick={() => {
                  setCompletedOrder(null);
                  setIsCartOpen(false);
                }}
                className="w-full py-2.5 text-slate-600 hover:text-slate-900 text-xs font-semibold"
              >
                Close & Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
