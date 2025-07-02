import React, { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function estimateReadTime(content: string) {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

async function fetchGuide(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/guides/${slug}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function GuidePage({ params }: { params: { slug: string } }) {
  const guide = await fetchGuide(params.slug);
  if (!guide) return notFound();

  // For client-side features (read/favorite/share), use a client component
  return <GuideClient guide={guide} />;
}

function GuideClient({ guide }: { guide: any }) {
  const [read, setRead] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  useEffect(() => {
    setRead(JSON.parse(localStorage.getItem("readGuides") || "[]"));
    setFavorites(JSON.parse(localStorage.getItem("favoriteGuides") || "[]"));
  }, []);
  useEffect(() => {
    if (!read.includes(guide.slug)) {
      const updated = [...read, guide.slug];
      setRead(updated);
      localStorage.setItem("readGuides", JSON.stringify(updated));
    }
  }, [guide.slug]);
  function toggleFavorite() {
    let updated;
    if (favorites.includes(guide.slug)) {
      updated = favorites.filter((s) => s !== guide.slug);
    } else {
      updated = [...favorites, guide.slug];
    }
    setFavorites(updated);
    localStorage.setItem("favoriteGuides", JSON.stringify(updated));
  }
  function share(platform: string) {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = encodeURIComponent(`${guide.title} - Money & Hustle Guide`);
    if (platform === "copy") {
      navigator.clipboard.writeText(url);
      alert("Link copied!");
    } else if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${text}`);
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
    }
  }
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Link href="/money" className="inline-block mb-6 text-blue-600 hover:underline text-sm">
        ← Back to all guides
      </Link>
      <div className="flex items-center gap-2 mb-2">
        <span className={`inline-block px-3 py-1 text-xs rounded-full font-semibold ${guide.category === "FINANCE" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{guide.category === "FINANCE" ? "Finance" : "Career"}</span>
        <span className="text-xs text-gray-500">By {guide.author}</span>
        <span className="text-xs text-gray-500">• {new Date(guide.publishedAt).toLocaleDateString()}</span>
        <span className="text-xs text-gray-500">• {estimateReadTime(guide.content)} min read</span>
        <button
          className={`ml-2 rounded-full px-2 py-1 text-xs ${favorites.includes(guide.slug) ? "bg-yellow-300 text-yellow-900" : "bg-gray-200 text-gray-600"}`}
          onClick={toggleFavorite}
          title={favorites.includes(guide.slug) ? "Remove from favorites" : "Add to favorites"}
        >
          ★
        </button>
        {read.includes(guide.slug) && (
          <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">Read</span>
        )}
      </div>
      <h1 className="text-3xl font-bold mb-4">{guide.title}</h1>
      <img src={guide.coverImageUrl} alt={guide.title} className="rounded-lg mb-6 w-full max-h-72 object-cover" />
      <div className="flex gap-2 mb-6">
        <button className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200" onClick={() => share("copy")}>Copy Link</button>
        <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200" onClick={() => share("twitter")}>Share on Twitter</button>
        <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700" onClick={() => share("facebook")}>Share on Facebook</button>
      </div>
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{guide.content}</ReactMarkdown>
      </div>
    </div>
  );
} 