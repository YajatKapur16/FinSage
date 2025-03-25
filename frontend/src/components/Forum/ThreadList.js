import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Box,
  Paper,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Comment as CommentIcon,
  Schedule as ScheduleIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const ThreadList = ({ threads, onThreadClick }) => {
  return (
    <List component={Paper} sx={{ bgcolor: 'background.paper' }}>
      {threads.map((thread, index) => (
        <React.Fragment key={thread.id}>
          {index > 0 && <Divider />}
          <ListItem
            alignItems="flex-start"
            button
            onClick={() => onThreadClick(thread)}
            sx={{
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <ListItemText
              primary={
                <Typography
                  component="div"
                  variant="h6"
                  color="primary"
                  sx={{ mb: 1 }}
                >
                  {thread.title}
                </Typography>
              }
              secondary={
                <Box>
                  <Typography
                    component="div"
                    variant="body2"
                    color="text.primary"
                    sx={{ mb: 1 }}
                  >
                    {thread.description.length > 200
                      ? `${thread.description.substring(0, 200)}...`
                      : thread.description}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      color: 'text.secondary',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Tooltip title="Created at">
                        <ScheduleIcon fontSize="small" sx={{ mr: 0.5 }} />
                      </Tooltip>
                      <Typography variant="caption">
                        {format(new Date(thread.created_at), 'PPp')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Tooltip title="Replies">
                        <CommentIcon fontSize="small" sx={{ mr: 0.5 }} />
                      </Tooltip>
                      <Typography variant="caption">
                        {thread.replies?.length || 0} replies
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Tooltip title="Author">
                        <AccountIcon fontSize="small" sx={{ mr: 0.5 }} />
                      </Tooltip>
                      <Typography variant="caption">
                        {thread.user_id}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              }
            />
          </ListItem>
        </React.Fragment>
      ))}
      {threads.length === 0 && (
        <ListItem>
          <ListItemText
            primary={
              <Typography align="center" color="text.secondary">
                No threads found
              </Typography>
            }
          />
        </ListItem>
      )}
    </List>
  );
};

export default ThreadList;