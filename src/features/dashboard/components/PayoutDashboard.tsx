import { Calendar, CheckCircle, DollarSign, FileText } from "lucide-react";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import SignatureCanvas from "react-signature-canvas";
import { supabase } from "../../../lib/supabase";
import { PayoutHistorySection } from "./PayoutHistorySection";
import { useLanguage } from "../../../contexts/LanguageContext";

interface PayoutDashboardProps {
  hasContract?: boolean;
  currentBalance?: number;
  nextPaymentDate?: string;
  paymentThreshold?: number;
  neededForPayment?: number;
  uploadImage: any;
  setHasContract: any;
  handleSubmitData: any;
  user: any;
}

const PayoutDashboard: React.FC<PayoutDashboardProps> = ({
                                                           hasContract = false,
                                                           currentBalance = 0,
                                                           nextPaymentDate = "March 31, 2025",
                                                           uploadImage,
                                                           handleSubmitData,
                                                           setHasContract,
                                                           user,
                                                           paymentThreshold = 100,
                                                           neededForPayment = 100,
                                                         }) => {
  const [checked, setChecked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [signatureMethod, setSignatureMethod] = useState<"type" | "draw">(
      "type"
  );
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({
    legalName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    signature_text: "",
  });
  const [validationErrors, setValidationErrors] = useState<
      Record<string, string>
  >({});

  const signaturePadRef = useRef<SignatureCanvas>(null);
  const { translate } = useLanguage();

  // Helper function to safely translate strings
  const safeTranslate = (key: string, defaultValue?: string) => {
    if (!translate) return defaultValue || key;
    const translated = translate(key);
    return translated === key ? (defaultValue || key) : translated;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
    setSignatureImage(null);
  };

  const saveSignature = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      const dataUrl = signaturePadRef.current.toDataURL();
      setSignatureImage(dataUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    const errors: Record<string, string> = {};

    if (!formData.legalName.trim()) {
      errors.legalName = safeTranslate('legalNameRequired', "Legal name is required");
    }

    if (!formData.address.trim()) {
      errors.address = safeTranslate('addressRequired', "Address is required");
    }

    if (!formData.city.trim()) {
      errors.city = safeTranslate('cityRequired', "City is required");
    }

    if (!formData.state.trim()) {
      errors.state = safeTranslate('stateRequired', "State/Province is required");
    }

    if (!formData.zip.trim()) {
      errors.zip = safeTranslate('zipRequired', "ZIP/Postal code is required");
    }

    if (!formData.country.trim()) {
      errors.country = safeTranslate('countryRequired', "Country is required");
    }

    if (signatureMethod === "type" && !formData.signature_text?.trim()) {
      errors.signature = safeTranslate('signatureRequired', "Signature is required");
    } else if (signatureMethod === "draw" && !signatureImage) {
      errors.signature = safeTranslate('drawSignatureRequired', "Please save your drawn signature");
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a copy of the form data
      let dataToSubmit = { ...formData, user_id: user?.id };

      // Handle signature based on method
      if (signatureMethod === "type") {
        // For typed signatures, just save the text
        dataToSubmit.signature_url = null; // Clear any previous image
      } else if (signatureMethod === "draw" && signatureImage) {
        // For drawn signatures, upload the image and save the URL
        const imageUrl = await uploadImage(signatureImage);

        if (imageUrl) {
          dataToSubmit.signature_url = imageUrl;
          dataToSubmit.signature_text = null; // Clear any previous text signature
        } else {
          setValidationErrors({
            ...validationErrors,
            signature: safeTranslate('signatureUploadFailed', "Failed to upload signature image"),
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Insert or update the contract in Supabase
      const operation = hasContract ? "update" : "insert";

      let result;
      if (operation === "insert") {
        result = await supabase.from("contract").insert(dataToSubmit);
      } else {
        result = await supabase
            .from("contract")
            .update(dataToSubmit)
            .eq("user_id", user?.id);
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Update the UI to show success
      setHasContract(true);
      toast.success(
          hasContract
              ? safeTranslate('contractUpdated', "Contract successfully updated!")
              : safeTranslate('contractSubmitted', "Contract successfully submitted!")
      );
    } catch (error) {
      console.error("Error submitting contract:", error);
      setValidationErrors({
        ...validationErrors,
        form: `${safeTranslate('error', "Error")}: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Available payment methods array with translations
  // const paymentMethods = [
  //   safeTranslate('achUS', "ACH (US)"),
  //   safeTranslate('localBank', "Local Bank Transfer"),
  //   safeTranslate('internationalACH', "International ACH (eCheck)"),
  //   safeTranslate('paperCheck', "Paper Check"),
  //   safeTranslate('usWire', "US Wire Transfer (Domestic)"),
  //   safeTranslate('intWireLocal', "International Wire in Local Currency"),
  //   safeTranslate('intWireUSD', "International Wire in USD"),
  //   safeTranslate('paypal', "PayPal"),
  // ];

  return (
      <div className="flex-1 p-6">
        {/* Current Balance */}
        {!hasContract && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                  <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                  />
                </svg>
                <p className="text-yellow-500 text-sm">
                  {safeTranslate('payoutsProcessedAfterTerms', "Payouts will be processed after accepting the terms and conditions")}
                </p>
              </div>
            </div>
        )}
        <div className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white mb-6">
          <div className="flex items-center mb-1">
            <DollarSign className="w-5 h-5 mr-2" />
            <h2 className="text-lg font-medium">{safeTranslate('currentBalance', "Current Balance")}</h2>
            <div className="ml-auto text-sm">{safeTranslate('nextPayment', "Next payment")}: {nextPaymentDate}</div>
          </div>
          <div className="text-4xl font-bold">${currentBalance.toFixed(2)}</div>
        </div>

        {/* Payment Threshold */}
        <div className="bg-gray-800 rounded-lg p-6 my-6">
          <div className="flex items-start">
            <Calendar className="w-5 h-5 mr-3 mt-1 text-gray-400" />
            <div>
              <div className="font-medium text-white">
                {safeTranslate('minimumPaymentThreshold', "Minimum payment threshold")}: ${paymentThreshold.toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">
                ${neededForPayment.toFixed(2)} {safeTranslate('moreNeededForNextPayment', "more needed for next payment")}
              </div>
            </div>
          </div>
        </div>

        {/* Payout History Section */}
        <div className="bg-slate-800 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {safeTranslate('payoutHistory', "Payout History")}
          </h3>
          <PayoutHistorySection />
        </div>

        {/* Stats counter */}
        <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
          <span>{safeTranslate('lastUpdated', "Last updated")}: {new Date().toLocaleDateString()}</span>
        </div>

        {/* Terms and Conditions */}
        {!hasContract && (
            <div className="bg-gray-800 rounded-lg p-6 mt-6">
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        onClick={() => setChecked((prev) => !prev)}
                        checked={checked}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span
                        className="text-blue-400 text-sm hover:text-blue-300 transition-colors cursor-pointer"
                        onClick={() => setIsModalOpen(true)}
                    >
                  {safeTranslate('agreeToTerms', "I agree to the Terms and Conditions")}
                </span>
                  </div>
                </div>
              </div>

              {/* Terms Modal */}
              {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
                    <h2 className="text-xl font-bold text-white mb-4">
                      {safeTranslate('termsAndConditions', "MediaTiger Terms and Conditions")}
                    </h2>
                    <div className="max-h-96 overflow-y-auto text-gray-300 text-sm space-y-4 mb-4">
                      {/* 1. Introduction */}
                      <div>
                        <h3 className="text-white font-semibold">1. {safeTranslate('introductionTitle', "Introduction")}</h3>
                        <p className="mt-2">
                          {safeTranslate('introPara1', "Thank you for your interest in MediaTiger! We empower creators to maximize revenue and enhance content creation through innovative tools and partnerships.")}
                        </p>
                        <p className="mt-2">
                          {safeTranslate('introPara2', 'These Terms of Service ("Terms") govern your registration, participation, and use of MediaTiger\'s services. By submitting your information through our platform, you agree to comply with these Terms.')}
                        </p>
                      </div>

                      {/* 2. Registration Process */}
                      <div>
                        <h3 className="text-white font-semibold">2. {safeTranslate('registrationProcessTitle', "Registration Process")}</h3>

                        {/* 2.1 Eligibility */}
                        <h4 className="mt-2 font-semibold">2.1 {safeTranslate('eligibilityTitle', "Eligibility")}</h4>
                        <p className="mt-1">
                          {safeTranslate('eligibilityText', "You represent that you have the legal authority to enter into agreements and that the information provided is accurate.")}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                      {safeTranslate('close', "Close")}
                    </button>
                  </div>
                </div>
              )}
            </div>
        )}
        {/* Contract Agreement */}

        {checked && (
            <div className="bg-gray-800 rounded-lg p-6 my-6">
              <div className="flex items-start mb-4">
                <FileText className="w-5 h-5 mr-3 mt-1 text-gray-400" />
                <div>
                  <div className="font-medium text-white">{safeTranslate('contractAgreement', "Contract Agreement")}</div>
                  <div className="text-sm text-gray-400">
                    {safeTranslate('reviewAndSign', "Please review and sign the terms of service agreement")}
                  </div>
                </div>
              </div>

              {/* Display validation error summary if any */}
              {Object.keys(validationErrors).length > 0 && (
                  <div className="bg-red-900/30 border border-red-500/50 rounded-md p-3 mb-4 text-red-300 text-sm">
                    <p className="font-medium mb-1">
                      {safeTranslate('correctErrors', "Please correct the following errors:")}
                    </p>
                    <ul className="list-disc pl-5">
                      {Object.values(validationErrors).map((error, index) => (
                          <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
              )}

              <form className="space-y-4 text-white" onSubmit={handleSubmit}>
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    {safeTranslate('legalName', "Legal Name")}
                  </label>
                  <input
                      value={formData.legalName}
                      name="legalName"
                      type="text"
                      onChange={handleInputChange}
                      placeholder={safeTranslate('enterLegalName', "Enter your legal full name")}
                      className={`w-full p-3 bg-gray-700 rounded-md border ${
                          validationErrors.legalName
                              ? "border-red-500"
                              : "border-gray-600"
                      } text-white`}
                  />
                  {validationErrors.legalName && (
                      <p className="mt-1 text-red-400 text-xs">
                        {validationErrors.legalName}
                      </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    {safeTranslate('streetAddress', "Street Address")}
                  </label>
                  <input
                      value={formData.address}
                      name="address"
                      type="text"
                      onChange={handleInputChange}
                      placeholder={safeTranslate('enterStreetAddress', "Enter your street address")}
                      className={`w-full p-3 bg-gray-700 rounded-md border ${
                          validationErrors.address
                              ? "border-red-500"
                              : "border-gray-600"
                      } text-white`}
                  />
                  {validationErrors.address && (
                      <p className="mt-1 text-red-400 text-xs">
                        {validationErrors.address}
                      </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium">{safeTranslate('city', "City")}</label>
                    <input
                        type="text"
                        name="city"
                        onChange={handleInputChange}
                        value={formData.city}
                        placeholder={safeTranslate('city', "City")}
                        className={`w-full p-3 bg-gray-700 rounded-md border ${
                            validationErrors.city ? "border-red-500" : "border-gray-600"
                        } text-white`}
                    />
                    {validationErrors.city && (
                        <p className="mt-1 text-red-400 text-xs">
                          {validationErrors.city}
                        </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      {safeTranslate('stateProvince', "State/Province")}
                    </label>
                    <input
                        type="text"
                        name="state"
                        onChange={handleInputChange}
                        value={formData.state}
                        placeholder={safeTranslate('stateProvince', "State/Province")}
                        className={`w-full p-3 bg-gray-700 rounded-md border ${
                            validationErrors.state
                                ? "border-red-500"
                                : "border-gray-600"
                        } text-white`}
                    />
                    {validationErrors.state && (
                        <p className="mt-1 text-red-400 text-xs">
                          {validationErrors.state}
                        </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      {safeTranslate('zipPostalCode', "ZIP/Postal Code")}
                    </label>
                    <input
                        type="text"
                        name="zip"
                        onChange={handleInputChange}
                        value={formData.zip}
                        placeholder={safeTranslate('zipPostalCode', "ZIP/Postal Code")}
                        className={`w-full p-3 bg-gray-700 rounded-md border ${
                            validationErrors.zip ? "border-red-500" : "border-gray-600"
                        } text-white`}
                    />
                    {validationErrors.zip && (
                        <p className="mt-1 text-red-400 text-xs">
                          {validationErrors.zip}
                        </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      {safeTranslate('country', "Country")}
                    </label>
                    <input
                        type="text"
                        name="country"
                        onChange={handleInputChange}
                        placeholder={safeTranslate('country', "Country")}
                        value={formData.country}
                        className={`w-full p-3 bg-gray-700 rounded-md border ${
                            validationErrors.country
                                ? "border-red-500"
                                : "border-gray-600"
                        } text-white`}
                    />
                    {validationErrors.country && (
                        <p className="mt-1 text-red-400 text-xs">
                          {validationErrors.country}
                        </p>
                    )}
                  </div>
                </div>

                <div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      {safeTranslate('electronicSignature', "Electronic Signature")}
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <button
                          type="button"
                          onClick={() => setSignatureMethod("type")}
                          className={`px-4 py-2 rounded-md ${
                              signatureMethod === "type"
                                  ? "bg-indigo-600"
                                  : "bg-gray-600 hover:bg-gray-700"
                          }`}
                      >
                        {safeTranslate('typeSignature', "Type Signature")}
                      </button>
                      <button
                          type="button"
                          onClick={() => {
                            setSignatureMethod("draw");
                            clearSignature();
                          }}
                          className={`px-4 py-2 rounded-md ${
                              signatureMethod === "draw"
                                  ? "bg-indigo-600"
                                  : "bg-gray-600 hover:bg-indigo-700"
                          }`}
                      >
                        {safeTranslate('drawSignature', "Draw Signature")}
                      </button>
                    </div>

                    <div
                        className={`mb-2 ${
                            validationErrors.signature
                                ? "border border-red-500 rounded-md"
                                : ""
                        }`}
                    >
                      {signatureMethod === "type" ? (
                          <input
                              type="text"
                              name="signature_text"
                              value={formData.signature_text || ""}
                              placeholder={safeTranslate('typeYourSignature', "Type your signature")}
                              className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 text-white"
                              onChange={handleInputChange}
                          />
                      ) : (
                          <div className="w-full bg-white rounded-md overflow-hidden">
                            {signatureImage ? (
                                <img
                                    src={signatureImage}
                                    alt={safeTranslate('signature', "Signature")}
                                    className="w-full h-32 object-contain"
                                />
                            ) : (
                                <SignatureCanvas
                                    ref={signaturePadRef}
                                    canvasProps={{
                                      className: "w-full h-32",
                                    }}
                                    backgroundColor="white"
                                />
                            )}
                          </div>
                      )}
                    </div>

                    {validationErrors.signature && (
                        <p className="mt-1 text-red-400 text-xs mb-2">
                          {validationErrors.signature}
                        </p>
                    )}

                    {signatureMethod === "draw" && (
                        <div className="flex space-x-2">
                          <button
                              type="button"
                              className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600"
                              onClick={clearSignature}
                          >
                            {safeTranslate('clear', "Clear")}
                          </button>
                          <button
                              type="button"
                              className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-500"
                              onClick={saveSignature}
                          >
                            {safeTranslate('saveSignature', "Save Signature")}
                          </button>
                        </div>
                    )}

                    <div className="text-sm text-gray-400 mt-2">
                      {signatureMethod === "draw"
                          ? safeTranslate('drawSignatureHelp', "Draw your signature using your mouse or touch screen")
                          : safeTranslate('typeSignatureHelp', "Type your signature using your keyboard")}
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                        disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                          <>
                            <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                              <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                              ></circle>
                              <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            {safeTranslate('processing', "Processing...")}
                          </>
                      ) : hasContract ? (
                          safeTranslate('updateAgreement', "Update Agreement")
                      ) : (
                          safeTranslate('submitAgreement', "Submit Agreement")
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
        )}
      </div>
  );
};

export default PayoutDashboard;