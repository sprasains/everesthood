# Page snapshot

```yaml
- alert
- dialog "Failed to compile":
  - heading "Failed to compile" [level=4]
  - text: "./app/(main)/careers/page.tsx:3:0 Module not found: Can't resolve '@heroicons/react/24/outline' 1 | \"use client\"; 2 | import React, { useEffect, useState } from \"react\"; > 3 | import { BriefcaseIcon, MapPinIcon, BuildingOffice2Icon, ArrowTopRightOnSquareIcon, Squares2X2Icon, Bars3Icon, GlobeAltIcon } from '@heroicons/react/24/outline'; 4 | import { Card, CardActionArea, CardMedia, CardContent, Typography, Box, Button, Paper, Container, ToggleButton, ToggleButtonGroup, Grid, CircularProgress } from '@mui/material'; 5 | import ArrowForwardIcon from '@mui/icons-material/ArrowForward'; 6 | import ViewModuleIcon from '@mui/icons-material/ViewModule'; https://nextjs.org/docs/messages/module-not-found"
  - contentinfo:
    - paragraph: This error occurred during the build process and can only be dismissed by fixing the error.
```