"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  User, Settings, BookOpen, Wrench, Bell, Check, 
  Loader2, Save, Sparkles, X, Plus, AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [fullName, setFullName] = useState("");
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [academicYear, setAcademicYear] = useState("1st Year");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [newSkill, setNewSkill] = useState("");

  // Notification toggles (saved to local state)
  const [peerMatchesAlert, setPeerMatchesAlert] = useState(true);
  const [answerAlert, setAnswerAlert] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setFullName(data.fullName || "");
        setCollege(data.college || "");
        setBranch(data.branch || "");
        setAcademicYear(data.academicYear || "1st Year");
        setSubjects(
          data.subjects
            ? data.subjects.split(",").map((s: string) => s.trim()).filter(Boolean)
            : []
        );
        setSkills(
          data.skills
            ? data.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
            : []
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = () => {
    if (!newSubject.trim()) return;
    if (!subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
    }
    setNewSubject("");
  };

  const handleRemoveSubject = (sub: string) => {
    setSubjects(subjects.filter((s) => s !== sub));
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (!skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
    }
    setNewSkill("");
  };

  const handleRemoveSkill = (sk: string) => {
    setSkills(skills.filter((s) => s !== sk));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          college,
          branch,
          academicYear,
          subjects: subjects.join(", "),
          skills: skills.join(", "),
        }),
      });

      if (res.ok) {
        setSuccessMsg("Your profile settings have been updated successfully!");
        // Refresh session if needed
        if (updateSession) updateSession();
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setErrorMsg("Failed to update profile. Please try again.");
      }
    } catch (e) {
      setErrorMsg("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1 sm:mb-2 flex items-center gap-2.5">
          <Settings className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400" /> Account Settings
        </h1>
        <p className="text-[#A1A1AA] text-sm hidden sm:block">
          Manage your university academic info, expertise tags for peer doubt matching, and notification preferences.
        </p>
      </div>

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2"
        >
          <Check className="w-4 h-4 shrink-0" />
          {successMsg}
        </motion.div>
      )}

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </motion.div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Academic Details Section */}
        <div className="p-6 rounded-2xl bg-[#111111]/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" /> Academic & Profile Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block mb-2">
                Full Name
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-[#171717] border-white/10 text-white rounded-xl h-11 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block mb-2">
                College / University
              </label>
              <Input
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                required
                className="bg-[#171717] border-white/10 text-white rounded-xl h-11 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block mb-2">
                Branch / Major
              </label>
              <Input
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                required
                className="bg-[#171717] border-white/10 text-white rounded-xl h-11 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block mb-2">
                Academic Year
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full bg-[#171717] border border-white/10 text-white rounded-xl h-11 px-3 text-sm focus:outline-none focus:border-purple-500/50"
              >
                <option value="1st Year">1st Year (Freshman)</option>
                <option value="2nd Year">2nd Year (Sophomore)</option>
                <option value="3rd Year">3rd Year (Junior)</option>
                <option value="4th Year">4th Year (Senior)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Subjects & Skills Matching Section */}
        <div className="p-6 rounded-2xl bg-[#111111]/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-blue-400" /> Subjects of Expertise
            </h2>
            <p className="text-xs text-[#71717A]">
              Our peer-matching engine uses these subjects to notify you when classmates need help.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Input
                placeholder="e.g. Data Structures, Operating Systems, Machine Learning"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubject();
                  }
                }}
                className="bg-[#171717] border-white/10 text-white rounded-xl h-10 text-sm flex-1"
              />
              <Button
                type="button"
                onClick={handleAddSubject}
                className="bg-white/10 hover:bg-white/20 text-white text-xs h-10 px-4"
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {subjects.map((subj) => (
                <Badge
                  key={subj}
                  variant="secondary"
                  className="bg-purple-500/15 border border-purple-500/30 text-purple-300 gap-1.5 py-1 px-3"
                >
                  {subj}
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(subj)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {subjects.length === 0 && (
                <span className="text-xs text-[#71717A]">No subjects added yet.</span>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Wrench className="w-4 h-4 text-emerald-400" /> Technical Skills & Tools
            </h3>
            <p className="text-xs text-[#71717A] mb-3">
              Languages, frameworks, or tools you are proficient in (e.g. Python, C++, React).
            </p>

            <div className="flex items-center gap-2 mb-3">
              <Input
                placeholder="e.g. Python, Next.js, Verilog, PyTorch"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="bg-[#171717] border-white/10 text-white rounded-xl h-10 text-sm flex-1"
              />
              <Button
                type="button"
                onClick={handleAddSkill}
                className="bg-white/10 hover:bg-white/20 text-white text-xs h-10 px-4"
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-white/5 border border-white/10 text-gray-300 gap-1.5 py-1 px-3"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {skills.length === 0 && (
                <span className="text-xs text-[#71717A]">No skills added yet.</span>
              )}
            </div>
          </div>
        </div>

        {/* Notifications Preference */}
        <div className="p-6 rounded-2xl bg-[#111111]/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" /> Notifications & Alerts
          </h2>

          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <div>
              <p className="text-sm font-medium text-white">Peer Match Alerts</p>
              <p className="text-xs text-[#71717A]">
                Receive instant notifications when questions match your subjects or skills.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPeerMatchesAlert(!peerMatchesAlert)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                peerMatchesAlert ? "bg-purple-600" : "bg-white/10"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  peerMatchesAlert ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-white">Answer Notifications</p>
              <p className="text-xs text-[#71717A]">
                Notify me immediately when someone provides an answer to my doubts.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAnswerAlert(!answerAlert)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                answerAlert ? "bg-purple-600" : "bg-white/10"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  answerAlert ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 h-11 rounded-xl shadow-lg shadow-purple-600/20 gap-2 font-medium"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
