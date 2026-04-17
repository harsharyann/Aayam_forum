"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, LogOut, CheckCircle, Trash2, Edit2, Users, History, RefreshCw, X, Download, Upload } from "lucide-react";

interface Member {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  house: string;
  year: string;
  isVerified: boolean;
  whatsappJoined?: boolean;
  gspaceJoined?: boolean;
  interests?: string[];
  experience?: string;
  expDetail?: string;
  motivation?: string;
  specialSkills?: string;
  created_at?: string;
}

export default function Admin() {
  const [password, setPassword] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [registrations, setRegistrations] = useState<Member[]>([]);
  const [settings, setSettings] = useState({ whatsappLink: "" });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "verified">("pending");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, action: "fetch" }),
      });
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.registrations || []);
        setSettings(data.settings || { whatsappLink: "" });
        setIsAuth(true);
      } else {
        alert("Invalid Access Key or Unauthorized");
      }
    } catch (err) {
      alert("Connection failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, action: "fetch" }),
      });
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.registrations || []);
        setSettings(data.settings || { whatsappLink: "" });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async () => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, action: "updateSettings", settings }),
    });
    if (res.ok) alert("Stage configuration updated successfully.");
  };

  const handleVerify = async (id: string) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, action: "verify", id }),
    });
    if (res.ok) fetchData();
  };

  // ... rest of previous handlers (toggleStatus, handleDelete, handleUpdate) same logic ...

  const toggleStatus = async (id: string, field: string) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, action: "toggleField", id, field }),
    });
    if (res.ok) fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this record?")) return;
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, action: "delete", id }),
    });
    if (res.ok) fetchData();
  };

  const handleUpdate = async (member: Member) => {
    const action = isAdding ? "add" : "update";
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, action, id: member.id, member }),
    });
    if (res.ok) {
      setEditingMember(null);
      setIsAdding(false);
      fetchData();
    }
  };

  const stats = useMemo(() => {
    const total = registrations.length;
    const verified = registrations.filter(r => r.isVerified).length;
    const pending = registrations.filter(r => !r.isVerified).length;
    return { total, verified, pending };
  }, [registrations]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    const data = registrations.filter(r => activeTab === "pending" ? !r.isVerified : r.isVerified);
    return data.filter(r => 
      (r.fullName?.toLowerCase() || "").includes(s) || 
      (r.email?.toLowerCase() || "").includes(s) ||
      (r.whatsapp || "").includes(s)
    ).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [registrations, search, activeTab]);

  const exportCSV = () => {
    const dataToExport = registrations.filter(r => r.isVerified);
    if (dataToExport.length === 0) return;
    const headers = ["Name", "Email", "WhatsApp", "House", "Year", "Interests", "Experience"];
    const rows = dataToExport.map(m => [
      m.fullName, m.email, m.whatsapp, m.house, m.year, 
      (m.interests as string[] || []).join(", "), m.experience
    ]);
    const csvContent = [headers, ...rows].map(e => e.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aayam_verified_members_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportAllCSV = () => {
    if (registrations.length === 0) return;
    const headers = ["Name", "Email", "WhatsApp", "House", "Year", "IsVerified", "Interests", "Experience", "Created At"];
    const rows = registrations.map(m => [
      m.fullName, m.email, m.whatsapp, m.house, m.year, m.isVerified,
      (m.interests as string[] || []).join(", "), m.experience, m.created_at
    ]);
    const csvContent = [headers, ...rows].map(e => e.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aayam_full_registry_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const importCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n");
      const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ''));
      
      const membersToImport = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(",").map(v => v.trim().replace(/"/g, ''));
        const member: any = {};
        headers.forEach((header, index) => {
          if (header === "Name") member.fullName = values[index];
          else if (header === "Email") member.email = values[index];
          else if (header === "WhatsApp") member.whatsapp = values[index];
          else if (header === "House") member.house = values[index];
          else if (header === "Year") member.year = values[index];
          else if (header === "IsVerified") member.isVerified = values[index] === "true";
          else if (header === "Interests") member.interests = values[index] ? values[index].split(", ") : [];
          else if (header === "Experience") member.experience = values[index];
        });
        
        // Fill defaults if missing
        member.isVerified = member.isVerified ?? true;
        member.year = member.year || "Foundation";
        return member;
      });

      if (confirm(`Import ${membersToImport.length} members?`)) {
        setLoading(true);
        try {
          const res = await fetch("/api/admin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password, action: "bulkAdd", members: membersToImport }),
          });
          if (res.ok) {
            alert("Archive updated with new members.");
            fetchData();
          }
        } finally {
          setLoading(false);
        }
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = "";
  };

  const handleDeleteAll = async () => {
    if (!confirm("CRITICAL ACTION: This will permanently purge the entire registry. Are you absolutely certain?")) return;
    if (!confirm("Final Confirmation: All data will be lost. Proceed?")) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, action: "deleteAll" }),
      });
      if (res.ok) {
        alert("Registry purged successfully.");
        fetchData();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <div className="stage-light top-[-20%] left-[-20%] opacity-40 animate-pulse" />
        <div className="stage-light bottom-[-20%] right-[-20%] opacity-30" />
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="form-card max-w-sm w-full border-[#d4af37]/30 py-16 px-10 text-center relative z-10">
          <div className="flex justify-center mb-8"><Image src="/logo.png" alt="Aayam" width={80} height={80} className="drop-shadow-lg" /></div>
          <h1 className="text-3xl font-playfair text-[#d4af37] mb-2">Commander Key</h1>
          <p className="helper-text uppercase tracking-widest text-white/30 mb-8 font-bold">Archives Restricted Access</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="password" placeholder="Authorization Token" className="luxury-input text-center h-14" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
            <button className="primary-button w-full">Access Registry</button>
          </form>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 md:p-12 relative overflow-hidden">
      <div className="stage-light top-[-10%] left-[-10%] opacity-20" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(90,15,28,0.2)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-white/5">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Aayam" width={50} height={50} className="drop-shadow-sm opacity-80" />
            <div>
              <h1 className="text-4xl font-playfair text-[#d4af37]">Archive Commander</h1>
              <p className="helper-text tracking-[0.4em] uppercase text-white/40">Member Registry Management</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setIsAdding(true)} className="primary-button !py-3 !px-6 !text-sm flex items-center gap-2"><Plus size={18} /> New Entry</button>
            <div className="flex items-center gap-2 h-12 px-2 rounded-xl bg-white/5 border border-white/10">
               <button onClick={exportAllCSV} className="p-2.5 text-white/40 hover:text-[#d4af37] transition-all" title="Export All Data"><Download size={20} /></button>
               <label className="p-2.5 text-white/40 hover:text-emerald-400 cursor-pointer transition-all" title="Import CSV Data">
                  <Upload size={20} />
                  <input type="file" accept=".csv" onChange={importCSV} className="hidden" />
               </label>
               <button onClick={handleDeleteAll} className="p-2.5 text-white/10 hover:text-red-500 transition-all" title="Purge Registry"><Trash2 size={20} /></button>
            </div>
            <button onClick={() => setIsAuth(false)} className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-all"><LogOut size={20} /></button>
          </div>
        </header>

        {/* Dynamic Settings */}
        <section className="form-card overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-6 p-2">
            <div className="flex-1 space-y-1">
              <label className="helper-text uppercase font-bold text-white/30 text-[10px]">WhatsApp Stage Invitation Link</label>
              <input 
                value={settings.whatsappLink} 
                onChange={e => setSettings({...settings, whatsappLink: e.target.value})}
                placeholder="https://chat.whatsapp.com/..." 
                className="luxury-input !h-12 text-sm" 
              />
            </div>
            <button onClick={updateSettings} className="primary-button !py-3 !px-8 h-12 whitespace-nowrap">Apply Config</button>
          </div>
        </section>

        {/* Real-time Insights */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Elite Members", value: stats.verified, icon: Users, color: "#d4af37" },
            { label: "Pending Triage", value: stats.pending, icon: History, color: "#5a0f1c" },
            { label: "Total Aspirants", value: stats.total, icon: RefreshCw, color: "#ffffff50" },
          ].map(s => (
            <div key={s.label} className="form-card !p-6 border-white/5 flex items-center justify-between group overflow-hidden">
              <div className="relative z-10">
                <p className="helper-text uppercase font-bold tracking-widest text-white/30 mb-1">{s.label}</p>
                <h3 className="text-3xl font-playfair" style={{ color: s.color }}>{s.value}</h3>
              </div>
              <s.icon className="text-white/5 group-hover:text-white/10 transition-colors" size={50} strokeWidth={1} />
            </div>
          ))}
        </section>

        {/* Workspace Toolbar */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between px-4">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button onClick={() => setActiveTab("pending")} className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-[#5a0f1c] text-white' : 'text-white/30 hover:text-white'}`}>Pending ({stats.pending})</button>
            <button onClick={() => setActiveTab("verified")} className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'verified' ? 'bg-[#d4af37] text-black' : 'text-white/30 hover:text-white'}`}>Verified Archives ({stats.verified})</button>
          </div>
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#d4af37]" size={18} />
            <input type="text" placeholder="Search registry..." className="luxury-input !h-11 !pl-14 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Archive Registry Table */}
        <div className="form-card !p-0 overflow-hidden border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/[0.03] border-b border-white/5">
                <tr>
                  <th className="p-6 helper-text text-[10px] uppercase font-bold text-white/40 tracking-[0.2em]">Member Artifact</th>
                  <th className="p-6 helper-text text-[10px] uppercase font-bold text-white/40 tracking-[0.2em]">Contact (WA)</th>
                  <th className="p-6 helper-text text-[10px] uppercase font-bold text-white/40 tracking-[0.2em]">Institute Email</th>
                  <th className="p-6 helper-text text-[10px] uppercase font-bold text-white/40 tracking-[0.2em]">House</th>
                  <th className="p-6 helper-text text-[10px] uppercase font-bold text-white/40 tracking-[0.2em] text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (<tr><td colSpan={5} className="p-20 text-center helper-text italic text-white/20">Syncing stage logs...</td></tr>) : filtered.length === 0 ? (<tr><td colSpan={5} className="p-20 text-center helper-text italic text-white/20">No matching scrolls in this section.</td></tr>) : filtered.map(member => (
                  <tr key={member.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#5a0f1c]/20 border border-[#5a0f1c]/40 flex items-center justify-center font-playfair text-[#d4af37]">{member.fullName.charAt(0)}</div>
                        <div>
                          <div className="font-bold text-white text-base font-playfair">{member.fullName}</div>
                          <div className="text-[10px] font-bold uppercase text-white/30 tracking-widest mt-0.5">{member.year} Level</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="px-3 py-1 rounded-lg bg-[#d4af37]/5 border border-[#d4af37]/20 text-[#d4af37] font-bold tracking-widest text-sm">
                        {member.whatsapp}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-white/60 font-medium">{member.email}</div>
                    </td>
                    <td className="p-6">
                      <div className="text-white font-playfair italic">{member.house}</div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-5">
                        <div className="flex items-center gap-4 border-r border-white/5 pr-5">
                          {!member.isVerified ? (
                            <button onClick={() => handleVerify(member.id)} className="px-4 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/30 transition-all">Approve & Admit</button>
                          ) : (
                            <>
                              <button onClick={() => toggleStatus(member.id, 'whatsappJoined')} className={`flex flex-col items-center gap-1 transition-all ${member.whatsappJoined ? 'text-emerald-400' : 'text-white/10 hover:text-white/30'}`} title="WA Status"><CheckCircle size={16} /><span className="text-[8px] font-black uppercase">WA</span></button>
                              <button onClick={() => toggleStatus(member.id, 'gspaceJoined')} className={`flex flex-col items-center gap-1 transition-all ${member.gspaceJoined ? 'text-[#d4af37]' : 'text-white/10 hover:text-white/30'}`} title="GS Status"><CheckCircle size={16} /><span className="text-[8px] font-black uppercase">GS</span></button>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditingMember(member)} className="p-2 text-white/20 hover:text-[#d4af37] transition-all"><Edit2 size={16}/></button>
                          <button onClick={() => handleDelete(member.id)} className="p-2 text-white/10 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {(editingMember || isAdding) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="form-card relative max-w-2xl w-full border-white/10 !p-10">
               <button onClick={() => {setEditingMember(null); setIsAdding(false)}} className="absolute top-6 right-6 text-white/20 hover:text-[#d4af37] transition-all"><X size={24} /></button>
               <h2 className="text-3xl font-playfair text-[#d4af37] mb-10 border-b border-white/5 pb-4">{isAdding ? 'Archive New Aspirant' : 'Modify Registry Artifact'}</h2>
               <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2"><label className="helper-text uppercase font-bold text-white/40">Full Name</label><input className="luxury-input" defaultValue={editingMember?.fullName || ""} id="m_name" /></div>
                    <div className="space-y-2"><label className="helper-text uppercase font-bold text-white/40">Email</label><input className="luxury-input" defaultValue={editingMember?.email || ""} id="m_email" /></div>
                    <div className="space-y-2"><label className="helper-text uppercase font-bold text-white/40">WhatsApp</label><input className="luxury-input" defaultValue={editingMember?.whatsapp || ""} id="m_whatsapp" /></div>
                    <div className="space-y-2"><label className="helper-text uppercase font-bold text-white/40">House</label><input className="luxury-input" defaultValue={editingMember?.house || "Not Allotted"} id="m_house" /></div>
                  </div>
                  <button onClick={() => {
                    const name = (document.getElementById('m_name') as HTMLInputElement).value;
                    const email = (document.getElementById('m_email') as HTMLInputElement).value;
                    const whatsapp = (document.getElementById('m_whatsapp') as HTMLInputElement).value;
                    const house = (document.getElementById('m_house') as HTMLInputElement).value;
                    const m = isAdding ? { id: '', isVerified: true, fullName: name, email, whatsapp, house, year: 'Foundation', interests: [], experience: 'No', expDetail: '', motivation: '', specialSkills: '', whatsappJoined: false, gspaceJoined: false } as Member : { ...editingMember, fullName: name, email, whatsapp, house } as Member;
                    handleUpdate(m);
                  }} className="primary-button w-full shadow-[0_10px_40px_rgba(90,15,28,0.4)]">{isAdding ? "Inscribe to Archives" : "Apply Modifications"}</button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
