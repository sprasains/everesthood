"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { Box, Typography, Button, CircularProgress, Snackbar } from "@mui/material";
// @ts-ignore
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function fetchUsers() {
  return fetch("/api/v1/admin/users").then((res) => res.json());
}

export default function AdminUsersPage() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: fetchUsers });
  const users = data?.users || [];
  const queryClient = useQueryClient();
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const banMutation = useMutation({
    mutationFn: async (userId: string) => {
      await fetch(`/api/v1/admin/users/${userId}/ban`, { method: "POST" });
    },
    onSuccess: () => {
      setSnackbar("User banned.");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const unbanMutation = useMutation({
    mutationFn: async (userId: string) => {
      await fetch(`/api/v1/admin/users/${userId}/unban`, { method: "POST" });
    },
    onSuccess: () => {
      setSnackbar("User unbanned.");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
    { field: "isBanned", headerName: "Banned", flex: 0.5, type: "boolean" },
    { field: "languagePreference", headerName: "Language", flex: 0.5 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => {
        const user = params.row;
        return (
          <>
            {user.isBanned ? (
              <Button size="small" onClick={() => unbanMutation.mutate(user.id)} disabled={unbanMutation.isPending}>
                Unban
              </Button>
            ) : (
              <Button size="small" color="error" onClick={() => banMutation.mutate(user.id)} disabled={banMutation.isPending}>
                Ban
              </Button>
            )}
          </>
        );
      },
    },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row.id}
          autoHeight
          pageSizeOptions={[10, 25, 50]}
        />
      )}
      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
      />
    </Box>
  );
} 