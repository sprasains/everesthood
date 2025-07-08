"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, Zoom } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { motion } from "framer-motion";

interface EditPostButtonProps {
  postId: string;
  authorId: string;
}

export default function EditPostButton({ postId, authorId }: EditPostButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  if (!session?.user?.id || session.user.id !== authorId) return null;
  return (
    <Zoom in>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          sx={{ mt: 2, fontWeight: "bold", borderRadius: 2, boxShadow: 3 }}
          onClick={() => router.push(`/posts/${postId}/edit`)}
        >
          Edit Post
        </Button>
      </motion.div>
    </Zoom>
  );
} 