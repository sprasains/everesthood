'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSearchKeyboardShortcuts } from '@/lib/hooks/useSearchKeyboardShortcuts';
import { debounce } from 'lodash';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { highlightText } from '@/lib/utils/highlight';

type SearchResult = {
  query: string;
  totalResults: number;
  results: {
    posts?: Array<{
      id: string;
      title: string | null;
      content: string;
      createdAt: string;
      author: {
        id: string;
        name: string | null;
        profilePicture: string | null;
      };
      _count: {
        likes: number;
        comments: number;
      };
    }>;
    events?: Array<{
      id: string;
      title: string;
      description: string;
      startTime: string;
      endTime: string;
      organizer: {
        id: string;
        name: string | null;
        profilePicture: string | null;
      };
      _count: {
        attendees: number;
      };
    }>;
    users?: Array<{
      id: string;
      name: string | null;
      profilePicture: string | null;
      bio: string | null;
      _count: {
        followers: number;
        following: number;
        posts: number;
      };
    }>;
    polls?: Array<{
      id: string;
      question: string;
      endDate: string;
      createdBy: {
        id: string;
        name: string | null;
        profilePicture: string | null;
      };
      _count: {
        votes: number;
      };
    }>;
  };
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams?.get('q') || '');
  const [type, setType] = useState(searchParams?.get('type') || 'all');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useSearchKeyboardShortcuts(
    () => searchInputRef.current?.focus(),
    (newType) => setType(newType)
  );

  const performSearch = debounce(async (searchQuery: string, searchType: string) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/v1/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}&limit=20`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  useEffect(() => {
    if (query) {
      performSearch(query, type);
      router.push(`/search?q=${encodeURIComponent(query)}&type=${type}`, { scroll: false });
    }
  }, [query, type, performSearch, router]);

  const renderPosts = () => {
    if (!results?.results.posts?.length) return <p>No posts found</p>;
    return results.results.posts.map((post) => (
      <Card key={post.id} className="mb-4">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Avatar src={post.author.profilePicture || ''} alt={post.author.name || 'User'} />
            <div>
              <Link href={`/profile/${post.author.id}`} className="font-medium hover:underline">
                {post.author.name}
              </Link>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <Link href={`/posts/${post.id}`}>
            {post.title && (
              <h3 className="text-lg font-semibold mb-2">
                {highlightText(post.title, query)}
              </h3>
            )}
            <p className="text-gray-600">{highlightText(post.content, query)}</p>
          </Link>
          <div className="flex gap-4 mt-2">
            <span>❤️ {post._count.likes}</span>
            <span>💬 {post._count.comments}</span>
          </div>
        </CardContent>
      </Card>
    ));
  };

  const renderEvents = () => {
    if (!results?.results.events?.length) return <p>No events found</p>;
    return results.results.events.map((event) => (
      <Card key={event.id} className="mb-4">
        <CardContent className="pt-4">
          <Link href={`/events/${event.id}`}>
            <h3 className="text-lg font-semibold mb-2">
              {highlightText(event.title, query)}
            </h3>
          </Link>
          <p className="text-gray-600 mb-2">
            {highlightText(event.description, query)}
          </p>
          <div className="flex flex-col gap-1 text-sm">
            <div>🗓️ {new Date(event.startTime).toLocaleString()}</div>
            <div>👥 {event._count.attendees} attending</div>
          </div>
          <div className="mt-2">
            <Link href={`/profile/${event.organizer.id}`} className="text-sm hover:underline">
              Organized by {event.organizer.name}
            </Link>
          </div>
        </CardContent>
      </Card>
    ));
  };

  const renderUsers = () => {
    if (!results?.results.users?.length) return <p>No users found</p>;
    return results.results.users.map((user) => (
      <Card key={user.id} className="mb-4">
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <Avatar src={user.profilePicture || ''} alt={user.name || 'User'} className="w-16 h-16" />
            <div>
              <Link href={`/profile/${user.id}`}>
                <h3 className="text-lg font-semibold">{user.name}</h3>
              </Link>
              {user.bio && (
                <p className="text-gray-600 mt-1">
                  {highlightText(user.bio, query)}
                </p>
              )}
              <div className="flex gap-4 mt-2 text-sm">
                <span>{user._count.followers} followers</span>
                <span>{user._count.following} following</span>
                <span>{user._count.posts} posts</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  };

  const renderPolls = () => {
    if (!results?.results.polls?.length) return <p>No polls found</p>;
    return results.results.polls.map((poll) => (
      <Card key={poll.id} className="mb-4">
        <CardContent className="pt-4">
          <Link href={`/polls/${poll.id}`}>
            <h3 className="text-lg font-semibold mb-2">
              {highlightText(poll.question, query)}
            </h3>
          </Link>
          <div className="flex flex-col gap-1 text-sm">
            <div>🗳️ {poll._count.votes} votes</div>
            <div>⏰ Ends {formatDistanceToNow(new Date(poll.endDate), { addSuffix: true })}</div>
          </div>
          <div className="mt-2">
            <Link href={`/profile/${poll.createdBy.id}`} className="text-sm hover:underline">
              Created by {poll.createdBy.name}
            </Link>
          </div>
        </CardContent>
      </Card>
    ));
  };

  const renderLoadingState = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="mb-4">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Input
            type="search"
            placeholder="Search posts, events, users, and polls... (Press Cmd/Ctrl + K to focus)"
            ref={searchInputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full"
          />
        </div>

        <Tabs value={type} onValueChange={setType} className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">All <span className="text-xs text-gray-500 ml-1">Alt+1</span></TabsTrigger>
            <TabsTrigger value="posts">Posts <span className="text-xs text-gray-500 ml-1">Alt+2</span></TabsTrigger>
            <TabsTrigger value="events">Events <span className="text-xs text-gray-500 ml-1">Alt+3</span></TabsTrigger>
            <TabsTrigger value="users">Users <span className="text-xs text-gray-500 ml-1">Alt+4</span></TabsTrigger>
            <TabsTrigger value="polls">Polls <span className="text-xs text-gray-500 ml-1">Alt+5</span></TabsTrigger>
          </TabsList>

          {query && (
            <div className="mt-4 mb-6">
              {results && (
                <p className="text-sm text-gray-500">
                  Found {results.totalResults} results for &ldquo;{query}&rdquo;
                </p>
              )}
            </div>
          )}

          {isLoading ? (
            renderLoadingState()
          ) : (
            <>
              <TabsContent value="all">
                {results && (
                  <div className="space-y-8">
                    {results.results.posts?.length ? (
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Posts</h2>
                        {renderPosts()}
                      </div>
                    ) : null}
                    {results.results.events?.length ? (
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Events</h2>
                        {renderEvents()}
                      </div>
                    ) : null}
                    {results.results.users?.length ? (
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Users</h2>
                        {renderUsers()}
                      </div>
                    ) : null}
                    {results.results.polls?.length ? (
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Polls</h2>
                        {renderPolls()}
                      </div>
                    ) : null}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="posts">{renderPosts()}</TabsContent>
              <TabsContent value="events">{renderEvents()}</TabsContent>
              <TabsContent value="users">{renderUsers()}</TabsContent>
              <TabsContent value="polls">{renderPolls()}</TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}
