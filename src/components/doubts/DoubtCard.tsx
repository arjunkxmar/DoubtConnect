import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, ThumbsUp, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface DoubtCardProps {
  doubt: any;
}

export function DoubtCard({ doubt }: DoubtCardProps) {
  const timeAgo = formatDistanceToNow(new Date(doubt.createdAt), { addSuffix: true });
  const tags = doubt.tags ? doubt.tags.split(',').map((t: string) => t.trim()) : [];

  return (
    <Link href={`/doubts/${doubt.id}`}>
      <Card className="bg-[#111111]/80 border-white/10 backdrop-blur-xl hover:bg-[#171717] transition-colors cursor-pointer group shadow-xl">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border border-white/10">
                <AvatarFallback className="bg-[#070707] text-[#A1A1AA]">
                  {doubt.author.fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-medium text-sm leading-none mb-1.5 flex items-center gap-2">
                  {doubt.author.fullName}
                  {doubt.isResolved && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                </p>
                <p className="text-xs text-[#71717A]">
                  {doubt.author.academicYear} • {doubt.author.branch} • {timeAgo}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-white/10 text-[#A1A1AA] bg-[#070707]">
              {doubt.subject}
            </Badge>
          </div>

          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
            {doubt.title}
          </h3>
          <p className="text-[#A1A1AA] text-sm line-clamp-2 mb-4">
            {doubt.description}
          </p>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="bg-white/5 text-white hover:bg-white/10 text-xs">
                  #{tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <span className="text-xs text-[#71717A] py-1">+{tags.length - 3} more</span>
              )}
            </div>
            
            <div className="flex gap-4 text-sm text-[#71717A]">
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" />
                <span>{doubt._count.answers}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ThumbsUp className="w-4 h-4" />
                <span>{doubt._count.votes}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
