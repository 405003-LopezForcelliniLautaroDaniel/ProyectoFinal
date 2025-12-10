import React, { useEffect, useMemo, useState } from 'react';
import { Box, Grid, Paper, TextField, Typography, CircularProgress, Stack, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { userService, ApiUserWithLines } from '../../services/userService';
import { extractApiErrorMessage } from '../../utils/apiError';
import { SuccessFeedback, ErrorFeedback } from '../general/Feedback';
import UserEditDialog from './UserEditDialog';
import UserLinesDialog from './UserLinesDialog';
import PaymentQRDialog from './PaymentQRDialog';
import { lineService } from '../../services/lineService';

interface UserListItem {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  rol: boolean;
  idCompany: string;
  companyName?: string | null;
  lines: { id: string; name: string }[];
}

const toListItem = (ul: ApiUserWithLines): UserListItem => ({
  id: ul.user.id,
  userName: ul.user.userName,
  firstName: ul.user.firstName,
  lastName: ul.user.lastName,
  email: ul.user.email,
  rol: ul.user.rol,
  idCompany: ul.user.idCompany,
  companyName: ul.user.company?.name ?? null,
  lines: (ul.lines || []).map(l => ({ id: l.id, name: l.name })),
});

const UserSearchPanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [available, setAvailable] = useState(0);
  const [selected, setSelected] = useState<UserListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Operación exitosa');
  const [errorOpen, setErrorOpen] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [linesDialogOpen, setLinesDialogOpen] = useState(false);
  const [addingLine, setAddingLine] = useState(false);
  const [lineSuccessOpen, setLineSuccessOpen] = useState(false);
  const [lineRemoveSuccessOpen, setLineRemoveSuccessOpen] = useState(false);
  const [addMoreDialogOpen, setAddMoreDialogOpen] = useState(false);
  const [paymentQRDialogOpen, setPaymentQRDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await userService.getAllUsers();
        if (!mounted) return;
        setAvailable(data.available);
        const mapped = data.user.map(toListItem);
        setUsers(mapped);
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
    if (!q) return users;
    return users.filter(u =>
      [u.userName, u.firstName, u.lastName, u.email].some(v => v?.toLowerCase().includes(q))
    );
  }, [query, users]);

  const handleProceedToPayment = () => {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      setErrorOpen('Por favor ingresa una cantidad válida');
      return;
    }
    // Cerrar el diálogo de cantidad y abrir el de QR
    setAddMoreDialogOpen(false);
    setPaymentQRDialogOpen(true);
  };

  const handlePaymentSuccess = (availableAdded: number) => {
    // Actualizar el contador de usuarios disponibles
    setAvailable(prev => prev + availableAdded);
    setPaymentQRDialogOpen(false);
    setQuantity('');
    setSuccessMessage(`¡Pago exitoso! Se agregaron ${availableAdded} usuario(s) disponible(s)`);
    setSuccessOpen(true);
  };

  return (
    <Box>
      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                placeholder="buscador"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {available === 0 && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setAddMoreDialogOpen(true)}
                  sx={{ minWidth: 150, whiteSpace: 'nowrap' }}
                >
                  Agregar Más
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5} sx={{ display: 'flex', minHeight: 0 }}>
          <Paper sx={{ p: 2, height: '100%', width: '100%', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">LISTA DE USUARIOS</Typography>
              <Typography variant="caption" color={available === 0 ? 'error' : 'text.secondary'}>
                {available === 0 ? 'Sin usuarios disponibles' : `${available} disponible${available !== 1 ? 's' : ''}`}
              </Typography>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : filtered.length === 0 ? (
              <Typography color="text.secondary">Sin resultados</Typography>
            ) : (
              filtered.map(u => (
                <Box
                  key={u.id}
                  sx={{ py: 1, borderBottom: '1px solid #eee', cursor: 'pointer', bgcolor: selected?.id === u.id ? 'action.hover' : 'transparent' }}
                  onClick={() => setSelected(u)}
                >
                  <Typography>{u.firstName} {u.lastName}</Typography>
                  <Typography variant="caption" color="text.secondary">{u.userName} · {u.email}</Typography>
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={7} sx={{ display: 'flex', minHeight: 0 }}>
          <Paper sx={{ p: 2, height: '100%', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', flexGrow: 1, minHeight: 0 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>DATOS DE USUARIO SELECCIONADO</Typography>
              {!selected ? (
                <Typography color="text.secondary">Selecciona un usuario para ver sus datos</Typography>
              ) : (
                <Box>
                  <Typography><strong>Nombre:</strong> {selected.firstName} {selected.lastName}</Typography>
                  <Typography><strong>UserName:</strong> {selected.userName}</Typography>
                  <Typography><strong>Email:</strong> {selected.email}</Typography>
                  <Typography><strong>Rol:</strong> {selected.rol ? 'Administrador' : 'Usuario'}</Typography> 
                </Box>
              )}
              {/* Caja de líneas del usuario */}
              {selected && (
                <Box sx={{ mt: 2, border: '2px solid #e0e0e0', borderRadius: 1, p: 2, height: { xs: 120, md: 160 }, overflowY: 'auto' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Áreas/Roles del usuario</Typography>
                  {selected.lines && selected.lines.length > 0 ? (
                    selected.lines.map((line, idx) => (
                      <Box key={`${line.id}-${idx}`} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.5, borderBottom: '1px solid #eee' }}>
                        <Typography>{line.name}</Typography>
                        <Tooltip title="Quitar línea">
                          <span>
                            <IconButton
                              size="small"
                              onClick={async () => {
                                if (!selected) return;
                                try {
                                  await lineService.deleteLineFromUser({ IdUser: selected.id, IdLine: line.id });
                                  // Actualizar UI local: quitar la línea por id
                                  setSelected({ ...selected, lines: selected.lines.filter((l) => l.id !== line.id) });
                                  setLineRemoveSuccessOpen(true);
                                } catch (err: any) {
                                  setErrorOpen(extractApiErrorMessage(err));
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    ))
                  ) : (
                    <Typography color="text.secondary">Sin líneas asignadas</Typography>
                  )}
                </Box>
              )}

              <Stack direction="row" spacing={1.5} sx={{ mt: 2, alignSelf: 'flex-end' }}>
                <Tooltip title="Agregar Area/Rol al usuario">
                  <span>
                    <IconButton color="primary" onClick={() => setLinesDialogOpen(true)} disabled={!selected || addingLine} sx={{ border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}>
                      <AddIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Editar">
                  <Button
                    variant="outlined"
                    color="primary"
                    aria-label="editar usuario"
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
                    aria-label="eliminar usuario"
                    sx={{ width: 44, height: 44, minWidth: 44, p: 0, borderRadius: 1 }}
                    disabled={deleting}
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <DeleteIcon />
                  </Button>
                </Tooltip>
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            ¿Estás seguro de que quieres eliminar al usuario {selected?.firstName} {selected?.lastName}? 
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancelar
          </Button>
          <Button 
            onClick={async () => {
              if (!selected) return;
              setDeleting(true);
              try {
                await userService.deleteUser(selected.id);
                setUsers(prev => prev.filter(u => u.id !== selected.id));
                // Incrementar el contador de usuarios disponibles al eliminar uno
                setAvailable(prev => prev + 1);
                setSelected(null);
                setDeleteDialogOpen(false);
                setSuccessMessage('Usuario eliminado exitosamente');
                setSuccessOpen(true);
              } catch (err: any) {
                setErrorOpen(extractApiErrorMessage(err));
              } finally {
                setDeleting(false);
              }
            }}
            color="error"
            disabled={deleting}
            autoFocus
          >
            {deleting ? <CircularProgress size={20} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de edición */}
      <UserEditDialog
        open={editOpen}
        user={selected as any}
        onClose={() => setEditOpen(false)}
        onUpdated={(updated) => {
          // updated es el objeto individual devuelto por el edit
          if (selected) {
            setUsers(prev => prev.map(u => (u.id === selected.id ? {
              ...u,
              firstName: updated.firstName,
              lastName: updated.lastName,
              email: updated.email,
              userName: updated.userName,
            } : u)));
            setSelected({
              ...selected,
              firstName: updated.firstName,
              lastName: updated.lastName,
              email: updated.email,
              userName: updated.userName,
            });
          }
        }}
      />

      {/* Dialog de selección de línea */}
      <UserLinesDialog
        open={linesDialogOpen}
        onClose={() => setLinesDialogOpen(false)}
        onSelect={async (line) => {
          if (!selected) return;
          setAddingLine(true);
          try {
            await lineService.addLineToUser({ IdUser: selected.id, IdLine: line.id });
            setLineSuccessOpen(true);
            setLinesDialogOpen(false);
            // Actualizar UI local: agregar la línea a seleccionado y a la lista principal
            const added = { id: line.id, name: line.name };
            setSelected(prev => prev ? { ...prev, lines: [...(prev.lines || []), added] } : prev);
            setUsers(prev => prev.map(u => u.id === selected.id ? { ...u, lines: [...(u.lines || []), added] } : u));
          } catch (err: any) {
            setErrorOpen(extractApiErrorMessage(err));
          } finally {
            setAddingLine(false);
          }
        }}
      />

      {/* Diálogo para agregar más usuarios */}
      <Dialog
        open={addMoreDialogOpen}
        onClose={() => {
          setAddMoreDialogOpen(false);
          setQuantity('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Agregar Más Usuarios</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Has alcanzado el límite de usuarios disponibles. Ingresa la cantidad de nuevos usuarios que deseas agregar.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            label="Cantidad de usuarios"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputProps={{ min: 1 }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddMoreDialogOpen(false);
              setQuantity('');
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleProceedToPayment}
            variant="contained"
            color="primary"
            disabled={!quantity || parseInt(quantity) <= 0}
          >
            Continuar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de pago con QR */}
      <PaymentQRDialog
        open={paymentQRDialogOpen}
        quantity={parseInt(quantity) || 0}
        onClose={() => {
          setPaymentQRDialogOpen(false);
          setQuantity('');
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Feedback de éxito y error */}
      <SuccessFeedback 
        open={successOpen} 
        message={successMessage} 
        onClose={() => setSuccessOpen(false)} 
      />
      <ErrorFeedback 
        open={!!errorOpen} 
        message={errorOpen || ''} 
        onClose={() => setErrorOpen(null)} 
      />
      <SuccessFeedback 
        open={lineSuccessOpen} 
        message="Línea/Área agregada al usuario" 
        onClose={() => setLineSuccessOpen(false)} 
      />
      <SuccessFeedback 
        open={lineRemoveSuccessOpen} 
        message="Línea/Área quitada del usuario" 
        onClose={() => setLineRemoveSuccessOpen(false)} 
      />
    </Box>
  );
};

export default UserSearchPanel;


