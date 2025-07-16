"use client";
export const dynamic = "force-dynamic";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface GuidePreview {
  title: string;
  slug: string;
  shortDescription: string;
  coverImageUrl: string;
  category: "FINANCE" | "CAREER";
  author: string;
  publishedAt: string;
}

function estimateReadTime(content: string) {
  // Roughly 200 words per minute
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default function MoneyHubPage() {
  const [guides, setGuides] = useState<GuidePreview[]>([]);
  const [allGuides, setAllGuides] = useState<GuidePreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [read, setRead] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/guides")
      .then((res) => res.json())
      .then((data) => {
        setGuides(data);
        setAllGuides(data);
        setLoading(false);
      });
    setRead(JSON.parse(localStorage.getItem("readGuides") || "[]"));
    setFavorites(JSON.parse(localStorage.getItem("favoriteGuides") || "[]"));
  }, []);

  useEffect(() => {
    localStorage.setItem("readGuides", JSON.stringify(read));
  }, [read]);
  useEffect(() => {
    localStorage.setItem("favoriteGuides", JSON.stringify(favorites));
  }, [favorites]);

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    filterGuides(e.target.value, category);
  }
  function handleCategory(cat: string | null) {
    setCategory(cat);
    filterGuides(search, cat);
  }
  function filterGuides(search: string, cat: string | null) {
    let filtered = allGuides;
    if (cat) filtered = filtered.filter((g) => g.category === cat);
    if (search)
      filtered = filtered.filter((g) =>
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.shortDescription.toLowerCase().includes(search.toLowerCase()) ||
        g.author.toLowerCase().includes(search.toLowerCase())
      );
    setGuides(filtered);
  }
  function toggleFavorite(slug: string) {
    setFavorites((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Money & Hustle Guides</h1>
      <p className="mb-8 text-center text-gray-600">Level up your financial and career skills with these easy-to-read guides.</p>
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
        <input
          type="text"
          placeholder="Search guides..."
          value={search}
          onChange={handleSearch}
          className="border rounded px-3 py-2 w-full sm:w-64"
        />
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded ${!category ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
            onClick={() => handleCategory(null)}
          >All</button>
          <button
            className={`px-3 py-1 rounded ${category === "FINANCE" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"}`}
            onClick={() => handleCategory("FINANCE")}
          >Finance</button>
          <button
            className={`px-3 py-1 rounded ${category === "CAREER" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
            onClick={() => handleCategory("CAREER")}
          >Career</button>
        </div>
      </div>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {guides.map((guide) => (
            <div key={guide.slug} className="relative group">
              <Link href={`/money/${guide.slug}`} className="block">
                <div className="rounded-lg shadow-lg bg-white hover:shadow-2xl transition overflow-hidden flex flex-col h-full">
                  <Image src={guide.coverImageUrl} alt={guide.title} width={400} height={160} className="h-40 w-full object-cover" />
                  <div className="p-4 flex-1 flex flex-col">
                    <span className={`inline-block mb-2 px-2 py-1 text-xs rounded-full font-semibold ${guide.category === "FINANCE" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{guide.category === "FINANCE" ? "Finance" : "Career"}</span>
                    <h2 className="text-lg font-semibold mb-1 group-hover:text-blue-600 transition">{guide.title}</h2>
                    <p className="text-gray-600 text-sm flex-1 mb-2">{guide.shortDescription}</p>
                    <div className="flex items-center text-xs text-gray-500 gap-2 mb-1">
                      <span>By {guide.author}</span>
                      <span>• {new Date(guide.publishedAt).toLocaleDateString()}</span>
                    </div>
                    {/* Estimated read time placeholder, will be replaced with real value on guide page */}
                  </div>
                </div>
              </Link>
              <button
                className={`absolute top-2 right-2 z-10 rounded-full p-1 text-xs ${favorites.includes(guide.slug) ? "bg-yellow-300 text-yellow-900" : "bg-gray-200 text-gray-600"}`}
                onClick={() => toggleFavorite(guide.slug)}
                title={favorites.includes(guide.slug) ? "Remove from favorites" : "Add to favorites"}
              >
                ★
              </button>
              {read.includes(guide.slug) && (
                <span className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">Read</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 