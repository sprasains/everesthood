"use client";
import { useState } from 'react';
import { Box, Typography, Button, LinearProgress } from '@mui/material';
import { logger, newCorrelationId } from '@/services/logger';

interface PollOption {
    id: string;
    text: string;
    _count: { votes: number };
}

interface PollData {
    id: string;
    question: string;
    options: PollOption[];
}

export default function PollCard({ pollData }: { pollData: PollData }) {
    const [voted, setVoted] = useState<string | null>(null);
    const [options, setOptions] = useState<PollOption[]>(pollData.options);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const totalVotes = options.reduce((acc: number, opt: PollOption) => acc + opt._count.votes, 0);

    const handleVote = async (optionId: string) => {
        setLoading(true);
        setError("");
        newCorrelationId();
        logger.info('Voting on poll option.', { optionId });
        try {
            const res = await fetch(`/api/v1/polls/${optionId}/vote`, { method: 'POST', headers: { 'X-Correlation-ID': correlationId } });
            if (!res.ok) {
                const msg = await res.text();
                logger.warn('Failed to vote on poll.', { status: res.status, message: msg });
                setError(msg || "Failed to vote");
                setLoading(false);
                return;
            }
            logger.info('Poll vote successful.', { optionId });
            setVoted(optionId);
            setOptions(options.map((opt: PollOption) =>
                opt.id === optionId
                    ? { ...opt, _count: { ...opt._count, votes: opt._count.votes + 1 } }
                    : opt
            ));
        } catch (e: any) {
            logger.error('Network error during poll vote.', { error: e.message, stack: e.stack });
            setError("Network error");
        }
        setLoading(false);
    };

    return (
        <div data-testid="poll-card">
            <Box sx={{ p: 2, border: '1px solid grey', borderRadius: 2 }}>
                <Typography variant="h6">{pollData.question}</Typography>
                {error && <Typography color="error" variant="body2">{error}</Typography>}
                <Box sx={{ my: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {options.map((option: PollOption) => {
                        const votePercentage = totalVotes > 0 ? (option._count.votes / totalVotes) * 100 : 0;
                        return (
                            <Box key={option.id}>
                                {voted ? (
                                    <>
                                        <Typography>{option.text} ({votePercentage.toFixed(0)}%)</Typography>
                                        <LinearProgress variant="determinate" value={votePercentage} />
                                    </>
                                ) : (
                                    <Button fullWidth variant="outlined" onClick={() => handleVote(option.id)} disabled={loading}>
                                        {option.text}
                                    </Button>
                                )}
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </div>
    );
}
