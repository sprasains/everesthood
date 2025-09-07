"use client";
import { Box, Paper, Typography, BoxProps, PaperProps } from '@mui/material';
import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps extends Omit<PaperProps, 'component' | 'variant'> {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  motionProps?: MotionProps;
  headerAction?: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
}

// Export individual components for compatibility
export const Card = CardComponent;
export const CardContent = ({ children, ...props }: { children: ReactNode } & BoxProps) => (
  <Box {...props}>{children}</Box>
);
export const CardHeader = ({ children, ...props }: { children: ReactNode } & BoxProps) => (
  <Box {...props}>{children}</Box>
);
export const CardTitle = ({ children, ...props }: { children: ReactNode } & BoxProps) => (
  <Typography variant="h6" {...props}>{children}</Typography>
);

function CardComponent({
  title,
  subtitle,
  children,
  variant = 'default',
  size = 'md',
  animate = true,
  motionProps,
  headerAction,
  footer,
  loading = false,
  sx,
  ...paperProps
}: CardProps) {
  // Variant styles
  const variantStyles = {
    default: {
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    elevated: {
      bgcolor: 'background.paper',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      border: 'none',
    },
    outlined: {
      bgcolor: 'transparent',
      border: '2px solid',
      borderColor: 'divider',
      boxShadow: 'none',
    },
    glass: {
      bgcolor: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    },
  };

  // Size styles
  const sizeStyles = {
    sm: { p: 2 },
    md: { p: 3 },
    lg: { p: 4 },
  };

  // Default motion props
  const defaultMotionProps: MotionProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeOut" },
    whileHover: { y: -2 },
    ...motionProps,
  };

  // Render with proper component handling
  if (animate) {
    return (
      <motion.div {...defaultMotionProps}>
        <Paper
          sx={{
            ...variantStyles[variant],
            ...sizeStyles[size],
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: variant === 'elevated' 
                ? '0 8px 24px rgba(0, 0, 0, 0.2)' 
                : variant === 'glass'
                ? '0 12px 40px rgba(0, 0, 0, 0.15)'
                : '0 2px 8px rgba(0, 0, 0, 0.1)',
            },
            ...sx,
          }}
          {...paperProps}
        >
          {/* Loading overlay */}
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                backdropFilter: 'blur(2px)',
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  border: '3px solid',
                  borderColor: 'primary.main',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
            </Box>
          )}

          {/* Header */}
          {(title || subtitle || headerAction) && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: size === 'sm' ? 2 : 3,
                pb: size === 'sm' ? 2 : 3,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {title && (
                  <Typography
                    variant={size === 'sm' ? 'h6' : 'h5'}
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
              {headerAction && (
                <Box sx={{ ml: 2, flexShrink: 0 }}>
                  {headerAction}
                </Box>
              )}
            </Box>
          )}

          {/* Content */}
          <Box sx={{ position: 'relative' }}>
            {children}
          </Box>

          {/* Footer */}
          {footer && (
            <Box
              sx={{
                mt: size === 'sm' ? 2 : 3,
                pt: size === 'sm' ? 2 : 3,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              {footer}
            </Box>
          )}
        </Paper>
      </motion.div>
    );
  }

  // Non-animated version
  return (
    <Box>
      <Paper
        sx={{
          ...variantStyles[variant],
          ...sizeStyles[size],
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: variant === 'elevated' 
              ? '0 8px 24px rgba(0, 0, 0, 0.2)' 
              : variant === 'glass'
              ? '0 12px 40px rgba(0, 0, 0, 0.15)'
              : '0 2px 8px rgba(0, 0, 0, 0.1)',
          },
          ...sx,
        }}
        {...paperProps}
      >
        {/* Loading overlay */}
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
              backdropFilter: 'blur(2px)',
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                border: '3px solid',
                borderColor: 'primary.main',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
          </Box>
        )}

        {/* Header */}
        {(title || subtitle || headerAction) && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: size === 'sm' ? 2 : 3,
              pb: size === 'sm' ? 2 : 3,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {title && (
                <Typography
                  variant={size === 'sm' ? 'h6' : 'h5'}
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
            {headerAction && (
              <Box sx={{ ml: 2, flexShrink: 0 }}>
                {headerAction}
              </Box>
            )}
          </Box>
        )}

        {/* Content */}
        <Box sx={{ position: 'relative' }}>
          {children}
        </Box>

        {/* Footer */}
        {footer && (
          <Box
            sx={{
              mt: size === 'sm' ? 2 : 3,
              pt: size === 'sm' ? 2 : 3,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            {footer}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default Card;
