import { prisma } from "@/lib/prisma";

export interface ScoredDoubt {
  id: string;
  title: string;
  subject: string;
  topic: string;
  isResolved: boolean;
  answersCount: number;
  votesCount: number;
  score: number;
  matchedKeywords?: string[];
}

export interface SimilarityOptions {
  subject?: string;
  limit?: number;
  threshold?: number;
}

export interface SimilarityStrategy {
  name: string;
  findSimilar(query: string, options?: SimilarityOptions): Promise<ScoredDoubt[]>;
}

// ─── Stop Words ─────────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "as", "at", "be", "because", "been", "before", "being", "below",
  "between", "both", "but", "by", "can", "could", "did", "do", "does", "doing",
  "down", "during", "each", "few", "for", "from", "further", "had", "has", "have",
  "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how",
  "i", "if", "in", "into", "is", "it", "its", "itself", "just", "me", "more", "most",
  "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once", "only",
  "or", "other", "our", "ours", "ourselves", "out", "over", "own", "same", "should",
  "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves",
  "then", "there", "these", "they", "this", "those", "through", "to", "too", "under",
  "until", "up", "very", "was", "we", "were", "what", "when", "where", "which",
  "while", "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself",
  "work"
]);

// ─── Tokenizer ──────────────────────────────────────────────────────────────
export function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
}

// ─── Lexical Similarity Strategy ────────────────────────────────────────────
export class LexicalSimilarityStrategy implements SimilarityStrategy {
  name = "lexical";

  async findSimilar(query: string, options: SimilarityOptions = {}): Promise<ScoredDoubt[]> {
    const limit = options.limit || 4;
    const threshold = options.threshold ?? 15;
    const cleanQuery = query.trim().toLowerCase();
    const queryTokens = extractKeywords(query);

    if (queryTokens.length === 0 && cleanQuery.length < 3) {
      return [];
    }

    // Prepare search conditions for candidate retrieval
    const orConditions: any[] = [];

    // Title contains any keyword
    queryTokens.forEach((token) => {
      orConditions.push({ title: { contains: token } });
      orConditions.push({ topic: { contains: token } });
      orConditions.push({ tags: { contains: token } });
    });

    // Also search full query substring in title
    if (cleanQuery.length >= 3) {
      orConditions.push({ title: { contains: cleanQuery } });
    }

    // If subject is specified, narrow candidates or boost later
    const whereClause: any = orConditions.length > 0 ? { OR: orConditions } : {};
    if (options.subject?.trim()) {
      whereClause.OR = whereClause.OR || [];
      whereClause.OR.push({ subject: { contains: options.subject.trim() } });
    }

    // Fetch candidate doubts from database
    const candidates = await prisma.doubt.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            answers: true,
            votes: true,
          },
        },
      },
      take: 20,
    });

    if (candidates.length === 0) {
      return [];
    }

    // Score and rank each candidate
    const scored: ScoredDoubt[] = candidates.map((doubt: any) => {
      let score = 0;
      const doubtTitleLower = doubt.title.toLowerCase();
      const doubtTopicLower = doubt.topic.toLowerCase();
      const doubtTagsLower = doubt.tags.toLowerCase();
      const doubtSubjectLower = doubt.subject.toLowerCase();
      const doubtTokens = extractKeywords(doubt.title);

      const matched: string[] = [];

      // 1. Exact Phrase Matching in Title (Strong signal: +45)
      if (cleanQuery.length >= 4 && doubtTitleLower.includes(cleanQuery)) {
        score += 45;
        matched.push(cleanQuery);
      } else {
        // Sub-phrase match (first 2-3 significant words)
        const subPhrase = queryTokens.slice(0, 3).join(" ");
        if (subPhrase.length >= 4 && doubtTitleLower.includes(subPhrase)) {
          score += 30;
          matched.push(subPhrase);
        }
      }

      // 2. Keyword Overlap (Jaccard-weighted: up to +35)
      let keywordMatches = 0;
      queryTokens.forEach((token) => {
        if (doubtTitleLower.includes(token)) {
          keywordMatches++;
          if (!matched.includes(token)) matched.push(token);
        } else if (doubtTopicLower.includes(token) || doubtTagsLower.includes(token)) {
          keywordMatches += 0.5;
          if (!matched.includes(token)) matched.push(token);
        }
      });

      const denominator = Math.max(queryTokens.length, doubtTokens.length, 1);
      const overlapRatio = keywordMatches / denominator;
      score += Math.min(35, Math.round(overlapRatio * 35));

      // 3. Subject Boost (+10)
      if (
        options.subject &&
        (doubtSubjectLower.includes(options.subject.toLowerCase()) ||
          options.subject.toLowerCase().includes(doubtSubjectLower))
      ) {
        score += 10;
      }

      // 4. Topic / Tags Match (+10)
      queryTokens.forEach((token) => {
        if (doubtTagsLower.includes(token) || doubtTopicLower.includes(token)) {
          score += 5;
        }
      });

      // 5. Solved Bonus (+5, solved doubts provide immediate resolution)
      if (doubt.isResolved) {
        score += 5;
      }

      // 6. Answer Count Bonus (+1 per answer, up to +5)
      score += Math.min(5, doubt._count.answers);

      return {
        id: doubt.id,
        title: doubt.title,
        subject: doubt.subject,
        topic: doubt.topic,
        isResolved: doubt.isResolved,
        answersCount: doubt._count.answers,
        votesCount: doubt._count.votes,
        score: Math.min(100, Math.round(score)),
        matchedKeywords: matched,
      };
    });

    // Filter by threshold, sort by score descending
    return scored
      .filter((item) => item.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

// ─── Semantic / AI Similarity Strategy (Future Ready) ──────────────────────
export class SemanticSimilarityStrategy implements SimilarityStrategy {
  name = "semantic-ai";
  private fallback: LexicalSimilarityStrategy;

  constructor() {
    this.fallback = new LexicalSimilarityStrategy();
  }

  async findSimilar(query: string, options: SimilarityOptions = {}): Promise<ScoredDoubt[]> {
    const apiKey = process.env.GEMINI_API_KEY;

    // If Gemini key is configured and not default placeholder, can use semantic embedding model
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      // Graceful fallback to high-performance lexical strategy
      return this.fallback.findSimilar(query, options);
    }

    try {
      // Future vector embeddings pipeline:
      // const embedding = await getEmbedding(query);
      // const similar = await vectorStore.query(embedding);
      // For now, lexical fallback provides fast, reliable zero-latency results
      return await this.fallback.findSimilar(query, options);
    } catch (err) {
      console.error("Semantic similarity error, falling back to lexical:", err);
      return this.fallback.findSimilar(query, options);
    }
  }
}

// ─── Unified Similarity Service ─────────────────────────────────────────────
const defaultStrategy = new SemanticSimilarityStrategy();

export async function findSimilarDoubts(
  query: string,
  options: SimilarityOptions = {}
): Promise<ScoredDoubt[]> {
  if (!query || query.trim().length < 3) {
    return [];
  }
  return defaultStrategy.findSimilar(query, options);
}
