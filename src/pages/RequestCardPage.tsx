import React, { useState } from 'react';
import { Card3D } from '../components/Card3D';
import { VisaLogo, MastercardLogo } from '../components/CardVisuals';
import { ArrowLeft, ArrowRight, Check, AlertCircle, Shield, CreditCard, MapPin, User, CheckCircle2 } from 'lucide-react';
import { submitNewCardRequest } from '../services/apiClient';

interface RequestCardPageProps {
  onSuccess: (data: { request: any; address: any; quote: any }) => void;
  currentUser: any;
}

export const RequestCardPage: React.FC<RequestCardPageProps> = ({ onSuccess, currentUser }) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Form states — strictly initialized as EMPTY strings per requirement
  const [network, setNetwork] = useState<'visa' | 'mastercard'>('visa');
  const [legalName, setLegalName] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // Delivery states — strictly initialized as EMPTY
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [country, setCountry] = useState('United States');
  const [postalCode, setPostalCode] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');

  // Terms agreement
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Error handling & loading
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-sync cardholder name uppercase if not yet modified separately
  const handleLegalNameChange = (val: string) => {
    setLegalName(val);
    if (!cardholderName || cardholderName === legalName.toUpperCase()) {
      setCardholderName(val.toUpperCase());
    }
  };

  // Step 1 Validation (Network Selection is always valid, defaults to visa)
  // Step 2 Validation: Personal Information
  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!legalName.trim()) errs.legalName = 'Full legal name is required.';
    if (!cardholderName.trim()) errs.cardholderName = 'Cardholder name to appear on card is required.';
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please provide a valid email format (e.g. name@example.com).';
    }
    if (!phone.trim()) {
      errs.phone = 'Contact phone number is required.';
    } else if (phone.trim().length < 7) {
      errs.phone = 'Please provide a valid phone number with area code.';
    }
    if (!dateOfBirth) {
      errs.dateOfBirth = 'Date of birth is required for service validation.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 3 Validation: Delivery Address
  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    if (!addressLine1.trim()) errs.addressLine1 = 'House number and street address are required.';
    if (!city.trim()) errs.city = 'City is required.';
    if (!stateRegion.trim()) errs.stateRegion = 'State or region is required.';
    if (!country.trim()) errs.country = 'Country is required.';
    if (!postalCode.trim()) errs.postalCode = 'Postal code is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    setSubmitError(null);
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    } else if (currentStep === 3) {
      if (validateStep3()) setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep(5);
    }
  };

  const handleBack = () => {
    setSubmitError(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setSubmitError('You must review and agree to the service disclosures before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        network,
        cardholder_name: cardholderName.trim().toUpperCase(),
        personal_info: {
          full_name: legalName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          date_of_birth: dateOfBirth
        },
        delivery_info: {
          address_line_1: addressLine1.trim(),
          address_line_2: addressLine2.trim() || undefined,
          city: city.trim(),
          state_region: stateRegion.trim(),
          country: country.trim(),
          postal_code: postalCode.trim(),
          delivery_phone: deliveryPhone.trim() || phone.trim()
        },
        user_id: currentUser?.id
      };

      const data = await submitNewCardRequest(payload, currentUser?.id);
      onSuccess(data);
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred while creating your request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Breadcrumb */}
      <div className="text-center space-y-2">
        <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-white">
          Card Personalization Application
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Configure your authorized sports pass, review real-time 3D styling, and submit your verified production order.
        </p>
      </div>

      {/* Real-time 3D Card Preview (Positioned ABOVE form for instant visual feedback) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#070e24] border border-blue-900/40 shadow-2xl flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium text-slate-200">
            <CreditCard className="w-4 h-4 text-blue-400" />
            Live 3D Personalization Preview
          </span>
          <span className="text-[11px] text-blue-400 uppercase tracking-widest font-mono">
            {network.toUpperCase()} PREVIEW
          </span>
        </div>

        <Card3D
          cardholderName={cardholderName || 'YOUR NAME HERE'}
          network={network}
          simulatedExpiry="12/29"
          className="w-full"
        />

        <p className="text-[11px] text-slate-400 text-center mt-3">
          As you enter your cardholder name, the high-precision 3D preview updates dynamically in real time.
        </p>
      </div>

      {/* Step Progress Tracker */}
      <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {[
            { step: 1, label: 'Network' },
            { step: 2, label: 'Personal' },
            { step: 3, label: 'Delivery' },
            { step: 4, label: 'Personalize' },
            { step: 5, label: 'Review' }
          ].map((item, idx) => (
            <React.Fragment key={item.step}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === item.step
                      ? 'bg-blue-600 text-white ring-4 ring-blue-600/20'
                      : currentStep > item.step
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {currentStep > item.step ? <Check className="w-4 h-4" /> : item.step}
                </div>
                <span className={`text-[10px] sm:text-xs font-medium ${currentStep === item.step ? 'text-white' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </div>
              {idx < 4 && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded transition-all ${
                    currentStep > idx + 1 ? 'bg-emerald-600' : 'bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {submitError && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{submitError}</span>
        </div>
      )}

      {/* FORM BODY CONTAINER */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/40 border border-slate-800">
        {/* ================= STEP 1: CARD NETWORK SELECTION ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="font-heading font-bold text-lg text-white">
                Step 1: Select Card Network
              </h2>
              <p className="text-xs text-slate-400">
                Choose the network layout specifications for your sports membership card pass.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Visa Option Button (Preserves natural aspect ratio without oversized mockups) */}
              <button
                type="button"
                onClick={() => setNetwork('visa')}
                className={`p-6 rounded-2xl border text-left flex flex-col justify-between h-40 transition-all cursor-pointer ${
                  network === 'visa'
                    ? 'bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Network Tier A
                  </span>
                  {network === 'visa' && (
                    <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div className="my-auto py-2">
                  <VisaLogo className="h-7" />
                </div>

                <div>
                  <div className="text-sm font-semibold text-white">Visa Layout</div>
                  <div className="text-[11px] text-slate-400">High-spec micro-engraved blue abstract finish</div>
                </div>
              </button>

              {/* Mastercard Option Button (Preserves natural aspect ratio without oversized mockups) */}
              <button
                type="button"
                onClick={() => setNetwork('mastercard')}
                className={`p-6 rounded-2xl border text-left flex flex-col justify-between h-40 transition-all cursor-pointer ${
                  network === 'mastercard'
                    ? 'bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Network Tier B
                  </span>
                  {network === 'mastercard' && (
                    <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div className="my-auto py-2">
                  <MastercardLogo className="h-9" />
                </div>

                <div>
                  <div className="text-sm font-semibold text-white">Mastercard Layout</div>
                  <div className="text-[11px] text-slate-400">Dual-interlocking gold & red branding format</div>
                </div>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Technical Note:</span> Selecting a network configures physical artwork dimensions, magnetic stripe coding, and logo positioning. This MVP handles card manufacturing requests.
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Continue to Personal Information</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: PERSONAL INFORMATION ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="font-heading font-bold text-lg text-white">
                Step 2: Personal Information
              </h2>
              <p className="text-xs text-slate-400">
                Please enter your legal identity. Real fields are unpopulated by default for data privacy.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Legal Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => handleLegalNameChange(e.target.value)}
                  placeholder="e.g. John Robert Doe"
                  className={`w-full px-3.5 py-2.5 bg-slate-900 border rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none ${
                    errors.legalName ? 'border-rose-500' : 'border-slate-700 focus:border-blue-500'
                  }`}
                />
                {errors.legalName && (
                  <p className="mt-1 text-[11px] text-rose-400">{errors.legalName}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Name to Appear on Card <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                  placeholder="e.g. JOHN R DOE"
                  maxLength={26}
                  className={`w-full px-3.5 py-2.5 bg-slate-900 border rounded-lg text-xs text-white uppercase font-mono tracking-wider placeholder-slate-600 focus:outline-none ${
                    errors.cardholderName ? 'border-rose-500' : 'border-slate-700 focus:border-blue-500'
                  }`}
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Max 26 characters. Formats automatically in uppercase for physical card engraving.
                </span>
                {errors.cardholderName && (
                  <p className="mt-1 text-[11px] text-rose-400">{errors.cardholderName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full px-3.5 py-2.5 bg-slate-900 border rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none ${
                    errors.email ? 'border-rose-500' : 'border-slate-700 focus:border-blue-500'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-[11px] text-rose-400">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Phone Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className={`w-full px-3.5 py-2.5 bg-slate-900 border rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none ${
                    errors.phone ? 'border-rose-500' : 'border-slate-700 focus:border-blue-500'
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-[11px] text-rose-400">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Date of Birth <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-900 border rounded-lg text-xs text-white focus:outline-none ${
                    errors.dateOfBirth ? 'border-rose-500' : 'border-slate-700 focus:border-blue-500'
                  }`}
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-[11px] text-rose-400">{errors.dateOfBirth}</p>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Continue to Delivery Information</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: DELIVERY INFORMATION ================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="font-heading font-bold text-lg text-white">
                Step 3: Delivery & Shipping Address
              </h2>
              <p className="text-xs text-slate-400">
                Where should the physical card package be dispatched via tracked courier?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Street Address & House/Building Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="e.g. 742 Evergreen Terrace"
                  className={`w-full px-3.5 py-2.5 bg-slate-900 border rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none ${
                    errors.addressLine1 ? 'border-rose-500' : 'border-slate-700 focus:border-blue-500'
                  }`}
                />
                {errors.addressLine1 && (
                  <p className="mt-1 text-[11px] text-rose-400">{errors.addressLine1}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Apartment, Suite, Unit (Optional)
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="e.g. Apt 4B, 3rd Floor"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  City <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Springfield"
                  className={`w-full px-3.5 py-2.5 bg-slate-900 border rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none ${
                    errors.city ? 'border-rose-500' : 'border-slate-700 focus:border-blue-500'
                  }`}
                />
                {errors.city && (
                  <p className="mt-1 text-[11px] text-rose-400">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  State / Region / Province <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={stateRegion}
                  onChange={(e) => setStateRegion(e.target.value)}
                  placeholder="e.g. Oregon"
                  className={`w-full px-3.5 py-2.5 bg-slate-900 border rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none ${
                    errors.stateRegion ? 'border-rose-500' : 'border-slate-700 focus:border-blue-500'
                  }`}
                />
                {errors.stateRegion && (
                  <p className="mt-1 text-[11px] text-rose-400">{errors.stateRegion}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Country <span className="text-rose-400">*</span>
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Other">Other International Destination</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Postal / ZIP Code <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 97477"
                  className={`w-full px-3.5 py-2.5 bg-slate-900 border rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none ${
                    errors.postalCode ? 'border-rose-500' : 'border-slate-700 focus:border-blue-500'
                  }`}
                />
                {errors.postalCode && (
                  <p className="mt-1 text-[11px] text-rose-400">{errors.postalCode}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Courier Contact Delivery Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={deliveryPhone}
                  onChange={(e) => setDeliveryPhone(e.target.value)}
                  placeholder="Delivery courier SMS notifications number"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Continue to Personalization</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: CARD PERSONALISATION CONFIRMATION ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="font-heading font-bold text-lg text-white">
                Step 4: Card Personalisation Check
              </h2>
              <p className="text-xs text-slate-400">
                Confirm your cardholder imprint. Any live change updates the master preview above instantly.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Name to Appear on Card
                </label>
                <input
                  type="text"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                  placeholder="NAME ON CARD"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-blue-500/60 rounded-lg text-sm text-white font-mono tracking-wider focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Selected Network</span>
                  <span className="text-white font-semibold capitalize">{network}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Artwork Spec</span>
                  <span className="text-white font-semibold">Master Blue Abstract (CR80)</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-900/60 text-[11px] text-blue-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Contactless chip specification: Brushed silver EMV with 4-arc NFC indicator.</span>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Proceed to Final Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: REVIEW & SUBMIT ================= */}
        {currentStep === 5 && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="font-heading font-bold text-lg text-white">
                Step 5: Review & Submit Request
              </h2>
              <p className="text-xs text-slate-400">
                Audit your submitted information before creating your unique card request record.
              </p>
            </div>

            {/* Review Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Card Spec Review */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-heading font-semibold text-slate-200 border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                  Card Specifications
                </h4>
                <div className="flex justify-between text-slate-400">
                  <span>Network:</span>
                  <span className="text-white font-medium capitalize">{network}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Cardholder Name:</span>
                  <span className="text-white font-medium">{cardholderName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Chip Specification:</span>
                  <span className="text-white font-medium">Gold EMV Contactless</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Standard:</span>
                  <span className="text-white font-medium">CR80 Physical Card</span>
                </div>
              </div>

              {/* Personal Info Review */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-heading font-semibold text-slate-200 border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  Applicant Information
                </h4>
                <div className="flex justify-between text-slate-400">
                  <span>Legal Name:</span>
                  <span className="text-white font-medium">{legalName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Email:</span>
                  <span className="text-white font-medium">{email}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Phone:</span>
                  <span className="text-white font-medium">{phone}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Date of Birth:</span>
                  <span className="text-white font-medium">{dateOfBirth}</span>
                </div>
              </div>

              {/* Delivery Destination Review */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 md:col-span-2">
                <h4 className="font-heading font-semibold text-slate-200 border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  Delivery & Logistics Destination
                </h4>
                <div className="text-slate-300">
                  <p>{addressLine1}</p>
                  {addressLine2 && <p>{addressLine2}</p>}
                  <p>{city}, {stateRegion} {postalCode}</p>
                  <p className="font-semibold text-white">{country}</p>
                </div>
              </div>
            </div>

            {/* Mandatory Disclosures & Terms Agreement */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  I confirm that all personal and dispatch information provided is accurate.
                  I understand that this request initiates the review, micro-engraving, and tracked courier dispatch of my custom Universal Sports Tip physical card.
                  I agree to the <span className="text-blue-400 underline">Terms and Conditions</span> and transparent service fee schedule.
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Edit</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !agreeTerms}
                className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xl shadow-blue-600/30 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Creating Request Record...</span>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Submit Card Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
