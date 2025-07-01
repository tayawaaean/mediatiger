import React, { useState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import { Toggle } from "../../ui/Toggle";
import { SectionTitle } from "../SectionTitle";
import { useLanguage } from "../../../contexts/LanguageContext";
import { supabase } from "../../../lib/supabase";
import { Input } from "../../ui/Input";
import toast from "react-hot-toast";

export const SecuritySection: React.FC = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [showTwoFactorDisable, setShowTwoFactorDisable] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [token, setToken] = useState("");
  const [disableToken, setDisableToken] = useState("");
  const [factorId, setFactorId] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [loading, setLoading] = useState(false);
  // Track if user has confirmed 2FA setup
  const [setupConfirmed, setSetupConfirmed] = useState(false);
  const { translate } = useLanguage();

  useEffect(() => {
    const fetchMFAStatus = async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) {
        console.error(translate("failedToFetchFactors"), error);
        return;
      }

      const totpFactor = data?.all?.find((f) => f.factor_type === "totp");
      if (totpFactor) {
        // Check if the factor is verified
        if (totpFactor.status === "verified") {
          setTwoFactorEnabled(true);
          setFactorId(totpFactor.id);
          setSetupConfirmed(true);
        } else {
          // Handle unverified factor
          setTwoFactorEnabled(false);
          setFactorId(totpFactor.id); // Still store the ID for potential cleanup
          setSetupConfirmed(false);
          console.log(translate("foundUnverifiedFactor"), totpFactor);
        }
      } else {
        setTwoFactorEnabled(false);
        setFactorId("");
        setSetupConfirmed(false);
      }
    };

    fetchMFAStatus();
  }, [translate]);

  const handleToggleTwoFactor = async (enabled: boolean) => {
    // If trying to enable and not confirmed, start setup flow
    if (enabled && !setupConfirmed) {
      try {
        setLoading(true);

        // Check if we already have an unverified factor - delete it first
        if (factorId) {
          try {
            console.log(translate("removingExistingUnverifiedFactor"));
            await supabase.auth.mfa.unenroll({ factorId });
            setFactorId("");
          } catch (cleanupErr) {
            console.error(
              translate("failedToCleanupUnverifiedFactor"),
              cleanupErr
            );
          }
        }

        // Now enroll a new factor
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: "totp",
        });

        if (error || !data?.id || !data?.totp?.qr_code) {
          toast.error(translate("failedToGetQRCode"));
          return;
        }

        setQrCode(data.totp.qr_code);
        setFactorId(data.id);
        setShowTwoFactorSetup(true);
        // Important: We don't set twoFactorEnabled to true yet!
        // It will only be enabled after verification
      } catch (err: any) {
        toast.error(err.message || translate("failedToSetup2FA"));
      } finally {
        setLoading(false);
      }
    } else if (!enabled) {
      // If disabling, show the disable dialog
      setShowTwoFactorDisable(true);
    }
  };

  const handleCancelSetup = async () => {
    try {
      setLoading(true);

      // If we have a factorID but user cancels before confirming,
      // we should unenroll this incomplete factor
      if (factorId && !setupConfirmed) {
        const { error } = await supabase.auth.mfa.unenroll({ factorId });
        if (error) {
          console.error(translate("errorCleaningUpFactor"), error);
        }
      }
    } catch (err) {
      console.error(translate("errorDuringCleanup"), err);
    } finally {
      // Reset the UI state
      setShowTwoFactorSetup(false);
      setToken("");
      setQrCode("");
      // Keep the toggle in off position
      setTwoFactorEnabled(false);
      setLoading(false);
    }
  };

  const handleVerifyToken = async () => {
    if (!token.trim()) {
      toast.error(translate("enterSixDigitCode"));
      return;
    }

    try {
      setLoading(true);
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({
          factorId,
        });

      if (challengeError || !challengeData?.id) {
        throw new Error(translate("failedToInitiateMFAChallenge"));
      }

      const challengeId = challengeData.id;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: token,
      });

      if (verifyError) throw verifyError;

      // Only now do we consider 2FA fully enabled and confirmed
      toast.success(translate("twoFactorAuthenticationEnabled"));
      setTwoFactorEnabled(true);
      setSetupConfirmed(true);
      setShowTwoFactorSetup(false);
      setToken("");
    } catch (err: any) {
      toast.error(err.message || translate("invalidVerificationCode"));
      // Keep the 2FA toggle in the off position since verification failed
      setTwoFactorEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    try {
      setLoading(true);

      // Check if the factor is unverified - can skip verification
      const { data: factorData } = await supabase.auth.mfa.listFactors();
      const currentFactor = factorData?.all?.find((f) => f.id === factorId);

      // For unverified factors, we can skip the verification process
      if (currentFactor && currentFactor.status === "unverified") {
        console.log(translate("removingUnverifiedFactorDirectly"));
        const { error: unenrollError } = await supabase.auth.mfa.unenroll({
          factorId,
        });

        if (unenrollError) throw unenrollError;

        toast.success(translate("twoFASetupCanceled"));
        setTwoFactorEnabled(false);
        setSetupConfirmed(false);
        setFactorId("");
        setShowTwoFactorDisable(false);
        setDisableToken("");
        return;
      }

      // Normal verification flow for verified factors
      if (!disableToken.trim()) {
        toast.error(translate("enterCodeToDisable"));
        return;
      }

      // 1. Start challenge
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({
          factorId,
        });

      if (challengeError || !challengeData?.id) {
        throw new Error(translate("challengeFailed") + challengeError?.message);
      }

      setChallengeId(challengeData.id);

      // 2. Verify challenge
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: disableToken,
      });

      if (verifyError) throw verifyError;

      // 3. Unenroll
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId,
      });

      if (unenrollError) throw unenrollError;

      toast.success(translate("twoFADisabledSuccessfully"));
      setTwoFactorEnabled(false);
      setSetupConfirmed(false);
      setFactorId("");
      setShowTwoFactorDisable(false);
      setDisableToken("");
    } catch (err: any) {
      toast.error(err.message || translate("failedToDisable2FA"));
      // Keep 2FA enabled only if it was already enabled
      if (setupConfirmed) {
        setTwoFactorEnabled(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="pt-2 mb-6">
      <SectionTitle
        icon={<ShieldCheck size={16} />}
        title={translate("security")}
      />

      <div className="mt-4">
        <div className="flex items-center justify-between bg-slate-700/30 p-3 rounded-lg border border-slate-700/50 transition-all duration-300 hover:bg-slate-700/40">
          <div>
            <h3 className="text-slate-200 font-medium">
              {translate("twoFactorAuthentication")}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {translate("addExtraLayerOfSecurity")}
            </p>
          </div>
          <div>
            <Toggle
              enabled={twoFactorEnabled}
              onChange={handleToggleTwoFactor}
              disabled={loading}
            />
          </div>
        </div>

        {showTwoFactorSetup && (
          <div className="mt-4 p-4 bg-indigo-900/20 border border-indigo-800/30 rounded-lg animated-fade-in">
            <h4 className="font-medium text-indigo-300 mb-2">
              {translate("setupTwoFactorAuthentication")}
            </h4>
            <p className="text-sm text-slate-300 mb-4">
              {translate("scanQRCodeWithAuthenticatorApp")}
            </p>
            <div className="flex justify-center p-6 bg-white rounded-lg mb-4">
              <img
                src={qrCode}
                alt={translate("twoFAQRCode")}
                className="w-40 h-40 object-contain"
              />
            </div>
            <Input
              type="text"
              placeholder={translate("enterSixDigitCode")}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                className="text-sm text-slate-300 hover:text-slate-100"
                onClick={handleCancelSetup}
                disabled={loading}
              >
                {translate("cancel")}
              </button>
              <button
                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                onClick={handleVerifyToken}
                disabled={loading}
              >
                {translate("verifyAndEnable")}
              </button>
            </div>
          </div>
        )}

        {showTwoFactorDisable && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-800/30 rounded-lg animated-fade-in">
            <h4 className="font-medium text-red-300 mb-2">
              {translate("disableTwoFactorAuthentication")}
            </h4>

            {/* Add a button to force remove unverified factors */}
            <div className="mb-4">
              <button
                className="text-sm text-amber-400 hover:text-amber-300 font-medium"
                onClick={async () => {
                  try {
                    setLoading(true);
                    console.log(translate("attemptingForceCleanup"));

                    // Get all factors to check
                    const { data: factorData } =
                      await supabase.auth.mfa.listFactors();
                    console.log(translate("currentFactors"), factorData?.all);

                    // For each unverified factor, attempt to remove it
                    for (const factor of factorData?.all || []) {
                      if (factor.status === "unverified") {
                        console.log(
                          `${translate("removingUnverifiedFactor")}: ${
                            factor.id
                          }`
                        );
                        await supabase.auth.mfa.unenroll({
                          factorId: factor.id,
                        });
                      }
                    }

                    toast.success(translate("unverified2FASetupsCleanedUp"));
                    setTwoFactorEnabled(false);
                    setSetupConfirmed(false);
                    setFactorId("");
                    setShowTwoFactorDisable(false);

                    // Refresh the list of factors
                    window.location.reload();
                  } catch (err: any) {
                    console.error(translate("errorDuringForceCleanup"), err);
                    toast.error(translate("errorCleaningUpUnverifiedFactors"));
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                {translate("forceRemoveUnverified2FASetup")}
              </button>
            </div>

            <p className="text-sm text-slate-300 mb-4">
              {translate("enterCodeToDisable2FA")}
            </p>
            <Input
              type="text"
              placeholder={translate("enterSixDigitCode")}
              value={disableToken}
              onChange={(e) => setDisableToken(e.target.value)}
              className="mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                className="text-sm text-slate-300 hover:text-slate-100"
                onClick={() => {
                  setDisableToken("");
                  setShowTwoFactorDisable(false);
                }}
                disabled={loading}
              >
                {translate("cancel")}
              </button>
              <button
                className="text-sm text-red-400 hover:text-red-300 font-medium"
                onClick={handleDisableTwoFactor}
                disabled={loading}
              >
                {translate("confirmDisable")}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
