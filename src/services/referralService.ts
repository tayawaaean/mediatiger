import { supabase } from "../lib/supabase";

export async function isReferralUser(userId: string) {
    try {
        const { data, error } = await supabase
            .rpc('is_user_in_referrals', { input_user_id : userId }); 
        if (error) throw error;
        return data || false;
    } catch (error) {
        console.error('Error checking referral status:', error);
        return false;
    } 
}
 