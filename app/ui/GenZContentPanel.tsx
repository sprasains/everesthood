"use client";
import { motion } from "framer-motion";
import { useGenZContent } from "../../src/hooks/useGenZContent";
import { Box, Typography, Chip, Card, CardContent, CardMedia, Stack, Grid, CircularProgress } from "@mui/material";

// Helper to check if a URL is valid (starts with http/https)
function isValidImageUrl(url?: string) {
  return !!url && (url.startsWith('http://') || url.startsWith('https://'));
}

export default function GenZContentPanel() {
  const {
    content,
    loading,
    selectedCategory,
    setSelectedCategory,
    categories,
  } = useGenZContent();

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" mb={2}>
        🌟 Gen-Z Vibes
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Trending culture & lifestyle from around the web.
      </Typography>

      {/* Category Filter */}
      <Stack direction="row" spacing={1} mb={4} flexWrap="wrap">
        {categories.map((category) => (
          <Chip
            key={category.id}
            label={category.icon + " " + category.name}
            color={selectedCategory === category.id ? "primary" : "default"}
            onClick={() => setSelectedCategory(category.id)}
            sx={{ mb: 1 }}
          />
        ))}
      </Stack>

      {/* Content List */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : content.length === 0 ? (
        <Typography color="text.secondary" align="center">
          No Gen-Z content found.
        </Typography>
      ) : (
        <Box display="flex" flexWrap="wrap" gap={3} justifyContent="center">
          {content.map((item) => (
            <Box key={item.id} flexBasis={{ xs: '100%', sm: '48%', md: '30%' }} minWidth={280} maxWidth={370} flexGrow={1}>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column", background: "#181825", color: "#fff" }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={isValidImageUrl(item.imageUrl) ? item.imageUrl : '/default-image.jpg'}
                    alt={item.title}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                      {item.title}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      {item.sourceName && (
                        <Chip label={item.sourceName} size="small" color="secondary" />
                      )}
                      {item.publishedAt && (
                        <Typography variant="caption" color="gray">
                          {new Date(item.publishedAt).toLocaleDateString()}
                        </Typography>
                      )}
                    </Stack>
                    <Typography variant="body2" color="#bdbdbd" mb={1} sx={{ minHeight: 40 }}>
                      {item.description}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
                      {item.tags.slice(0, 3).map((tag, i) => (
                        <Chip key={i} label={`#${tag}`} size="small" color="primary" variant="outlined" />
                      ))}
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mt="auto">
                      <Typography variant="caption" color="#bdbdbd">
                        {item.category}
                      </Typography>
                      <Typography variant="caption" color="#bdbdbd">
                        🔥 {item.engagement}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </motion.div>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
