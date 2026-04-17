"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

const HOUSES = [
  "Bandipur", "Corbett", "Gir", "Kanha", "Kaziranga", "Nallamala", 
  "Namdapha", "Nilgiri", "Pichavaram", "Saranda", "Sundarbans", "Wayanad", "Not Allotted"
];

const YEARS = ["Foundation", "Diploma", "Degree"];

const INTERESTS = [
  "Acting", "Street Play", "Stage Play", "Script Writing", "Direction", "Backstage / Production"
];

const WHATSAPP_LINK = "https://chat.whatsapp.com/example-link";

export default function Home() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
    house: "Not Allotted",
    year: "Foundation",
    interests: [] as string[],
    experience: "No",
    expDetail: "",
    motivation: "",
    specialSkills: ""
  });

  const [whatsappLink, setWhatsappLink] = useState("https://chat.whatsapp.com/example-link");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Public fetch for config
    fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "fetch", password: "PUBLIC" }) // I need to allow public fetch of settings
    })
    .then(res => res.json())
    .then(data => {
      if (data.settings?.whatsappLink) setWhatsappLink(data.settings.whatsappLink);
    })
    .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInterestToggle = (interest: string) => {
    const current = [...formData.interests];
    if (current.includes(interest)) {
      setFormData({ ...formData, interests: current.filter(i => i !== interest) });
    } else {
      setFormData({ ...formData, interests: [...current, interest] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const email = formData.email.toLowerCase();
    if (!email.endsWith(".study.iitm.ac.in") && !email.endsWith("@study.iitm.ac.in")) {
      setErrorMsg("Please use the official format: rollno@branch.study.iitm.ac.in");
      setStatus("error");
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("success");
      } else {
        setErrorMsg(data.error || "Something went wrong.");
        setStatus("error");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to the server.");
      setStatus("error");
    }
  };

  useEffect(() => {
    if (status === "success" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === "success" && countdown === 0) {
      window.location.href = whatsappLink;
    }
  }, [status, countdown, whatsappLink]);

  if (status === "success") {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <div className="stage-light top-[-10%] left-[-10%] opacity-40 animate-pulse" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="form-card text-center max-w-xl w-full border-[#d4af37]/30 py-12 relative z-10"
        >
          <div className="text-6xl mb-6">🎭</div>
          <h1 className="text-4xl font-playfair mb-4 text-[#d4af37]">Archive Awaiting</h1>
          <h2 className="text-xl font-medium mb-6 text-white/90">Registration Received</h2>
          <p className="text-white/40 mb-10 leading-relaxed px-4 text-sm uppercase tracking-widest font-bold">
            Stay tuned. Our team will verify your artifact and admit you to the main archives soon.
          </p>
          
          <div className="mb-10">
            <a href={whatsappLink} className="primary-button !py-5 w-full text-sm block shadow-[0_10px_40px_rgba(90,15,28,0.4)] animate-pulse">📲 Join Our Community</a>
          </div>

          <p className="text-xs text-white/20 italic font-medium tracking-widest uppercase">
            Relocating to Community Archives in {countdown}s...
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative pb-20 overflow-hidden">
      {/* Dynamic Stage Lights */}
      <div className="stage-light top-[-10%] left-[-10%] opacity-40 animate-pulse" />
      <div className="stage-light bottom-[-10%] right-[-10%] opacity-30" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(90,15,28,0.3)_0%,transparent_70%)] pointer-events-none z-0" />

      {/* Absolute Logo Top-Left */}
      <div className="absolute top-10 left-10 z-30 opacity-80 hover:opacity-100 transition-all duration-300">
        <Image 
          src="/logo.png" 
          alt="AAYAM Logo" 
          width={80} 
          height={80} 
          className="drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]" 
        />
      </div>

      {/* High-End Header Banner */}
      <header className="pt-28 pb-16 px-6 text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl font-playfair text-[#d4af37] mb-4 tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]" style={{ fontFamily: 'var(--font-playfair)' }}>Aayam Form</h1>
          <h2 className="text-lg md:text-xl font-light tracking-[0.6em] text-white/40 uppercase">Enacting Dimensions</h2>
          <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent max-w-lg mx-auto mt-10 opacity-20" />
        </motion.div>
      </header>

      <div className="registration-container relative z-20">
        
        {/* Creative Intro */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center space-y-6 mb-24 px-4"
        >
          <p className="accent-quote leading-relaxed text-white/80 text-lg md:text-xl">
            A student-led initiative dedicated to bringing together passionate individuals into the world of theatre and storytelling.
          </p>
          <p className="accent-quote text-[#d4af37] opacity-90 text-sm md:text-base tracking-widest uppercase font-semibold">
            Step forward • Take the stage • Impact lives
          </p>
        </motion.section>

        {/* Midnight Glass Form Card */}
        <motion.div 
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 50 }}
          viewport={{ once: true }}
          className="form-card"
        >
          <div className="mb-14 text-center">
            <h2 className="inline-block text-3xl md:text-4xl border-b-2 border-[#5a0f1c] pb-2">🎭 Member Registration</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Section 1 */}
            <div className="space-y-6">
              <h3 className="section-title">Identity</h3>
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="field-label">Full Name</label>
                  <input name="fullName" required placeholder="Your stage alias or real name" className="luxury-input" value={formData.fullName} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="field-label">Institute Email</label>
                    <input name="email" type="email" required placeholder="rollno@ds.study.iitm.ac.in" className="luxury-input" value={formData.email} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label className="field-label">WhatsApp Contact</label>
                    <input 
                      name="whatsapp" 
                      required 
                      type="tel"
                      pattern="[0-9]{10}"
                      title="Please enter a valid 10-digit number"
                      maxLength={10}
                      placeholder="10-digit number" 
                      className="luxury-input" 
                      value={formData.whatsapp} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="section-divider" />

            {/* Section 2 */}
            <div className="space-y-6">
              <h3 className="section-title">Academic Anchor</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="field-label">House</label>
                  <div className="relative">
                    <select name="house" className="luxury-input appearance-none bg-transparent" value={formData.house} onChange={handleChange}>
                      {HOUSES.map(h => <option key={h} value={h} className="bg-[#111] text-white">{h}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#d4af37]">
                      <ChevronRight className="rotate-90" size={18} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="field-label">Current Level</label>
                  <div className="relative">
                    <select name="year" className="luxury-input appearance-none bg-transparent" value={formData.year} onChange={handleChange}>
                      {YEARS.map(y => <option key={y} value={y} className="bg-[#111] text-white">{y}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#d4af37]">
                      <ChevronRight className="rotate-90" size={18} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="section-divider" />

            {/* Section 3 */}
            <div className="space-y-6">
              <h3 className="section-title">Artistic Interests</h3>
              <p className="field-label opacity-60">What moves you?</p>
              <div className="flex flex-wrap gap-3">
                {INTERESTS.map(i => (
                  <button 
                    key={i}
                    type="button"
                    onClick={() => handleInterestToggle(i)}
                    className={`interest-chip ${formData.interests.includes(i) ? 'selected' : ''}`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <hr className="section-divider" />

            {/* Section 4 */}
            <div className="space-y-6">
              <h3 className="section-title">Stage History</h3>
              <div className="space-y-4">
                <label className="field-label">Prior Experience?</label>
                <div className="flex gap-4">
                  {["Yes", "No"].map(v => (
                    <button 
                      key={v}
                      type="button"
                      onClick={() => setFormData({...formData, experience: v})}
                      className={`interest-chip flex-1 py-4 ${formData.experience === v ? 'selected' : ''}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <AnimatePresence>
                  {formData.experience === "Yes" && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-2"
                    >
                      <textarea name="expDetail" placeholder="Tell us about your curtain calls..." className="luxury-input h-32 py-4 resize-none" value={formData.expDetail} onChange={handleChange} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <hr className="section-divider" />

            {/* Section 5 */}
            <div className="space-y-6">
              <h3 className="section-title">Vision</h3>
              <div className="space-y-4">
                <label className="field-label">Your motivation to join AAYAM</label>
                <textarea name="motivation" placeholder="Your creative spark..." className="luxury-input h-32 py-4 resize-none" value={formData.motivation} onChange={handleChange} />
                <label className="field-label mt-4">Special Technical Skills</label>
                <input name="specialSkills" placeholder="Music, Lights, Editing, etc." className="luxury-input" value={formData.specialSkills} onChange={handleChange} />
              </div>
            </div>

            {errorMsg && <p className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-medium">{errorMsg}</p>}

            <button 
              type="submit" 
              disabled={status === "submitting"} 
              className="primary-button w-full shadow-[0_0_30px_rgba(90,15,28,0.3)]"
            >
              {status === "submitting" ? "Inscribing..." : "🎭 Join the Archives"}
            </button>
          </form>
        </motion.div>

        {/* High-Contrast Footer */}
        <footer className="text-center mt-32 mb-12 space-y-6">
           <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />
           <p className="text-gold-accent/50 text-xs uppercase tracking-[0.5em] font-bold">
             AAYAM Drama Society • Imperial Portal
           </p>
           <p className="text-white/30 text-[11px] font-medium tracking-wide">
             Support: <a href="mailto:drama.society@study.iitm.ac.in" className="text-[#d4af37]/60 hover:text-[#d4af37] transition-all hover:tracking-widest">drama.society@study.iitm.ac.in</a>
           </p>
        </footer>
      </div>
    </main>
  );
}
