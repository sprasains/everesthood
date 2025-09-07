"use client";

import { Box, Container, Typography, Paper, Card, CardContent, CardHeader, Avatar, Chip, Button, LinearProgress, Alert, AlertTitle, Fab, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Tooltip, List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction, Divider, Badge } from "@mui/material";
import Grid from "@mui/material/Grid";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AccountBalanceWallet,
  Send,
  ReceiptLong,
  Add,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Error as ErrorIcon,
  Pending,
  Refresh,
  History,
  MonetizationOn,
  Person,
  Message,
  Visibility,
  VisibilityOff
} from "@mui/icons-material";

interface Wallet {
  id: string;
  balance: number;
  currency: string;
  isActive: boolean;
  transactions: WalletTransaction[];
}

interface WalletTransaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  createdAt: string;
}

interface Tip {
  id: string;
  amount: number;
  currency: string;
  message?: string;
  isAnonymous: boolean;
  status: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    image?: string;
  };
  receiver?: {
    id: string;
    name: string;
    image?: string;
  };
}

export default function WalletPage() {
  const { data: session, status } = useSession();
  const { user } = useUser();
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [tipDialogOpen, setTipDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [tipData, setTipData] = useState({
    receiverId: "",
    amount: "",
    message: "",
    isAnonymous: false
  });

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    fetchWalletData();
  }, [session, status, router]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [walletResponse, tipsResponse] = await Promise.all([
        fetch('/api/wallet'),
        fetch('/api/tips')
      ]);
      
      if (!walletResponse.ok || !tipsResponse.ok) {
        throw new Error('Failed to fetch wallet data');
      }
      
      const walletData = await walletResponse.json();
      const tipsData = await tipsResponse.json();
      
      setWallet(walletData);
      setTips(tipsData.tips);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    try {
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(depositAmount),
          type: 'DEPOSIT',
          description: 'Wallet deposit'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to deposit funds');
      }

      setDepositDialogOpen(false);
      setDepositAmount("");
      fetchWalletData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleSendTip = async () => {
    try {
      const response = await fetch('/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...tipData,
          amount: parseFloat(tipData.amount)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send tip');
      }

      setTipDialogOpen(false);
      setTipData({
        receiverId: "",
        amount: "",
        message: "",
        isAnonymous: false
      });
      fetchWalletData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return <TrendingUp color="success" />;
      case 'TIP_SENT': return <Send color="error" />;
      case 'TIP_RECEIVED': return <ReceiptLong color="success" />;
      case 'WITHDRAWAL': return <TrendingDown color="warning" />;
      default: return <MonetizationOn />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return 'success';
      case 'TIP_SENT': return 'error';
      case 'TIP_RECEIVED': return 'success';
      case 'WITHDRAWAL': return 'warning';
      default: return 'default';
    }
  };

  if (status === "loading" || loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading Wallet...
            </Typography>
          </Paper>
        </motion.div>
      </Box>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      pt: 8, // Account for navbar
    }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              fontWeight="bold" 
              sx={{ 
                color: 'white', 
                mb: 2,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              Wallet & Tipping
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Manage your credits, send tips, and track your transactions
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}

          {/* Wallet Balance Card */}
          {wallet && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card sx={{ 
                mb: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                textAlign: 'center',
                p: 4
              }}>
                <AccountBalanceWallet sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="h2" fontWeight="bold" color="primary.main" sx={{ mb: 1 }}>
                  ${wallet.balance.toFixed(2)}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                  Available Balance
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setDepositDialogOpen(true)}
                    sx={{ borderRadius: 2 }}
                  >
                    Add Funds
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Send />}
                    onClick={() => setTipDialogOpen(true)}
                    sx={{ borderRadius: 2 }}
                  >
                    Send Tip
                  </Button>
                </Box>
              </Card>
            </motion.div>
          )}

          {/* Recent Transactions */}
          {wallet && wallet.transactions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Paper sx={{ 
                mb: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
              }}>
                <CardHeader
                  title="Recent Transactions"
                  avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><History /></Avatar>}
                  action={
                    <IconButton onClick={fetchWalletData}>
                      <Refresh />
                    </IconButton>
                  }
                />
                <CardContent>
                  <List>
                    {wallet.transactions.map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <ListItem>
                          <ListItemIcon>
                            {getTransactionIcon(transaction.type)}
                          </ListItemIcon>
                          <ListItemText
                            primary={transaction.description}
                            secondary={new Date(transaction.createdAt).toLocaleDateString()}
                          />
                          <ListItemSecondaryAction>
                            <Chip
                              label={`${transaction.amount > 0 ? '+' : ''}$${transaction.amount.toFixed(2)}`}
                              color={getTransactionColor(transaction.type) as any}
                              variant="outlined"
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < wallet.transactions.length - 1 && <Divider />}
                      </motion.div>
                    ))}
                  </List>
                </CardContent>
              </Paper>
            </motion.div>
          )}

          {/* Recent Tips */}
          {tips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Paper sx={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
              }}>
                <CardHeader
                  title="Recent Tips"
                  avatar={<Avatar sx={{ bgcolor: 'success.main' }}><MonetizationOn /></Avatar>}
                />
                <CardContent>
                  <List>
                    {tips.slice(0, 5).map((tip, index) => (
                      <motion.div
                        key={tip.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <ListItem>
                          <ListItemIcon>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {tip.sender?.name?.charAt(0) || 'A'}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={`${tip.isAnonymous ? 'Anonymous' : tip.sender?.name} → ${tip.receiver?.name}`}
                            secondary={tip.message || 'No message'}
                          />
                          <ListItemSecondaryAction>
                            <Chip
                              label={`$${tip.amount.toFixed(2)}`}
                              color="success"
                              variant="outlined"
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < Math.min(tips.length, 5) - 1 && <Divider />}
                      </motion.div>
                    ))}
                  </List>
                </CardContent>
              </Paper>
            </motion.div>
          )}

          {/* Deposit Dialog */}
          <Dialog 
            open={depositDialogOpen} 
            onClose={() => setDepositDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Add Funds to Wallet</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.00"
                sx={{ mt: 2 }}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDepositDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleDeposit}
                variant="contained"
                disabled={!depositAmount || parseFloat(depositAmount) <= 0}
              >
                Add Funds
              </Button>
            </DialogActions>
          </Dialog>

          {/* Send Tip Dialog */}
          <Dialog 
            open={tipDialogOpen} 
            onClose={() => setTipDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Send Tip</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Receiver ID"
                value={tipData.receiverId}
                onChange={(e) => setTipData({ ...tipData, receiverId: e.target.value })}
                placeholder="User ID or email"
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={tipData.amount}
                onChange={(e) => setTipData({ ...tipData, amount: e.target.value })}
                placeholder="0.00"
                sx={{ mt: 2 }}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Message (Optional)"
                value={tipData.message}
                onChange={(e) => setTipData({ ...tipData, message: e.target.value })}
                placeholder="Say something nice..."
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setTipDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendTip}
                variant="contained"
                disabled={!tipData.receiverId || !tipData.amount || parseFloat(tipData.amount) <= 0}
              >
                Send Tip
              </Button>
            </DialogActions>
          </Dialog>
        </motion.div>
      </Container>
    </Box>
  );
} 