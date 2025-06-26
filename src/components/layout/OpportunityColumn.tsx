"use client";
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, List, ListItem, ListItemText, Divider, Skeleton, Link as MuiLink } from '@mui/material';
import Link from 'next/link';

const fetchJobs = async () => {
    const res = await fetch('/api/v1/jobs'); // This endpoint should fetch all jobs
    if (!res.ok) throw new Error('Failed to fetch jobs');
    const data = await res.json();
    return data.jobs || data; // Adapt based on your API response structure
}

export default function OpportunityColumn() {
    const { data: jobs, isLoading, error } = useQuery({ queryKey: ['jobs'], queryFn: fetchJobs });

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                AI Opportunities
            </Typography>
            <List dense>
                {isLoading && (
                    <>
                        <Skeleton variant="text" height={40} />
                        <Skeleton variant="text" height={40} />
                        <Skeleton variant="text" height={40} />
                    </>
                )}
                {jobs?.slice(0, 10).map((job: any, index: number) => (
                    <div key={job.id}>
                        <ListItem button component={Link} href={`/careers/${job.id}`} passHref>
                           <ListItemText
                                primary={job.title}
                                secondary={job.companyName}
                                primaryTypographyProps={{ fontWeight: 'medium', noWrap: true }}
                                secondaryTypographyProps={{ noWrap: true }}
                           />
                        </ListItem>
                        {index < jobs.slice(0, 10).length - 1 && <Divider component="li" />}
                    </div>
                ))}
            </List>
            <MuiLink component={Link} href="/careers" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                View All...
            </MuiLink>
        </Box>
    );
}
