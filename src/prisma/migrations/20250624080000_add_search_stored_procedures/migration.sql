-- Friend search function for PostgreSQL
CREATE OR REPLACE FUNCTION search_friends(user_id UUID, keyword TEXT)
RETURNS TABLE(id UUID, name TEXT, email TEXT, image TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.name, u.email, u.image
  FROM "users" u
  INNER JOIN "Friendship" f ON (
    (f."requesterId" = user_id AND f."receiverId" = u.id)
    OR (f."receiverId" = user_id AND f."requesterId" = u.id)
  )
  WHERE f.status = 'ACCEPTED'
    AND (u.name ILIKE '%' || keyword || '%' OR u.email ILIKE '%' || keyword || '%')
    AND u.id <> user_id;
END;
$$ LANGUAGE plpgsql;

-- News search function for PostgreSQL
CREATE OR REPLACE FUNCTION search_news(keyword TEXT)
RETURNS TABLE(id UUID, title TEXT, description TEXT, url TEXT, "imageUrl" TEXT, "sourceName" TEXT, "publishedAt" TIMESTAMP) AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.title, a.description, a.url, a."imageUrl", a."sourceName", a."publishedAt"
  FROM "articles" a
  WHERE a.title ILIKE '%' || keyword || '%' OR a.description ILIKE '%' || keyword || '%';
END;
$$ LANGUAGE plpgsql;
