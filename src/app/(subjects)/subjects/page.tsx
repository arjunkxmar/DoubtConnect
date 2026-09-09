"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  BookOpen, Search, Code, Cpu, Calculator, Database, 
  Network, Brain, Shield, ChevronRight, Users, MessageSquare 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SUBJECTS_CATALOG } from "@/lib/subjects-data";

export default function SubjectsPage() {
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All");

  const domains = ["All", "Computer Science", "Artificial Intelligence", "Electronics & Comm", "Basic Sciences", "Software Engineering"];

  const filteredSubjects = SUBJECTS_CATALOG.filter((subj) => {
    const matchesDomain = selectedDomain === "All" || subj.domain === selectedDomain;
    const matchesSearch =
      subj.name.toLowerCase().includes(search.toLowerCase()) ||
      subj.description.toLowerCase().includes(search.toLowerCase()) ||
      subj.topics.some((t) => t.name.toLowerCase().includes(search.toLowerCase()));
    return matchesDomain && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1 sm:mb-2">
          Academic Subjects Directory
        </h1>
        <p className="text-[#A1A1AA] text-sm max-w-2xl">
          Browse by academic course to find course-specific doubts, verified senior mentors, and shared lecture resources.
        </p>
      </div>

      {/* Search & Domain Filter Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
          <Input
            placeholder="Search subjects or topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#111111] border-white/10 text-white pl-9 h-11 rounded-xl text-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedDomain === dom
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "bg-white/5 border border-white/10 text-[#A1A1AA] hover:text-white hover:bg-white/10"
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subj, index) => {
          const Icon = subj.icon;
          return (
            <motion.div
              key={subj.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/subjects/${subj.id}`} className="block h-full">
                <div className="group h-full flex flex-col justify-between p-6 rounded-2xl bg-[#111111]/70 border border-white/10 hover:border-purple-500/40 hover:bg-[#141414] transition-all backdrop-blur-xl shadow-xl hover:-translate-y-1">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge variant="outline" className="text-[11px] border-white/10 text-[#A1A1AA]">
                        {subj.domain}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {subj.name}
                    </h3>
                    <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
                      {subj.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {subj.topics.slice(0, 4).map((t) => (
                        <span
                          key={t.id}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-[#71717A] border border-white/5"
                        >
                          {t.name}
                        </span>
                      ))}
                      {subj.topics.length > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md text-[#71717A]">
                          +{subj.topics.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-[#71717A]">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                        {subj.activeDoubtsCount} doubts
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        {subj.mentorCount} mentors
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-purple-400 font-medium group-hover:translate-x-1 transition-transform">
                      <span>Explore</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
