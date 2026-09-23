import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Package,
  MapPin,
  Phone,
  User as UserIcon,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Prescription, PharmacyOrder } from '../types';

interface PharmacyCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: PharmacyOrder) => void;
}

export const PharmacyCheckoutModal: React.FC<PharmacyCheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { cartItems, subtotal, clearCart } = useCart();
  const { user, token } = useAuth();

  const [shippingMethod, setShippingMethod] = useState<'STANDARD' | 'EXPRESS_COLD_CHAIN'>('STANDARD');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string>('');
  const [uploadOption, setUploadOption] = useState<'existing' | 'upload' | 'telehealth_link'>('existing');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Address Form State
  const [formData, setFormData] = useState({
    fullName: user?.name || 'Eleanor Vance',
    street: '742 Evergreen Terrace, Apt 4B',
    city: 'Seattle',
    stateZip: 'WA 98101',
    phone: user?.phone || '+1 (555) 234-5678',
    cardNumber: '4242 •••• •••• 4242',
    cardExp: '08/28',
    cardCvc: '883',
  });

  const hasRxItems = cartItems.some((item) => item.product.requiresPrescription);
  const shippingFee = shippingMethod === 'EXPRESS_COLD_CHAIN' ? 9.99 : (subtotal >= 35 ? 0.00 : 4.99);
  const grandTotal = subtotal + shippingFee;

  useEffect(() => {
    if (isOpen) {
      fetchUserPrescriptions();
    }
  }, [isOpen, token]);

  const fetchUserPrescriptions = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/prescriptions', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.prescriptions && Array.isArray(data.prescriptions)) {
          setPrescriptions(data.prescriptions);
          if (data.prescriptions.length > 0) {
            setSelectedPrescriptionId(data.prescriptions[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load prescriptions:', err);
    }
  };

  if (!isOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (hasRxItems && uploadOption === 'existing' && !selectedPrescriptionId && prescriptions.length === 0) {
      setErrorMsg('This order contains prescription medications. Please link an active veterinary prescription.');
      return;
    }

    try {
      setIsSubmitting(true);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const orderPayload = {
        items: cartItems.map((ci) => ({
          productId: ci.product.id,
          productName: ci.product.name,
          imageUrl: ci.product.imageUrl,
          price: ci.product.price,
          quantity: ci.quantity,
          requiresPrescription: ci.product.requiresPrescription,
          dosageForm: ci.product.dosageForm,
          packageSize: ci.product.packageSize,
          prescriptionId: selectedPrescriptionId || undefined,
        })),
        shippingAddress: {
          fullName: formData.fullName,
          street: formData.street,
          city: formData.city,
          stateZip: formData.stateZip,
          phone: formData.phone,
        },
        deliveryMethod: shippingMethod,
        paymentMethod: `Visa •••• ${formData.cardNumber.slice(-4) || '4242'}`,
        prescriptionId: selectedPrescriptionId || undefined,
        prescriptionUploaded: uploadOption === 'upload' && !!uploadedFileName,
      };

      const res = await fetch('/api/pharmacy/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to place pharmacy order');
      }

      const resData = await res.json();
      clearCart();
      onOrderSuccess(resData.order);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while processing order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600/90 flex items-center justify-center text-white">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-outfit">Veterinary Pharmacy Checkout</h2>
              <p className="text-xs text-slate-400">Secure dispensing, licensed pharmacists & rapid pet delivery</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Checkout Form */}
        <form onSubmit={handleSubmitOrder} className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs text-slate-700">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* PRESCRIPTION VERIFICATION STEP (Triggered when cart has Rx medications) */}
          {hasRxItems && (
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Prescription Verification Required</span>
              </div>
              <p className="text-slate-600 text-xs">
                Your cart contains regulated veterinary medication. Our licensed pharmacist will verify your active prescription before cold-pack dispatch.
              </p>

              {/* Tabs for Rx verification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <label
                  onClick={() => setUploadOption('existing')}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-2.5 ${
                    uploadOption === 'existing'
                      ? 'bg-white border-teal-600 text-teal-900 shadow-xs'
                      : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="rxOption"
                    checked={uploadOption === 'existing'}
                    onChange={() => setUploadOption('existing')}
                    className="mt-0.5 text-teal-600"
                  />
                  <div>
                    <div className="font-semibold text-xs text-slate-800">Link Telehealth Prescription</div>
                    <div className="text-[11px] text-slate-500">From your VetCare digital medical chart</div>
                  </div>
                </label>

                <label
                  onClick={() => setUploadOption('upload')}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-2.5 ${
                    uploadOption === 'upload'
                      ? 'bg-white border-teal-600 text-teal-900 shadow-xs'
                      : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="rxOption"
                    checked={uploadOption === 'upload'}
                    onChange={() => setUploadOption('upload')}
                    className="mt-0.5 text-teal-600"
                  />
                  <div>
                    <div className="font-semibold text-xs text-slate-800">Upload External Slip / Note</div>
                    <div className="text-[11px] text-slate-500">From your local licensed veterinarian</div>
                  </div>
                </label>
              </div>

              {/* Existing Digital Prescription selector */}
              {uploadOption === 'existing' && (
                <div className="mt-2 space-y-2">
                  <label className="font-semibold text-slate-800 block text-xs">
                    Select Digital Prescription on File:
                  </label>
                  {prescriptions.length > 0 ? (
                    <select
                      value={selectedPrescriptionId}
                      onChange={(e) => setSelectedPrescriptionId(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-600 font-medium"
                    >
                      {prescriptions.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.animalName} ({p.animalSpecies}) - Prescribed by {p.vetName} ({p.medications?.map((m) => m.name).join(', ')})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
                      No past digital prescriptions found on this account. You can upload an image or note below.
                    </div>
                  )}
                </div>
              )}

              {/* Upload slip simulator */}
              {uploadOption === 'upload' && (
                <div className="mt-2 p-3 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                  <FileText className="w-6 h-6 text-teal-600 mx-auto" />
                  <div className="text-xs text-slate-700">
                    {uploadedFileName ? (
                      <span className="font-bold text-teal-700">✓ Uploaded: {uploadedFileName}</span>
                    ) : (
                      <span>Upload prescription scan, clinic invoice, or doctor's sign-off</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadedFileName('Veterinary_Rx_Slip_DrSarahJenkins.pdf')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition"
                  >
                    {uploadedFileName ? 'Change File' : 'Choose Prescription File'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SHIPPING ADDRESS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>Delivery Address</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mobile Phone (for delivery SMS)</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Street Address & Apartment</label>
                <input
                  type="text"
                  required
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">State & Postal Zip Code</label>
                <input
                  type="text"
                  required
                  value={formData.stateZip}
                  onChange={(e) => setFormData({ ...formData, stateZip: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>
          </div>

          {/* SHIPPING METHOD */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              <Truck className="w-4 h-4 text-teal-600" />
              <span>Shipping Method</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setShippingMethod('STANDARD')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                  shippingMethod === 'STANDARD'
                    ? 'border-teal-600 bg-teal-50/50 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  checked={shippingMethod === 'STANDARD'}
                  onChange={() => setShippingMethod('STANDARD')}
                  className="mt-0.5 text-teal-600"
                />
                <div className="flex-1">
                  <div className="flex justify-between font-bold text-xs text-slate-800">
                    <span>Tracked Standard Courier</span>
                    <span>{subtotal >= 35 ? 'FREE' : '$4.99'}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Estimated delivery: 2-3 business days</div>
                </div>
              </label>

              <label
                onClick={() => setShippingMethod('EXPRESS_COLD_CHAIN')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                  shippingMethod === 'EXPRESS_COLD_CHAIN'
                    ? 'border-teal-600 bg-teal-50/50 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  checked={shippingMethod === 'EXPRESS_COLD_CHAIN'}
                  onChange={() => setShippingMethod('EXPRESS_COLD_CHAIN')}
                  className="mt-0.5 text-teal-600"
                />
                <div className="flex-1">
                  <div className="flex justify-between font-bold text-xs text-slate-800">
                    <span>Priority Cold-Chain Express</span>
                    <span>$9.99</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Next-day refrigerated courier delivery</div>
                </div>
              </label>
            </div>
          </div>

          {/* PAYMENT METHOD */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              <CreditCard className="w-4 h-4 text-teal-600" />
              <span>Payment Details (Demo Encrypted Gateway)</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Payment Option</span>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                  SSL Encrypted 256-bit
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Card Number</label>
                  <input
                    type="text"
                    required
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Exp & CVC</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      required
                      value={formData.cardExp}
                      onChange={(e) => setFormData({ ...formData, cardExp: e.target.value })}
                      className="w-1/2 p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-center"
                    />
                    <input
                      type="text"
                      required
                      value={formData.cardCvc}
                      onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value })}
                      className="w-1/2 p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ORDER SUMMARY TOTALS */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Items Subtotal ({cartItems.length} items):</span>
              <span className="font-mono">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Shipping ({shippingMethod === 'EXPRESS_COLD_CHAIN' ? 'Cold-Chain Express' : 'Standard'}):</span>
              <span className="font-mono">{shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-sm font-bold">
              <span>Total Amount:</span>
              <span className="text-teal-400 font-mono text-base">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-1/3 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition text-center"
            >
              Back to Cart
            </button>
            <button
              type="submit"
              disabled={isSubmitting || cartItems.length === 0}
              className="w-full sm:w-2/3 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold transition shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 text-center cursor-pointer"
            >
              {isSubmitting ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <span>Place Veterinary Order • ${grandTotal.toFixed(2)}</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
