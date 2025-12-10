import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import { userService, ApiUserWithLines } from '../../services/userService';
import { extractApiErrorMessage } from '../../utils/apiError';

interface TransferDialogProps {
  open: boolean;
  onClose: () => void;
  onTransfer: (userId: string, userName: string) => void;
}

const TransferDialog: React.FC<TransferDialogProps> = ({ open, onClose, onTransfer }) => {
  const [users, setUsers] = useState<ApiUserWithLines[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAllUsers();
      setUsers(data.user);
    } catch (err: any) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = () => {
    if (selectedUserId) {
      const selectedUser = users.find(u => u.user.id === selectedUserId);
      const userName = selectedUser ? `${selectedUser.user.firstName} ${selectedUser.user.lastName}` : '';
      onTransfer(selectedUserId, userName);
      setSelectedUserId(null);
    }
  };

  const handleClose = () => {
    setSelectedUserId(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Transferir Chat</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : users.length === 0 ? (
          <Typography color="text.secondary">No hay usuarios disponibles</Typography>
        ) : (
          <List>
            {users.map((userWithLines) => (
              <ListItemButton
                key={userWithLines.user.id}
                selected={selectedUserId === userWithLines.user.id}
                onClick={() => setSelectedUserId(userWithLines.user.id)}
              >
                <ListItemText
                  primary={`${userWithLines.user.firstName} ${userWithLines.user.lastName}`}
                  secondary={userWithLines.user.email}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          onClick={handleTransfer}
          variant="contained"
          disabled={!selectedUserId}
        >
          Transferir
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransferDialog;

