import React, { useEffect, useMemo, useState } from 'react';
import { Box, Grid, Paper, TextField, Typography, CircularProgress, Stack, Tooltip, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { lineService, ApiLine } from '../../services/lineService';
import { SuccessFeedback, ErrorFeedback } from '../general/Feedback';
import { extractApiErrorMessage } from '../../utils/apiError';
import LineEditDialog from './LineEditDialog';

interface LineListItem {
  id: string;
  name: string;
  idCompany: string;
  companyName?: string | null;
  description?: string | null;
}

const toListItem = (l: ApiLine): LineListItem => ({
  id: l.id,
  name: l.name,
  idCompany: l.idCompany,
  companyName: l.company?.name ?? null,
  description: l.description ?? null,
});

const LineSearchPanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [lines, setLines] = useState<LineListItem[]>([]);
  const [selected, setSelected] = useState<LineListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await lineService.getAllLines();
        if (!mounted) return;
        const mapped = data.map(toListItem);
        setLines(mapped);
        setSelected(mapped[0] || null);
      } catch (err: any) {
        if (!mounted) return;
        setErrorOpen(extractApiErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return lines;
    return lines.filter(l =>
      [l.name].some(v => v?.toLowerCase().includes(q))
    );
  }, [query, lines]);

  return (
    <Box>
      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <TextField
              fullWidth
              placeholder="buscador"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={5} sx={{ display: 'flex', minHeight: 0 }}>
          <Paper sx={{ p: 2, height: '100%', width: '100%', overflow: 'hidden' }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>LISTA DE ÁREAS/ROLES</Typography>
            <Box sx={{ maxHeight: { xs: 180, md: 320 }, overflowY: 'auto', pr: 1 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress />
                </Box>
              ) : filtered.length === 0 ? (
                <Typography color="text.secondary">Sin resultados</Typography>
              ) : (
                filtered.map(l => (
                  <Box
                    key={l.id}
                    sx={{ py: 1, borderBottom: '1px solid #eee', cursor: 'pointer', bgcolor: selected?.id === l.id ? 'action.hover' : 'transparent' }}
                    onClick={() => setSelected(l)}
                  >
                    <Typography>{l.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{l.companyName || '—'}</Typography>
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7} sx={{ display: 'flex', minHeight: 0 }}>
          <Paper sx={{ p: 2, height: '100%', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', flexGrow: 1, minHeight: 0 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>DATOS DE ÁREA/ROL SELECCIONADO</Typography>
              {!selected ? (
                <Typography color="text.secondary">Selecciona un área/rol para ver sus datos</Typography>
              ) : (
                <Box>
                  <Typography><strong>Nombre:</strong> {selected.name}</Typography>
                  <Typography><strong>Descripción:</strong> {selected.description || '—'}</Typography>
                </Box>
              )}
              <Stack direction="row" spacing={1.5} sx={{ mt: 'auto', alignSelf: 'flex-end' }}>
                <Tooltip title="Editar">
                  <Button
                    variant="outlined"
                    color="primary"
                    aria-label="editar área/rol"
                    sx={{ width: 44, height: 44, minWidth: 44, p: 0, borderRadius: 1 }}
                    onClick={() => setEditOpen(true)}
                  >
                    <EditIcon />
                  </Button>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <Button
                    variant="outlined"
                    color="error"
                    aria-label="eliminar área/rol"
                    sx={{ width: 44, height: 44, minWidth: 44, p: 0, borderRadius: 1 }}
                    disabled={deleting || !selected}
                    onClick={async () => {
                      if (!selected) return;
                      setDeleting(true);
                      try {
                        await lineService.deleteLine(selected.id);
                        setSuccessOpen(true);
                        setLines(prev => prev.filter(l => l.id !== selected.id));
                        setSelected(null);
                      } catch (err: any) {
                        setErrorOpen(extractApiErrorMessage(err));
                      } finally {
                        setDeleting(false);
                      }
                    }}
                  >
                    <DeleteIcon />
                  </Button>
                </Tooltip>
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog edición línea */}
      <LineEditDialog
        open={editOpen}
        line={selected as any}
        onClose={() => setEditOpen(false)}
        onUpdated={(updated) => {
          setLines(prev => prev.map(l => (l.id === updated.id ? { ...l, name: updated.name, companyName: (updated as any).company?.name ?? l.companyName, description: updated.description ?? l.description } : l)));
          if (selected && selected.id === updated.id) {
            setSelected({ ...selected, name: updated.name, companyName: (updated as any).company?.name ?? selected.companyName, description: updated.description ?? selected.description });
          }
        }}
      />

      {/* Feedback de éxito y error */}
      <SuccessFeedback 
        open={successOpen} 
        message="Área/rol eliminado exitosamente" 
        onClose={() => setSuccessOpen(false)} 
      />
      <ErrorFeedback 
        open={!!errorOpen} 
        message={errorOpen || ''} 
        onClose={() => setErrorOpen(null)} 
      />
    </Box>
  );
};

export default LineSearchPanel;
