import { Calendar, CheckCircle, DollarSign, FileText } from "lucide-react";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import SignatureCanvas from "react-signature-canvas";
import { supabase } from "../../../lib/supabase";
import { PayoutHistorySection } from "./PayoutHistorySection";
import { useLanguage } from "../../../contexts/LanguageContext";
import FadeInUp from "../../../components/FadeInUp";

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

const mediatigerTerms = [
  {
    title: "1. Introduction",
    content: [
      "Thank you for your interest in MediaTiger! We empower creators to maximize revenue and enhance content creation through innovative tools and partnerships.",
      'These Terms of Service ("Terms") govern your registration, participation, and use of MediaTiger\'s services. By submitting your information through our platform, you agree to comply with these Terms.',
    ],
  },
  {
    title: "2. Registration Process",
    content: [
      <div key="2.1">
        <span className="font-semibold">2.1 Eligibility</span>
        <ul className="list-disc pl-5 mt-1">
          <li>
            You represent that you have the legal authority to enter into
            agreements and that the information provided is accurate.
          </li>
        </ul>
      </div>,
      <div key="2.2" className="mt-2">
        <span className="font-semibold">2.2 Selection Process</span>
        <ul className="list-disc pl-5 mt-1">
          <li>
            Completing the registration form does not guarantee acceptance into
            the program.
          </li>
          <li>
            Applications will be reviewed based on eligibility, channel metrics,
            content quality, and compliance with platform policies.
          </li>
          <li>
            If selected, you will receive a separate agreement detailing your
            participation terms. Acceptance into the program is contingent upon
            signing this agreement.
          </li>
        </ul>
      </div>,
      <div key="2.3" className="mt-2">
        <span className="font-semibold">2.3 Reapplication</span>
        <ul className="list-disc pl-5 mt-1">
          <li>
            If your application is not selected, you may reapply immediately
            after changes have been made, subject to compliance with our
            policies and eligibility criteria.
          </li>
        </ul>
      </div>,
    ],
  },
  {
    title: "3. Activation of Contract",
    content: [
      <div key="3.1">
        <span className="font-semibold">3.1 Agreement Activation</span>
        <ul className="list-disc pl-5 mt-1">
          <li>
            You have submitted the required information, including accurate and
            complete details as outlined in the registration process.
          </li>
          <li>
            You have reviewed, agreed to, and digitally signed the partnership
            contract provided by MediaTiger.
          </li>
        </ul>
        <p className="mt-1">
          By completing these steps, you acknowledge and accept the Terms and
          agree to participate in the program under its outlined policies.
        </p>
      </div>,
      <div key="3.2" className="mt-2">
        <span className="font-semibold">3.2 Validity</span>
        <ul className="list-disc pl-5 mt-1">
          <li>
            If you fail to provide accurate information or do not complete the
            signing process, the agreement will not be considered active, and
            program access may not be granted.
          </li>
        </ul>
      </div>,
    ],
  },
  {
    title: "4. Program Participation",
    content: [
      <div key="4.1">
        <span className="font-semibold">4.1 Content Access</span>
        <ul className="list-disc pl-5 mt-1">
          <li>
            Upon acceptance, you will gain access to MediaTiger's exclusive
            tools and licensed materials, such as music, templates, or other
            digital assets.
          </li>
          <li>
            Access to assets is subject to change and governed by relevant
            third-party terms, including YouTube's Terms of Service.
          </li>
        </ul>
      </div>,
      <div key="4.2" className="mt-2">
        <span className="font-semibold">4.2 Support and Resources</span>
        <ul className="list-disc pl-5 mt-1">
          <li>
            You will have access to personalized onboarding, training materials,
            and a dedicated support team to assist you in optimizing program
            benefits.
          </li>
          <li>
            Technical support is available for implementation and
            troubleshooting.
          </li>
        </ul>
      </div>,
      <div key="4.3" className="mt-2">
        <span className="font-semibold">4.3 Creator Responsibility</span>
        <ul className="list-disc pl-5 mt-1">
          <li>
            You are expected to actively engage with program resources and
            maintain communication with our team.
          </li>
          <li>
            Failure to comply with participation requirements may result in
            removal from the program.
          </li>
        </ul>
      </div>,
    ],
  },
  {
    title: "5. Content Usage Rights",
    content: [
      <div key="5.1">
        <span className="font-semibold">5.1 Intellectual Property</span>
        <ul className="list-disc pl-5 mt-1">
          <li>
            All rights, title, and interest in MediaTiger's music library remain
            with MediaTiger and its licensors.
          </li>
          <li>
            No ownership rights are transferred through program participation.
          </li>
          <li>
            You may not claim ownership or registration rights over any music
            provided through the program.
          </li>
          <li>
            You must respect all copyright notices and attributions as
            specified.
          </li>
        </ul>
      </div>,
    ],
  },
  {
    title: "6. Revenue Sharing and Payments",
    content: [
      <div key="6.1">
        <span className="font-semibold">6.1 Revenue Sharing</span>
        <ul className="list-disc pl-5 mt-1">
          <li>
            Revenue-sharing terms will be outlined in the partnership agreement.
          </li>
          <li>
            Payments depend on platform monetization policies and are subject to
            deductions for applicable taxes and fees.
          </li>
        </ul>
      </div>,
      <div key="6.2" className="mt-2">
        <span className="font-semibold">6.2 Payment Processing</span>
        <ul className="list-disc pl-5 mt-1">
          <li>
            Payments are processed via [Payment Provider] and will be subject to
            their terms and conditions.
          </li>
          <li>
            It is your responsibility to provide accurate payment details.
            Delays or errors due to incorrect information will not be the
            liability of MediaTiger.
          </li>
        </ul>
      </div>,
    ],
  },
  {
    title: "7. Prohibited Conduct",
    content: [
      <ul className="list-disc pl-5 mt-1" key="7">
        <li>
          Misrepresentation of information during registration is strictly
          prohibited.
        </li>
        <li>
          You may not manipulate metrics such as views, engagement, or other
          performance indicators.
        </li>
        <li>
          Using program materials in violation of platform policies or outside
          of agreed platforms will result in termination.
        </li>
      </ul>,
    ],
  },
  {
    title: "8. Compliance with YouTube Regulations",
    content: [
      <div key="8.1">
        <span className="font-semibold">8.1 Adherence to YouTube Policies</span>
        <p className="mt-1">
          All Channels must respect and obey the rules of YouTube, which can be
          found on the YouTube website.
        </p>
      </div>,
      <div key="8.2" className="mt-2">
        <span className="font-semibold">
          8.2 Revenue Withholding &amp; Policy Violations
        </span>
        <ul className="list-disc pl-5 mt-1">
          <li>
            If any recruited Channels are flagged, receive multiple Strikes, or
            otherwise generate revenues prone to claims from YouTube or third
            parties, the Company may withhold all payments to Recruiter until
            such issues are fully resolved.
          </li>
          <li>
            If YouTube or its affiliates issue payments despite these
            circumstances, the Company may retain such payments as compensation
            without forwarding revenue to Recruiter.
          </li>
        </ul>
      </div>,
    ],
  },
  {
    title: "9. Liability Limits",
    content: [
      <ul className="list-disc pl-5 mt-1" key="9">
        <li>
          MediaTiger shall not be liable for lost profits, revenues, or
          incidental damages.
        </li>
        <li>
          Our aggregate liability for any damages shall not exceed the greater
          of $100 USD or the amount paid in the past twelve months.
        </li>
      </ul>,
    ],
  },
  {
    title: "10. Changes to Terms",
    content: [
      <ul className="list-disc pl-5 mt-1" key="10">
        <li>
          We may update these Terms at any time. Significant changes will be
          communicated via email.
        </li>
      </ul>,
    ],
  },
  {
    title: "11. Data Collection and Privacy",
    content: [
      <ul className="list-disc pl-5 mt-1" key="11">
        <li>
          By participating in the program, you consent to the collection and
          processing of personal data, such as contact details and analytics,
          for program purposes.
        </li>
      </ul>,
    ],
  },
  {
    title: "12. Indemnification",
    content: [
      <p key="12p">
        The Creator agrees to indemnify, defend, and hold harmless the Licensor,
        its affiliates, assigns, sub-distributors, and licensees—including their
        directors, officers, shareholders, agents, and employees—against all
        third-party claims and resulting damages, liabilities, losses, costs,
        and expenses. This indemnification includes reasonable outside
        attorneys’ fees and court costs, arising from:
      </p>,
      <ul className="list-disc pl-5 mt-1" key="12ul">
        <li>
          Any breach or alleged breach by the Creator of warranties,
          representations, or agreements made herein.
        </li>
        <li>
          Any act, error, or omission committed by the Creator or any
          person/entity acting on the Creator’s behalf.
        </li>
      </ul>,
    ],
  },
  {
    title: "13. Tax Responsibility",
    content: [
      <div key="13.1">
        <span className="font-semibold">13.1 User Obligations</span>
        <ul className="list-disc pl-5 mt-1">
          <li>
            The User is responsible for filing accurate tax returns and social
            security contributions in connection with this Agreement and for
            ensuring prompt payment thereof.
          </li>
          <li>
            Compliance with applicable tax laws is the User’s sole
            responsibility.
          </li>
        </ul>
      </div>,
    ],
  },
  {
    title: "14. Force Majeure",
    content: [
      <ul className="list-disc pl-5 mt-1" key="14">
        <li>
          Neither party shall be liable for delays or failures due to
          circumstances beyond reasonable control, including changes in platform
          policies or technical issues.
        </li>
      </ul>,
    ],
  },
  {
    title: "15. Governing Law",
    content: [
      <ul className="list-disc pl-5 mt-1" key="15">
        <li>
          These Terms are governed by the laws of the United States. Any
          disputes will be subject to the exclusive jurisdiction of U.S. courts.
        </li>
      </ul>,
    ],
  },
  {
    title: "16. Contact Information",
    content: [
      <ul className="list-disc pl-5 mt-1" key="16">
        <li>
          For questions about these Terms, please contact{" "}
          <a
            href="mailto:support@mediatiger.co"
            className="underline text-blue-400"
          >
            support@mediatiger.co
          </a>
          .
        </li>
      </ul>,
    ],
  },
];

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
    return translated === key ? defaultValue || key : translated;
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
      errors.legalName = safeTranslate(
        "legalNameRequired",
        "Legal name is required"
      );
    }

    if (!formData.address.trim()) {
      errors.address = safeTranslate("addressRequired", "Address is required");
    }

    if (!formData.city.trim()) {
      errors.city = safeTranslate("cityRequired", "City is required");
    }

    if (!formData.state.trim()) {
      errors.state = safeTranslate(
        "stateRequired",
        "State/Province is required"
      );
    }

    if (!formData.zip.trim()) {
      errors.zip = safeTranslate("zipRequired", "ZIP/Postal code is required");
    }

    if (!formData.country.trim()) {
      errors.country = safeTranslate("countryRequired", "Country is required");
    }

    if (signatureMethod === "type" && !formData.signature_text?.trim()) {
      errors.signature = safeTranslate(
        "signatureRequired",
        "Signature is required"
      );
    } else if (signatureMethod === "draw" && !signatureImage) {
      errors.signature = safeTranslate(
        "drawSignatureRequired",
        "Please save your drawn signature"
      );
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
            signature: safeTranslate(
              "signatureUploadFailed",
              "Failed to upload signature image"
            ),
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
          ? safeTranslate("contractUpdated", "Contract successfully updated!")
          : safeTranslate(
              "contractSubmitted",
              "Contract successfully submitted!"
            )
      );
    } catch (error: any) {
      console.error("Error submitting contract:", error);
      setValidationErrors({
        ...validationErrors,
        form: `${safeTranslate("error", "Error")}: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-6">
      <FadeInUp>
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
                {safeTranslate(
                  "payoutsProcessedAfterTerms",
                  "Payouts will be processed after accepting the terms and conditions"
                )}
              </p>
            </div>
          </div>
        )}
        <div className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white mb-6">
          <div className="flex items-center mb-1">
            <DollarSign className="w-5 h-5 mr-2" />
            <h2 className="text-lg font-medium">
              {safeTranslate("currentBalance", "Current Balance")}
            </h2>
            <div className="ml-auto text-sm">
              {safeTranslate("nextPayment", "Next payment")}: {nextPaymentDate}
            </div>
          </div>
          <div className="text-4xl font-bold">${currentBalance.toFixed(2)}</div>
        </div>

        {/* Payment Threshold */}
        <div className="bg-gray-800 rounded-lg p-6 my-6">
          <div className="flex items-start">
            <Calendar className="w-5 h-5 mr-3 mt-1 text-gray-400" />
            <div>
              <div className="font-medium text-white">
                {safeTranslate(
                  "minimumPaymentThreshold",
                  "Minimum payment threshold"
                )}
                : ${paymentThreshold.toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">
                ${neededForPayment.toFixed(2)}{" "}
                {safeTranslate(
                  "moreNeededForNextPayment",
                  "more needed for next payment"
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payout History Section */}
        <div className="bg-slate-800 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {safeTranslate("payoutHistory", "Payout History")}
          </h3>
          <PayoutHistorySection />
        </div>

        {/* Stats counter */}
        <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
          <span>
            {safeTranslate("lastUpdated", "Last updated")}:{" "}
            {new Date().toLocaleDateString()}
          </span>
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
                    {safeTranslate(
                      "agreeToTerms",
                      "I agree to the Terms and Conditions"
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full mx-4 overflow-y-auto max-h-[90vh]">
                  <h2 className="text-xl font-bold text-white mb-4">
                    {safeTranslate(
                      "termsAndConditions",
                      "MediaTiger Terms and Conditions"
                    )}
                  </h2>
                  <div className="max-h-[60vh] overflow-y-auto text-gray-300 text-sm space-y-6 mb-4 pr-2">
                    {mediatigerTerms.map((section, idx) => (
                      <div key={section.title + idx}>
                        <h3 className="text-white font-semibold mb-1">
                          {section.title}
                        </h3>
                        {Array.isArray(section.content)
                          ? section.content.map((c, i) =>
                              typeof c === "string" ? (
                                <p className="mt-1" key={i}>
                                  {c}
                                </p>
                              ) : (
                                <div key={i}>{c}</div>
                              )
                            )
                          : section.content}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >
                    {safeTranslate("close", "Close")}
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
                <div className="font-medium text-white">
                  {safeTranslate("contractAgreement", "Contract Agreement")}
                </div>
                <div className="text-sm text-gray-400">
                  {safeTranslate(
                    "reviewAndSign",
                    "Please review and sign the terms of service agreement"
                  )}
                </div>
              </div>
            </div>

            {/* Display validation error summary if any */}
            {Object.keys(validationErrors).length > 0 && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-md p-3 mb-4 text-red-300 text-sm">
                <p className="font-medium mb-1">
                  {safeTranslate(
                    "correctErrors",
                    "Please correct the following errors:"
                  )}
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
                  {safeTranslate("legalName", "Legal Name")}
                </label>
                <input
                  value={formData.legalName}
                  name="legalName"
                  type="text"
                  onChange={handleInputChange}
                  placeholder={safeTranslate(
                    "enterLegalName",
                    "Enter your legal full name"
                  )}
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
                  {safeTranslate("streetAddress", "Street Address")}
                </label>
                <input
                  value={formData.address}
                  name="address"
                  type="text"
                  onChange={handleInputChange}
                  placeholder={safeTranslate(
                    "enterStreetAddress",
                    "Enter your street address"
                  )}
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
                  <label className="block mb-2 text-sm font-medium">
                    {safeTranslate("city", "City")}
                  </label>
                  <input
                    type="text"
                    name="city"
                    onChange={handleInputChange}
                    value={formData.city}
                    placeholder={safeTranslate("city", "City")}
                    className={`w-full p-3 bg-gray-700 rounded-md border ${
                      validationErrors.city
                        ? "border-red-500"
                        : "border-gray-600"
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
                    {safeTranslate("stateProvince", "State/Province")}
                  </label>
                  <input
                    type="text"
                    name="state"
                    onChange={handleInputChange}
                    value={formData.state}
                    placeholder={safeTranslate(
                      "stateProvince",
                      "State/Province"
                    )}
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
                    {safeTranslate("zipPostalCode", "ZIP/Postal Code")}
                  </label>
                  <input
                    type="text"
                    name="zip"
                    onChange={handleInputChange}
                    value={formData.zip}
                    placeholder={safeTranslate(
                      "zipPostalCode",
                      "ZIP/Postal Code"
                    )}
                    className={`w-full p-3 bg-gray-700 rounded-md border ${
                      validationErrors.zip
                        ? "border-red-500"
                        : "border-gray-600"
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
                    {safeTranslate("country", "Country")}
                  </label>
                  <input
                    type="text"
                    name="country"
                    onChange={handleInputChange}
                    placeholder={safeTranslate("country", "Country")}
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
                    {safeTranslate(
                      "electronicSignature",
                      "Electronic Signature"
                    )}
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
                      {safeTranslate("typeSignature", "Type Signature")}
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
                      {safeTranslate("drawSignature", "Draw Signature")}
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
                        placeholder={safeTranslate(
                          "typeYourSignature",
                          "Type your signature"
                        )}
                        className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 text-white"
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className="w-full bg-white rounded-md overflow-hidden">
                        {signatureImage ? (
                          <img
                            src={signatureImage}
                            alt={safeTranslate("signature", "Signature")}
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
                        {safeTranslate("clear", "Clear")}
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-500"
                        onClick={saveSignature}
                      >
                        {safeTranslate("saveSignature", "Save Signature")}
                      </button>
                    </div>
                  )}

                  <div className="text-sm text-gray-400 mt-2">
                    {signatureMethod === "draw"
                      ? safeTranslate(
                          "drawSignatureHelp",
                          "Draw your signature using your mouse or touch screen"
                        )
                      : safeTranslate(
                          "typeSignatureHelp",
                          "Type your signature using your keyboard"
                        )}
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
                        {safeTranslate("processing", "Processing...")}
                      </>
                    ) : hasContract ? (
                      safeTranslate("updateAgreement", "Update Agreement")
                    ) : (
                      safeTranslate("submitAgreement", "Submit Agreement")
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </FadeInUp>
    </div>
  );
};

export default PayoutDashboard;
