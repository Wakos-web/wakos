import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { notifyAlumniApprover } from "@/lib/alumni-notify";
import { useOtpResend } from "@/hooks/useOtpResend";
import { IMAGE_ACCEPT, validateImage } from "@/lib/upload-guide";
import {
  ArrowLeft, Mail, Send, ShieldCheck, Building2, ImagePlus, GraduationCap,
  CheckCircle2, Loader2, KeyRound, Store,
} from "lucide-react";

export const Route = createFileRoute("/alumni/directory/register")({
  head: () => ({
    meta: [{ title: "Register & List Your Business — Alumni Directory" }],
  }),
  component: RegisterBusinessPage,
});

const CATEGORIES = [
  "Education", "Technology", "Agriculture", "Health", "Finance",
  "Construction", "Transport", "Retail", "Media", "Legal", "Other",
];

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-40";
const labelCls = "block text-sm font-semibold text-white/75 mb-2";
const cardCls = "overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-2xl";

async function uploadToBucket(bucket: string, folder: string, file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

type BusProfile = {
  id: string;
  full_name: string;
  email: string;
  graduation_year: number | null;
  approved?: boolean | null;
};

/* One registration, three things:
 *  1. Your business is listed in the Business Directory (goes to the alumni
 *     admin for approval).
 *  2. Your alumni profile is created automatically from the same details.
 *  3. You get Pulse access with the password you choose after email verify.
 */
function RegisterBusinessPage() {
  const resend = useOtpResend();
  const [step, setStep] = useState<"form" | "verify" | "password">("form");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");

  // Person (alumni + Pulse identity)
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [year, setYear] = useState("");
  const [programme, setProgramme] = useState("O-Level");
  const [profession, setProfession] = useState("");
  const [location, setLocation] = useState("");
  const [company, setCompany] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Business (the listing)
  const [bizName, setBizName] = useState("");
  const [bizCategory, setBizCategory] = useState(CATEGORIES[0]);
  const [bizDesc, setBizDesc] = useState("");
  const [bizLocation, setBizLocation] = useState("");
  const [bizPhone, setBizPhone] = useState("");
  const [bizEmail, setBizEmail] = useState("");
  const [bizWhatsapp, setBizWhatsapp] = useState("");
  const [bizWebsite, setBizWebsite] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // OTP flow
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [done, setDone] = useState(false);
  const [existingProfile, setExistingProfile] = useState<BusProfile | null>(null);

  // An alumnus who is already signed in and on the Pulse gets their primary
  // details (email, name, class year, ...) prefilled, so adding a business is
  // just the business part — they verify nothing again for their identity.
  const prefillDone = useRef(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (prefillDone.current) return;
      const { data: s } = await supabase.auth.getSession();
      const uid = s.session?.user?.id;
      if (!uid) return;
      const { data: prof } = await supabase
        .from("alumni_profiles")
        .select("full_name, nickname, email, graduation_year, programme, profession, current_location, company")
        .eq("user_id", uid)
        .maybeSingle();
      if (cancelled || !prof) return;
      prefillDone.current = true;
      setName((v) => v || prof.full_name || "");
      setNickname((v) => v || prof.nickname || "");
      setEmail((v) => v || prof.email || "");
      setYear((v) => v || (prof.graduation_year ? String(prof.graduation_year) : ""));
      setProgramme((v) => (v === "O-Level" && prof.programme ? prof.programme : v));
      setProfession((v) => v || prof.profession || "");
      setLocation((v) => v || prof.current_location || "");
      setCompany((v) => v || prof.company || "");
    })();
    return () => { cancelled = true; };
  }, []);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1952 }, (_, i) => currentYear - i);

  const resendCode = async () => {
    setError("");
    const em = (sentTo || email).trim().toLowerCase();
    if (!resend.allowSend()) { setError(resend.hint()); return; }
    setBusy(true);
    try {
      await supabase.auth.signInWithOtp({
        email: em,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/alumni/directory/register`,
        },
      });
      resend.onSent();
      setSentTo(em);
      setStep("verify");
    } catch (e: any) {
      setError(e?.message || "Could not send the code. Try again.");
    } finally {
      setBusy(false);
    }
  };

  /* Create/refresh the alumni profile for the verified session user and file
   * the business listing. Runs only after the email code is verified. */
  const createAccounts = async (existing: BusProfile | null) => {
    const { data: s } = await supabase.auth.getSession();
    const session = s.session;
    const uid = session?.user?.id;
    if (!session || !uid) throw new Error("Your session ended. Please try again.");

    let avatarUrl: string | null = null;
    if (avatarFile) avatarUrl = await uploadToBucket("class-notes-photos", "avatars", avatarFile);
    let logoUrl: string | null = null;
    if (logoFile) logoUrl = await uploadToBucket("class-notes-photos", "logos", logoFile);

    let profile = existing;
    const token = session.access_token;
    if (!profile) {
      const { data: inserted, error: pErr } = await supabase
        .from("alumni_profiles")
        .insert({
          user_id: uid,
          full_name: name.trim(),
          nickname: nickname.trim() || null,
          email: email.trim().toLowerCase(),
          graduation_year: parseInt(year, 10),
          programme,
          profession: profession.trim() || null,
          current_location: location.trim() || null,
          company: company.trim() || null,
          avatar_url: avatarUrl,
          is_public: true,
          approved: true, // automatic — the office can recall with a reason
        })
        .select("id, full_name, email, graduation_year")
        .single();
      if (pErr) throw pErr;
      profile = inserted as BusProfile;
      try {
        notifyAlumniApprover({ data: { kind: "registration", submissionId: profile.id, accessToken: token } })
          .then(() => {}).catch(() => {});
      } catch { /* never block on the notification */ }
    }

    const { data: biz, error: bErr } = await supabase
      .from("alumni_businesses")
      .insert({
        owner_id: profile!.id,
        name: bizName.trim(),
        category: bizCategory,
        description: bizDesc.trim() || null,
        website: bizWebsite.trim() || null,
        phone: bizPhone.trim() || null,
        location: bizLocation.trim() || null,
        email: bizEmail.trim().toLowerCase(),
        whatsapp: bizWhatsapp.trim() || null,
        logo_url: logoUrl,
        approved: false, // the alumni admin approves listings
      })
      .select("id")
      .single();
    if (bErr) throw bErr;
    try {
      notifyAlumniApprover({ data: { kind: "business", submissionId: biz.id, accessToken: token } })
        .then(() => {}).catch(() => {});
    } catch { /* never block on the notification */ }
  };

  const submitForm = async () => {
    setError("");
    if (!name.trim()) { setError("Enter your full name."); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { setError("Enter a valid email address."); return; }
    if (!year) { setError("Pick your graduation year."); return; }
    if (!bizName.trim()) { setError("Enter your business name."); return; }
    // Business email is the public-facing contact: it is NEVER shown as text
    // on the listing — customers reach it through the envelope button. It is
    // mandatory because without it a buyer has no way to contact the business.
    const bizEmailClean = bizEmail.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(bizEmailClean)) {
      setError("Enter a valid business email — customers reach you through the envelope button on your listing.");
      return;
    }
    setBusy(true);
    try {
      // Existing registrations for this email (an alumnus returning to list
      // another business): no duplicate alumni profile is created — we attach
      // the new business to their existing profile after email verification.
      // Fail loudly if the existence check errors: a dropped read used to
      // fall through to INSERT and duplicate the profile (now also blocked by
      // the unique email index from migration 025).
      const { data: existing, error: lookErr } = await supabase
        .from("alumni_profiles")
        .select("id, full_name, email, graduation_year, approved")
        .ilike("email", email.trim())
        .maybeSingle();
      if (lookErr) {
        setError("Could not check your email before registering. Try again.");
        return;
      }
      const found = (existing as BusProfile | null) || null;
      if (found && found.approved === false) {
        setError("An account for this email was recalled by the alumni office. Contact MMCWOSA if you think this is a mistake.");
        return;
      }
      setExistingProfile(found);
      setSentTo(email.trim().toLowerCase());

      // Already signed in on this email (e.g. a bridged staff member or a
      // returning alumnus)? Their email is verified, so skip the OTP dance:
      // attach the business to their existing profile, or go set a password.
      const { data: sess } = await supabase.auth.getSession();
      const signedInEmail = sess.session?.user?.email?.trim().toLowerCase();
      if (signedInEmail && signedInEmail === email.trim().toLowerCase()) {
        if (found) {
          await createAccounts(found);
          setDone(true);
        } else {
          setStep("password");
        }
        return;
      }

      await resendCode();
    } catch (e: any) {
      setError(e?.message || "Could not start your registration.");
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async () => {
    setError("");
    if (code.trim().length < 6) { setError("Enter the 6-digit code from your email."); return; }
    setBusy(true);
    try {
      const { data, error: vErr } = await supabase.auth.verifyOtp({
        email: sentTo, token: code.trim(), type: "email",
      });
      if (vErr) throw vErr;
      if (!data.user) throw new Error("Verification did not complete.");
      if (existingProfile) {
        await createAccounts(existingProfile);
        setDone(true);
      } else {
        setStep("password");
      }
    } catch (e: any) {
      setError(e?.message || "That code did not work. Check it and try again.");
    } finally {
      setBusy(false);
    }
  };

  const setNewPassword = async () => {
    setError("");
    if (password.length < 8) { setError("Use at least 8 characters for your password."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setBusy(true);
    try {
      const { error: pErr } = await supabase.auth.updateUser({ password });
      if (pErr) throw pErr;
      await createAccounts(null);
      setDone(true);
    } catch (e: any) {
      setError(e?.message || "Could not set your password. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const filePick = (e: React.ChangeEvent<HTMLInputElement>, setFile: (f: File | null) => void, setPreview: (v: string | null) => void) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // Friendly guidance — bad photos are rejected here, not at the server.
    const imgErr = validateImage(f);
    if (imgErr) { window.alert(imgErr); e.target.value = ""; return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  /* ---------------------------------------------------------------- */
  if (done) {
    return (
      <div className="relative min-h-screen overflow-y-auto bg-[#0A0D14] text-white flex items-center justify-center px-4 py-12">
        <img src="/hero-poster.png" alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-[0.14]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0A0D14]/70 via-[#0A0D14]/60 to-[#0A0D14]/85" />
        <div className="relative w-full max-w-md">
          <div className={cardCls}>
            <div className="p-8 sm:p-10 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-400/15 ring-1 ring-emerald-400/30 flex items-center justify-center mb-5">
                <CheckCircle2 className="h-8 w-8 text-emerald-300" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-300/90 mb-2">You're all set</p>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight mb-3">
                Business submitted & your Pulse account is ready
              </h1>
              <p className="text-sm text-white/55 font-body leading-relaxed">
                <strong className="text-white/80">{bizName.trim()}</strong> is now pending approval by the alumni admin —
                you'll get an email once it's live. Your alumni profile was created from the same details and you're
                signed in to the Pulse.
              </p>
              <div className="mt-7 flex flex-col gap-3">
                <a href="/alumni" className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-[#06110d] px-8 py-3.5 rounded-full font-bold text-sm hover:brightness-110 transition-all text-center">
                  Open the Pulse
                </a>
                <Link to="/alumni/directory/businesses" className="w-full border border-white/15 bg-white/[0.05] text-white/70 px-8 py-3.5 rounded-full font-semibold text-sm hover:text-white hover:border-emerald-400/50 transition-all text-center">
                  Browse the Business Directory
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-y-auto bg-[#0A0D14] text-white">
      <img src="/hero-poster.png" alt="" aria-hidden className="pointer-events-none fixed inset-0 h-full w-full object-cover object-center opacity-[0.12]" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-[#0A0D14]/70 via-[#0A0D14]/60 to-[#0A0D14]/90" />
      <div className="relative min-h-screen flex flex-col items-center px-4 py-10">
        <Link to="/alumni/directory/businesses" className="self-start max-w-2xl w-full text-sm text-white/40 hover:text-white mb-6 inline-flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Business Directory
        </Link>

        <div className="w-full max-w-2xl">
          <div className={cardCls}>
            <div className="p-8 sm:p-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-emerald-400/15 ring-1 ring-emerald-400/30 flex items-center justify-center">
                  <Store className="h-6 w-6 text-emerald-300" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-300/90 mb-1">One registration, two profiles</p>
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight">List your business on the alumni directory</h1>
                  <p className="mt-2 text-sm text-white/55 font-body leading-relaxed">
                    Fill in your details once: your business goes to the Business Directory for approval, and we create
                    your alumni &amp; Pulse account automatically from the same details — so you can network on the
                    Pulse from day one.
                  </p>
                </div>
              </div>

              {error && <div className="mb-5 rounded-xl bg-red-500/10 border border-red-400/30 p-3 text-sm text-red-300">{error}</div>}

              {step === "form" && (
                <form onSubmit={(e) => { e.preventDefault(); submitForm(); }} className="space-y-7">
                  {/* --- Your details (alumni & Pulse) --- */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                      <GraduationCap className="h-4 w-4 text-emerald-300" />
                      <h2 className="font-display text-base font-bold text-white">Your alumni details</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="" className="w-20 h-20 rounded-full object-cover ring-2 ring-emerald-400/40" />
                      ) : (
                        <div className="w-20 h-20 shrink-0 rounded-full bg-emerald-400/15 flex items-center justify-center ring-1 ring-white/10">
                          <Building2 className="h-9 w-9 text-emerald-300/70" />
                        </div>
                      )}
                      <div className="w-full min-w-0 sm:w-auto sm:flex-1">
                        <label className="cursor-pointer inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/[0.05] text-sm font-medium text-white/70 hover:border-emerald-400/60 hover:text-emerald-300 transition-colors">
                          <ImagePlus className="h-4 w-4 shrink-0" />
                          <span>{avatarFile ? "Change photo" : "Your photo (optional)"}</span>
                          <input type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={(e) => filePick(e, setAvatarFile, setAvatarPreview)} />
                        </label>
                        <p className="text-xs text-white/35 mt-2">Shows on your directory profile and Pulse posts.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Full name *</label>
                        <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Your full name" />
                      </div>
                      <div>
                        <label className={labelCls}>Class year *</label>
                        <select required value={year} onChange={(e) => setYear(e.target.value)} className={inputCls}>
                          <option value="">Select year</option>
                          {years.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelCls}>Email address *</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@example.com" />
                        <p className="text-xs text-white/35 mt-1">We verify it with a one-time code. Never shown publicly.</p>
                      </div>
                      <div>
                        <label className={labelCls}>Programme</label>
                        <select value={programme} onChange={(e) => setProgramme(e.target.value)} className={inputCls}>
                          <option value="O-Level">O-Level (S1–S4)</option>
                          <option value="A-Level">A-Level (S5–S6)</option>
                          <option value="Both">Both O &amp; A-Level</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Nickname (optional)</label>
                        <input value={nickname} onChange={(e) => setNickname(e.target.value)} className={inputCls} placeholder="What classmates call you" />
                      </div>
                      <div>
                        <label className={labelCls}>Profession (optional)</label>
                        <input value={profession} onChange={(e) => setProfession(e.target.value)} className={inputCls} placeholder="e.g. Engineer, Teacher" />
                      </div>
                      <div>
                        <label className={labelCls}>Current location (optional)</label>
                        <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} placeholder="e.g. Kampala" />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelCls}>Company / organisation (optional)</label>
                        <input value={company} onChange={(e) => setCompany(e.target.value)} className={inputCls} placeholder="If not the business below" />
                      </div>
                    </div>
                  </div>

                  {/* --- The business listing --- */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                      <Store className="h-4 w-4 text-emerald-300" />
                      <h2 className="font-display text-base font-bold text-white">Your business</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Business name *</label>
                        <input required value={bizName} onChange={(e) => setBizName(e.target.value)} className={inputCls} placeholder="e.g. Green Valley Farms" />
                      </div>
                      <div>
                        <label className={labelCls}>Category *</label>
                        <select required value={bizCategory} onChange={(e) => setBizCategory(e.target.value)} className={inputCls}>
                          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Location (optional)</label>
                        <input value={bizLocation} onChange={(e) => setBizLocation(e.target.value)} className={inputCls} placeholder="e.g. Kampala" />
                      </div>
                      <div>
                        <label className={labelCls}>Phone (optional)</label>
                        <input type="tel" value={bizPhone} onChange={(e) => setBizPhone(e.target.value)} className={inputCls} placeholder="e.g. 0700 123 456" />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelCls}>Business email *</label>
                        <input type="email" required value={bizEmail} onChange={(e) => setBizEmail(e.target.value)} className={inputCls} placeholder="orders@yourbusiness.com" />
                        <p className="text-xs text-white/35 mt-1">Customers email you through the envelope button on your listing — this address is never shown publicly.</p>
                      </div>
                      <div>
                        <label className={labelCls}>Website (optional)</label>
                        <input type="url" value={bizWebsite} onChange={(e) => setBizWebsite(e.target.value)} className={inputCls} placeholder="https://…" />
                      </div>
                      <div>
                        <label className={labelCls}>WhatsApp number (optional)</label>
                        <input type="tel" value={bizWhatsapp} onChange={(e) => setBizWhatsapp(e.target.value)} className={inputCls} placeholder="e.g. +256 700 123456" />
                        <p className="text-xs text-white/35 mt-1">A WhatsApp button appears on your listing that opens a chat with this number.</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelCls}>What does your business do?</label>
                        <textarea rows={3} value={bizDesc} onChange={(e) => setBizDesc(e.target.value)} className={inputCls} placeholder="A short description — this is the first thing other alumni read on your card." />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-white/75 mb-2">Business logo (optional)</label>
                        <div className="flex flex-wrap items-center gap-4">
                          <label className="min-w-0 flex-1 basis-full sm:basis-1/2 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 px-4 py-4 text-sm text-white/50 hover:border-emerald-400/50 hover:text-emerald-300 transition-colors cursor-pointer">
                            <ImagePlus className="h-5 w-5 shrink-0" />
                            <span>{logoFile ? logoFile.name : "Choose a logo"}</span>
                            <input type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={(e) => filePick(e, setLogoFile, setLogoPreview)} />
                          </label>
                          {logoPreview && <img src={logoPreview} alt="" className="h-14 w-14 rounded-xl object-cover ring-1 ring-white/20" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={busy} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-[#06110d] px-8 py-4 rounded-full font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2">
                    <Send className="h-4 w-4" /> {busy ? "Sending code…" : "Verify my email & submit"}
                  </button>
                  <p className="text-center text-[11px] text-white/35 font-body">
                    Your business goes live after the alumni admin approves it. Already have a Pulse account? Use the same
                    email — we'll just add the business.
                  </p>
                </form>
              )}

              {step === "verify" && (
                <div className="space-y-4">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-400/15 ring-1 ring-emerald-400/30 flex items-center justify-center">
                    <Mail className="h-7 w-7 text-emerald-300" />
                  </div>
                  <h2 className="text-center font-display text-xl font-bold text-white">Check your email</h2>
                  <p className="text-center text-sm text-white/55 font-body">
                    We sent a one-time code to <span className="font-semibold text-white/85">{sentTo}</span>. Enter it to
                    verify your email — your business and Pulse account are created right after.
                  </p>
                  <div>
                    <label className={labelCls}>One-time code *</label>
                    <input
                      inputMode="numeric"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                      onKeyDown={(e) => e.key === "Enter" && verifyCode()}
                      className={inputCls + " text-center text-2xl tracking-[0.4em]"}
                      placeholder="••••••"
                      autoFocus
                    />
                  </div>
                  <button onClick={verifyCode} disabled={busy || code.trim().length < 6} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-[#06110d] px-8 py-3.5 rounded-full font-bold text-sm hover:brightness-110 transition-all disabled:opacity-40 inline-flex items-center justify-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> {busy ? "Verifying…" : "Verify & create my account"}
                  </button>
                  <button onClick={resendCode} disabled={busy || !resend.allowSend()} className="w-full text-center text-sm text-white/40 hover:text-white/70 disabled:opacity-40">
                    {resend.label()}
                  </button>
                  <p className="text-center text-[11px] text-white/30">{resend.sendsLeft} of {resend.maxSends} sends left this session</p>
                  <button onClick={() => { setStep("form"); setCode(""); setError(""); }} className="w-full text-center text-sm text-white/40 hover:text-white/70">
                    Wrong email? Go back and fix it
                  </button>
                </div>
              )}

              {step === "password" && (
                <div className="space-y-4">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-400/15 ring-1 ring-emerald-400/30 flex items-center justify-center">
                    <KeyRound className="h-7 w-7 text-emerald-300" />
                  </div>
                  <h2 className="text-center font-display text-xl font-bold text-white">Create your Pulse password</h2>
                  <p className="text-center text-sm text-white/55 font-body">
                    Email verified! Choose the password you'll use to sign in to the Pulse from now on.
                  </p>
                  <div>
                    <label className={labelCls}>Password *</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="At least 8 characters" />
                  </div>
                  <div>
                    <label className={labelCls}>Confirm password *</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setNewPassword()} className={inputCls} placeholder="Repeat your password" />
                  </div>
                  <button onClick={setNewPassword} disabled={busy} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-[#06110d] px-8 py-3.5 rounded-full font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {busy ? "Creating your account…" : "Create account & submit business"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
