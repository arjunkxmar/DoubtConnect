"use client";

import { useState, useEffect } from "react";
import { DoubtCard } from "@/components/doubts/DoubtCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Sparkles, Loader2, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

export default function DoubtsFeedPage() {
  const [doubts, setDoubts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  
  useEffect(() => {
    const fetchDoubts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/doubts?filter=${filter}`);
        const data = await res.json();
        setDoubts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDoubts();
  }, [filter]);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Community Doubts</h1>
          <p className="text-[#A1A1AA] text-sm">Find questions you can answer to boost your contribution.</p>
        </div>
        <Link href="/ask-doubt">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white h-10 sm:h-11 px-5 sm:px-6 text-sm">
            <Sparkles className="w-4 h-4 mr-2" /> Ask a Doubt
          </Button>
        </Link>
      </div>

      {/* Mobile horizontal filter pills */}
      <div className="md:hidden mb-4">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
          <Input 
            placeholder="Search doubts..." 
            className="bg-[#111111] border-white/10 text-white pl-10 h-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4">
          {['all', 'recent', 'popular', 'unsolved', 'solved', 'my_doubts'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === f 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                  : 'bg-white/5 border border-white/10 text-[#A1A1AA] hover:text-white'
              }`}
            >
              {f.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden md:block md:col-span-1 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
            <Input 
              placeholder="Search doubts..." 
              className="bg-[#111111] border-white/10 text-white pl-10 h-11"
            />
          </div>

          <div className="bg-[#111111]/80 border border-white/10 rounded-xl p-4 backdrop-blur-xl shadow-xl">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filters
            </h3>
            <div className="space-y-2">
              {['all', 'recent', 'popular', 'unsolved', 'solved', 'my_doubts'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    filter === f ? 'bg-white/10 text-white font-medium' : 'text-[#A1A1AA] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {f.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
            
            <h3 className="text-white font-medium mt-6 mb-4">Subjects</h3>
            <div className="space-y-2">
              {['Data Structures', 'Algorithms', 'Web Dev', 'Maths'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s.toLowerCase())}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    filter === s.toLowerCase() ? 'bg-white/10 text-white font-medium' : 'text-[#A1A1AA] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="md:col-span-3 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#71717A]" />
            </div>
          ) : doubts.length > 0 ? (
            <div className="space-y-4">
              {doubts.map((doubt) => (
                <DoubtCard key={doubt.id} doubt={doubt} />
              ))}
            </div>
          ) : (
            <div className="bg-[#111111]/80 border border-white/10 rounded-xl p-12 text-center backdrop-blur-xl">
              <h3 className="text-white font-medium mb-2">No doubts found</h3>
              <p className="text-[#A1A1AA] text-sm">Be the first to ask a doubt in this category!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
