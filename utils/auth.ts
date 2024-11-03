import { supabase } from "./supabase";

export interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const createOrUpdateProfile = async (
  id: string,
  email: string,
  name: string | null,
  avatar_url: string | null,
) => {
  // Check if profile exists
  const { data: existingProfile, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle(); // Use maybeSingle() instead of single()

  if (fetchError) {
    console.error("Error fetching profile:", fetchError);
    throw fetchError;
  }

  if (!existingProfile) {
    // Create new profile
    const { data: newProfile, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          id,
          email,
          username: name,
          avatar_url,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Error creating profile:", insertError);
      throw insertError;
    }

    // Create default settings for new user
    const { error: settingsError } = await supabase
      .from("user_settings")
      .insert([
        {
          user_id: id,
          sound_enabled: true,
          vibration_enabled: true,
          show_moves: true,
          show_timer: true,
          auto_save: true,
        },
      ]);

    if (settingsError) {
      console.error("Error creating settings:", settingsError);
      throw settingsError;
    }

    return newProfile;
  }

  // Update existing profile
  const { data: updatedProfile, error: updateError } = await supabase
    .from("users")
    .update({
      email,
      username: name,
      avatar_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    console.error("Error updating profile:", updateError);
    throw updateError;
  }

  return updatedProfile;
};
