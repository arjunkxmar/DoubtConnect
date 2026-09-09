"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Paperclip, Send, CheckCircle2, Sparkles, X, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SimilarDoubtsSuggestions, SimilarDoubtItem } from "@/components/doubts/SimilarDoubtsSuggestions";

const doubtSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(100, "Title too long"),
  description: z.string().min(20, "Please provide more details").max(1000, "Description too long"),
  subject: z.string().min(2, "Subject is required"),
  topic: z.string().min(2, "Topic is required"),
  targetYear: z.string().min(1, "Target academic year is required"),
  tags: z.string().optional(),
});

type DoubtFormValues = z.infer<typeof doubtSchema>;

function AskDoubtForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [matches, setMatches] = useState(0);
  const [fromAI, setFromAI] = useState(false);

  const { register, control, handleSubmit, watch, formState: { errors }, reset, setValue } = useForm<DoubtFormValues>({
    resolver: zodResolver(doubtSchema),
    defaultValues: { targetYear: "" }
  });

  const description = watch("description", "");
  const watchedTitle = watch("title", "");
  const watchedSubject = watch("subject", "");

  const [similarDoubts, setSimilarDoubts] = useState<SimilarDoubtItem[]>([]);
  const [isSearchingSimilar, setIsSearchingSimilar] = useState(false);
  const [dismissedForQuery, setDismissedForQuery] = useState("");

  // Real-time debounced similar doubt detection
  useEffect(() => {
    const query = (watchedTitle || "").trim();
    if (query.length < 4) {
      setSimilarDoubts([]);
      return;
    }

    // Don't re-pop if user explicitly dismissed for this exact query
    if (dismissedForQuery && query.toLowerCase() === dismissedForQuery.toLowerCase()) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingSimilar(true);
      try {
        const queryParams = new URLSearchParams({ q: query });
        if (watchedSubject?.trim()) {
          queryParams.append("subject", watchedSubject.trim());
        }
        const res = await fetch(`/api/doubts/similar?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setSimilarDoubts(data);
        }
      } catch (err) {
        console.error("Failed to fetch similar doubts:", err);
      } finally {
        setIsSearchingSimilar(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [watchedTitle, watchedSubject, dismissedForQuery]);

  const handleDismissSimilar = () => {
    setDismissedForQuery((watchedTitle || "").trim());
    setSimilarDoubts([]);
  };

  // Draft State Management — then overlay AI prefill if present
  useEffect(() => {
    const prefill = searchParams.get("prefill");
    if (prefill === "1") {
      // AI context takes priority over any saved draft
      setFromAI(true);
      const title = searchParams.get("title") ?? "";
      const description = searchParams.get("description") ?? "";
      const subject = searchParams.get("subject") ?? "";
      const tags = searchParams.get("tags") ?? "";
      if (title) setValue("title", title);
      if (description) setValue("description", description);
      if (subject) setValue("subject", subject);
      if (tags) setValue("tags", tags);
    } else {
      const draft = localStorage.getItem("doubt_draft");
      if (draft) {
        const parsed = JSON.parse(draft);
        Object.keys(parsed).forEach(key => setValue(key as any, parsed[key]));
      }
    }
  }, [searchParams, setValue]);

  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem("doubt_draft", JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data: DoubtFormValues) => {
    setIsLoading(true);
    
    // Simulate attachment upload delay if present
    if (attachment) {
      await new Promise(r => setTimeout(r, 1000));
    }

    try {
      const res = await fetch("/api/doubts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          attachmentUrl: attachment ? "https://simulated-upload.com/file.png" : null
        }),
      });

      if (!res.ok) throw new Error("Failed to post doubt");
      
      // Clear draft
      localStorage.removeItem("doubt_draft");
      
      // Set success state to show animation and matches
      setIsSuccess(true);
      
      // Simulate finding matches
      setTimeout(() => setMatches(Math.floor(Math.random() * 3) + 1), 1000);

      setTimeout(() => {
        router.push("/doubts");
        router.refresh();
      }, 4000);

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="bg-[#111111]/80 border-white/10 backdrop-blur-xl shadow-2xl">
              {fromAI && (
                <div className="flex items-center gap-2 px-6 py-3 bg-violet-900/20 border-b border-violet-500/20 text-violet-300 text-xs">
                  <BrainCircuit className="w-4 h-4 shrink-0" />
                  Context carried over from AI Assistant — review and add more detail before posting.
                </div>
              )}
              <CardHeader className="border-b border-white/5 pb-6">
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <Sparkles className="text-purple-400" /> Ask a Doubt
                </CardTitle>
                <CardDescription className="text-[#A1A1AA]">
                  Be clear and concise. Our Smart Matching Engine will find the best seniors to help you.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#A1A1AA]">Title</label>
                    <Input 
                      {...register("title")}
                      placeholder="e.g., How does while loop work in C?" 
                      className="bg-[#070707] border-white/10 text-white placeholder:text-[#71717A] focus-visible:ring-white/20 h-11"
                    />
                    {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                  </div>

                  {/* Similar Doubts Detection Suggestions */}
                  {similarDoubts.length > 0 && (
                    <SimilarDoubtsSuggestions
                      suggestions={similarDoubts}
                      isLoading={isSearchingSimilar}
                      onDismiss={handleDismissSimilar}
                    />
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium text-[#A1A1AA]">Description</label>
                      <span className={`text-xs ${description.length > 1000 ? "text-red-500" : "text-[#71717A]"}`}>
                        {description.length}/1000
                      </span>
                    </div>
                    <Textarea 
                      {...register("description")}
                      placeholder="Explain your doubt in detail. What have you tried so far?" 
                      className="bg-[#070707] border-white/10 text-white placeholder:text-[#71717A] focus-visible:ring-white/20 min-h-[150px] resize-y custom-scrollbar"
                    />
                    {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#A1A1AA]">Subject</label>
                      <Input 
                        {...register("subject")}
                        placeholder="e.g., Data Structures" 
                        className="bg-[#070707] border-white/10 text-white placeholder:text-[#71717A] h-11"
                      />
                      {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#A1A1AA]">Topic</label>
                      <Input 
                        {...register("topic")}
                        placeholder="e.g., Graph Algorithms" 
                        className="bg-[#070707] border-white/10 text-white placeholder:text-[#71717A] h-11"
                      />
                      {errors.topic && <p className="text-xs text-red-500">{errors.topic.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#A1A1AA]">Target Helpers</label>
                      <Controller
                        control={control}
                        name="targetYear"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="bg-[#070707] border-white/10 text-white h-11">
                              <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#111111] border-white/10 text-white">
                              <SelectItem value="All Years">Anyone</SelectItem>
                              <SelectItem value="2nd Year">2nd Year+</SelectItem>
                              <SelectItem value="3rd Year">3rd Year+</SelectItem>
                              <SelectItem value="4th Year">4th Year Only</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.targetYear && <p className="text-xs text-red-500">{errors.targetYear.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#A1A1AA]">Tags (Comma separated)</label>
                      <Input 
                        {...register("tags")}
                        placeholder="e.g., C++, graphs, urgent" 
                        className="bg-[#070707] border-white/10 text-white placeholder:text-[#71717A] h-11"
                      />
                    </div>
                  </div>

                  {/* Simulated Attachment */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <label className="text-sm font-medium text-[#A1A1AA]">Attachment (Optional)</label>
                    <div className="flex items-center gap-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="bg-[#070707] border-white/10 text-white hover:bg-white/5"
                        onClick={() => document.getElementById("file-upload")?.click()}
                      >
                        <Paperclip className="w-4 h-4 mr-2" /> Upload Image/PDF
                      </Button>
                      <input 
                        id="file-upload" 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                      />
                      {attachment && (
                        <div className="flex items-center gap-2 text-sm text-green-400">
                          <span>{attachment.name}</span>
                          <button type="button" onClick={() => setAttachment(null)}><X className="w-4 h-4 text-red-400 hover:text-red-300" /></button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button 
                      type="submit" 
                      className="h-11 px-8 bg-white text-black hover:bg-white/90 font-medium transition-all"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                      {isLoading ? "Posting..." : "Post Doubt"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-4">Doubt Posted Successfully!</h2>
            
            <AnimatePresence>
              {matches > 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#111111] border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-3"
                >
                  <Sparkles className="text-yellow-500 w-6 h-6" />
                  <p className="text-[#A1A1AA] text-lg">
                    <span className="text-white font-bold">{matches} students</span> may be able to help you. Notifications sent!
                  </p>
                </motion.div>
              ) : (
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="text-[#A1A1AA]"
                >
                  Analyzing matching helpers...
                </motion.p>
              )}
            </AnimatePresence>
            <p className="text-[#71717A] mt-8 text-sm">Redirecting to feed...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AskDoubtPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 max-w-3xl flex justify-center items-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <AskDoubtForm />
    </Suspense>
  );
}
