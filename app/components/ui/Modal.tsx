"use client";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  DialogProps,
  Typography,
  Box,
  IconButton,
  Button,
  ButtonProps,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import CloseIcon from '@mui/icons-material/Close';

interface ModalProps extends Omit<DialogProps, 'onClose'> {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'glass' | 'minimal';
  showCloseButton?: boolean;
  actions?: {
    primary?: {
      label: string;
      onClick: () => void;
      variant?: ButtonProps['variant'];
      color?: ButtonProps['color'];
      disabled?: boolean;
      loading?: boolean;
    };
    secondary?: {
      label: string;
      onClick: () => void;
      variant?: ButtonProps['variant'];
      color?: ButtonProps['color'];
      disabled?: boolean;
    };
    cancel?: {
      label?: string;
      onClick?: () => void;
    };
  };
  fullHeight?: boolean;
  preventCloseOnBackdrop?: boolean;
}

export default function Modal({
  title,
  subtitle,
  children,
  onClose,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  actions,
  fullHeight = false,
  preventCloseOnBackdrop = false,
  sx,
  ...dialogProps
}: ModalProps) {
  // Size configurations
  const sizeConfig = {
    sm: { maxWidth: 400, width: '90vw' },
    md: { maxWidth: 600, width: '90vw' },
    lg: { maxWidth: 900, width: '95vw' },
    xl: { maxWidth: 1200, width: '95vw' },
  };

  // Variant styles
  const variantStyles = {
    default: {
      bgcolor: 'background.paper',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '1px solid',
      borderColor: 'divider',
    },
    glass: {
      bgcolor: 'rgba(30, 30, 30, 0.95)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
      color: '#ffffff',
    },
    minimal: {
      bgcolor: 'background.paper',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: 'none',
    },
  };

  const handleClose = (event: any, reason: string) => {
    if (reason === 'backdropClick' && preventCloseOnBackdrop) {
      return;
    }
    onClose();
  };

  return (
    <Dialog
      onClose={handleClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          ...sizeConfig[size],
          ...variantStyles[variant],
          borderRadius: variant === 'minimal' ? 2 : 3,
          overflow: 'hidden',
          maxHeight: fullHeight ? '95vh' : '90vh',
          m: 2,
          ...sx,
        },
        component: motion.div,
        initial: { opacity: 0, scale: 0.9, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.9, y: 20 },
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      BackdropProps={{
        sx: {
          bgcolor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(2px)',
        },
      }}
      {...dialogProps}
    >
      {/* Header */}
      {(title || subtitle || showCloseButton) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3,
            pb: subtitle ? 2 : 3,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {title && (
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{
                  color: 'text.primary',
                  mb: subtitle ? 0.5 : 0,
                  lineHeight: 1.2,
                }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.4 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {showCloseButton && (
            <IconButton
              onClick={onClose}
              sx={{
                ml: 2,
                bgcolor: 'action.hover',
                '&:hover': { bgcolor: 'action.selected' },
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      )}

      {/* Content */}
      <DialogContent
        sx={{
          p: 3,
          overflow: 'auto',
          ...(fullHeight && { flex: 1 }),
        }}
      >
        {children}
      </DialogContent>

      {/* Actions */}
      {actions && (
        <DialogActions
          sx={{
            p: 3,
            pt: 2,
            gap: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
            justifyContent: 'flex-end',
          }}
        >
          {/* Cancel button */}
          {actions.cancel && (
            <Button
              onClick={actions.cancel.onClick || onClose}
              variant="outlined"
              color="inherit"
              sx={{ minWidth: 100 }}
            >
              {actions.cancel.label || 'Cancel'}
            </Button>
          )}

          {/* Secondary action */}
          {actions.secondary && (
            <Button
              onClick={actions.secondary.onClick}
              variant={actions.secondary.variant || 'outlined'}
              color={actions.secondary.color || 'primary'}
              disabled={actions.secondary.disabled}
              sx={{ minWidth: 100 }}
            >
              {actions.secondary.label}
            </Button>
          )}

          {/* Primary action */}
          {actions.primary && (
            <Button
              onClick={actions.primary.onClick}
              variant={actions.primary.variant || 'contained'}
              color={actions.primary.color || 'primary'}
              disabled={actions.primary.disabled || actions.primary.loading}
              sx={{ 
                minWidth: 100,
                position: 'relative',
                ...(actions.primary.loading && {
                  '& .MuiButton-startIcon': { opacity: 0 },
                }),
              }}
            >
              {actions.primary.loading && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 20,
                    height: 20,
                    border: '2px solid',
                    borderColor: 'currentColor',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
              )}
              {actions.primary.label}
            </Button>
          )}
        </DialogActions>
      )}

      {/* Loading animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </Dialog>
  );
}

// Export size options for easy access
export const ModalSizes = {
  sm: 'sm' as const,
  md: 'md' as const,
  lg: 'lg' as const,
  xl: 'xl' as const,
};

// Export variant options for easy access
export const ModalVariants = {
  default: 'default' as const,
  glass: 'glass' as const,
  minimal: 'minimal' as const,
}; 