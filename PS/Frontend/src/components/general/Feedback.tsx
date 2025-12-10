import React from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

export interface FeedbackProps {
  open: boolean;
  message: string;
  onClose: () => void;
  autoHideDuration?: number;
}

const BaseFeedback: React.FC<FeedbackProps & { severity: AlertColor }> = ({
  open,
  message,
  onClose,
  autoHideDuration = 3500,
  severity,
}) => {
  return (
    <Snackbar open={open} autoHideDuration={autoHideDuration} onClose={onClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export const SuccessFeedback: React.FC<FeedbackProps> = (props) => (
  <BaseFeedback {...props} severity="success" />
);

export const ErrorFeedback: React.FC<FeedbackProps> = (props) => (
  <BaseFeedback {...props} severity="error" />
);


