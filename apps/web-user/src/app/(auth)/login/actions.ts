"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServer, createSupabaseAdmin } from "@/utils/supabase/server";

export async function checkEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const supabaseAdmin = await createSupabaseAdmin();

  // Try to generate a link to see if user exists
  const { error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (!error) {
    // User exists!
    // Send the actual login link using standard flow
    const supabase = await createSupabaseServer();
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/auth/callback`,
      },
    });
    return { exists: true };
  }

  // User does not exist (or other error)
  return { exists: false };
}


export async function login(formData: FormData) {
  const supabase = await createSupabaseServer();

  const email = formData.get("email") as string;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    console.error("Login error:", error);
    return redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/login?message=Check your email for the login link");
}

export async function signup(formData: FormData) {
  const supabase = await createSupabaseServer();
  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("Base URL:", process.env.NEXT_PUBLIC_BASE_URL);

  const email = formData.get("email") as string;
  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;
  const zip = formData.get("zip") as string;
  const dobRaw = formData.get("dob") as string;
  // Convert MM/DD/YYYY to YYYY-MM-DD
  let dob = dobRaw;
  if (dobRaw.includes("/")) {
    const [month, day, year] = dobRaw.split("/");
    dob = `${year}-${month}-${day}`;
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/auth/callback`,
      data: {
        first_name: firstName,
        last_name: lastName,
        zip_code: zip,
        date_of_birth: dob,
        display_name: `${firstName} ${lastName}`.trim(),
      },
    },
  });

  if (error) {
    console.error("Signup error:", error);
    return redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/signup?message=Check your email to confirm your account");
}

export async function logout() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
