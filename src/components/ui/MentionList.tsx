import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Box, Paper, Typography } from '@mui/material';

// TipTap expects a forwardRef component for the mention list
const MentionList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({ id: item.id, label: item.name });
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: React.KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }
      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }
      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  return (
    <Paper elevation={5} sx={{ p: 1 }}>
      {props.items.length ? (
        props.items.map((item: any, index: number) => (
          <Box
            key={index}
            onClick={() => selectItem(index)}
            sx={{
              p: 1,
              cursor: 'pointer',
              borderRadius: 1,
              backgroundColor: index === selectedIndex ? 'action.hover' : 'transparent',
            }}
          >
            <Typography>{item.name}</Typography>
          </Box>
        ))
      ) : (
        <Box sx={{ p: 1 }}><Typography variant="body2">No results</Typography></Box>
      )}
    </Paper>
  );
});

export default MentionList; 