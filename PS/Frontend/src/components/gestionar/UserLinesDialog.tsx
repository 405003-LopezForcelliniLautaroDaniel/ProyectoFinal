import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, CircularProgress, List, ListItemButton, ListItemText } from '@mui/material';
import { lineService, ApiLine } from '../../services/lineService';
import { extractApiErrorMessage } from '../../utils/apiError';
import { ErrorFeedback } from '../general/Feedback';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (line: ApiLine) => void;
}

const UserLinesDialog: React.FC<Props> = ({ open, onClose, onSelect }) => {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [lines, setLines] = useState<ApiLine[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await lineService.getAllLines();
        if (!mounted) return;
        setLines(data);
      } catch (err: any) {
        if (!mounted) return;
        setError(extractApiErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return lines;
    return lines.filter(l => l.name.toLowerCase().includes(q));
  }, [lines, query]);

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Seleccionar área/rol</DialogTitle>
        <DialogContent>
          <TextField fullWidth placeholder="Buscar" value={query} onChange={(e) => setQuery(e.target.value)} sx={{ my: 1 }} />
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {filtered.map(l => (
                <ListItemButton key={l.id} onClick={() => onSelect(l)}>
                  <ListItemText primary={l.name} secondary={l.company?.name || ''} />
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
      <ErrorFeedback open={!!error} message={error || ''} onClose={() => setError(null)} />
    </>
  );
};

export default UserLinesDialog;


