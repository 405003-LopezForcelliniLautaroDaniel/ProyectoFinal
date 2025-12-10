import React from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Menu, 
  MenuItem, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  CircularProgress,
  Divider,
  Chip,
  TextField
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EventNoteIcon from '@mui/icons-material/EventNote';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useChat } from '../../contexts/ChatContext';
import { chatService } from '../../services/chatService';
import calendarService, { CalendarEvent } from '../../services/calendarService';
import { SuccessFeedback, ErrorFeedback } from '../general/Feedback';
import TransferDialog from './TransferDialog';

const ChatHeader: React.FC = () => {
  const { selectedChat, updateChatInList, removeChatFromList, clearSelectedChat } = useChat();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [successMessage, setSuccessMessage] = React.useState<string>('');
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const [transferDialogOpen, setTransferDialogOpen] = React.useState(false);
  const [clientNotesDialogOpen, setClientNotesDialogOpen] = React.useState(false);
  const [clientNotes, setClientNotes] = React.useState<CalendarEvent[]>([]);
  const [loadingNotes, setLoadingNotes] = React.useState(false);
  const [editingNote, setEditingNote] = React.useState<CalendarEvent | null>(null);
  const [editDescription, setEditDescription] = React.useState('');
  const [editTime, setEditTime] = React.useState('');
  const [addingNewNote, setAddingNewNote] = React.useState(false);
  const [newDescription, setNewDescription] = React.useState('');
  const [newTime, setNewTime] = React.useState('');
  const open = Boolean(anchorEl);
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  
  const handleCloseChat = () => {
    handleClose();
    clearSelectedChat();
  };

  const handleArchive = async () => {
    if (!selectedChat) return;
    
    try {
      await chatService.archiveChat(selectedChat.id);
      updateChatInList(selectedChat.id, 'archived');
      setSuccessMessage('Chat archivado exitosamente');
      handleClose();
    } catch (error: any) {
      setErrorMessage(error.message || 'No se pudo archivar el chat');
    }
  };

  const handleOpenTransfer = () => {
    handleClose();
    setTransferDialogOpen(true);
  };

  const handleTransfer = async (userId: string, userName: string) => {
    if (!selectedChat) return;
    
    try {
      await chatService.transferChat(selectedChat.id, userId);
      setSuccessMessage(`Chat transferido exitosamente a ${userName}`);
      setTransferDialogOpen(false);
      
      removeChatFromList(selectedChat.id);
    } catch (error: any) {
      setErrorMessage(error.message || 'No se pudo transferir el chat');
      setTransferDialogOpen(false);
    }
  };

  const getClientId = () => {
    if (!selectedChat) return null;
    const clientMessage = selectedChat.messages.find(m => m.idClient !== null);
    return clientMessage?.idClient || null;
  };

  const loadClientNotes = async () => {
    const idClient = getClientId();
    
    if (!idClient) {
      setErrorMessage('No se pudo obtener el ID del cliente');
      return;
    }
    
    setLoadingNotes(true);
    
    try {
      const notes = await calendarService.getEventsByClient(idClient);
      setClientNotes(notes);
    } catch (error: any) {
      setErrorMessage(error.message || 'No se pudieron cargar las notas');
      setClientNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleOpenClientNotes = async () => {
    if (!selectedChat) return;
    setClientNotesDialogOpen(true);
    await loadClientNotes();
  };

  const handleCloseClientNotes = () => {
    setClientNotesDialogOpen(false);
    setEditingNote(null);
    setAddingNewNote(false);
    setNewDescription('');
    setNewTime('');
  };

  const handleStartEdit = (note: CalendarEvent) => {
    setEditingNote(note);
    setEditDescription(note.description);
    setEditTime(new Date(note.time).toISOString().slice(0, 16));
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditDescription('');
    setEditTime('');
  };

  const handleSaveEdit = async () => {
    if (!editingNote) return;
    
    try {
      await calendarService.updateEvent(editingNote.id, {
        description: editDescription,
        time: editTime,
      });
      
      setSuccessMessage('Nota actualizada exitosamente');
      handleCancelEdit();
      await loadClientNotes();
    } catch (error: any) {
      setErrorMessage(error.message || 'No se pudo actualizar la nota');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await calendarService.deleteEvent(noteId);
      setSuccessMessage('Nota eliminada exitosamente');
      await loadClientNotes();
    } catch (error: any) {
      setErrorMessage(error.message || 'No se pudo eliminar la nota');
    }
  };

  const handleStartAddNew = () => {
    setAddingNewNote(true);
    const now = new Date();
    setNewTime(now.toISOString().slice(0, 16));
  };

  const handleCancelAddNew = () => {
    setAddingNewNote(false);
    setNewDescription('');
    setNewTime('');
  };

  const handleSaveNewNote = async () => {
    const idClient = getClientId();
    
    if (!idClient) {
      setErrorMessage('No se pudo obtener el ID del cliente');
      return;
    }
    
    if (!newDescription.trim() || !newTime) {
      setErrorMessage('Por favor complete todos los campos');
      return;
    }
    
    try {
      const isoDateTime = new Date(newTime).toISOString();
      
      await calendarService.createEvent({
        description: newDescription.trim(),
        time: isoDateTime,
        idClient: idClient,
      });
      
      setSuccessMessage('Nota creada exitosamente');
      handleCancelAddNew();
      await loadClientNotes();
    } catch (error: any) {
      setErrorMessage(error.message || 'No se pudo crear la nota');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isPast = date < now;
    
    const formatted = date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    return { formatted, isPast };
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      minHeight: '60px',
      flexShrink: 0,
      borderBottom: '1px solid',
      borderColor: 'divider',
      pb: 1
    }}>
      <Box>
        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
          {selectedChat?.nameClient || 'Selecciona un chat'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
          {selectedChat?.phoneClient || '—'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton 
          onClick={handleOpenClientNotes} 
          size="small" 
          disabled={!selectedChat}
          color="primary"
        >
          <EventNoteIcon />
        </IconButton>
        <IconButton onClick={handleMenu} size="small" disabled={!selectedChat}>
          <MoreVertIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem onClick={handleArchive}>Archivar</MenuItem>
          <MenuItem onClick={handleOpenTransfer}>Transferir</MenuItem>
          <MenuItem onClick={handleCloseChat}>Cerrar</MenuItem>
        </Menu>
      </Box>
      
      <TransferDialog
        open={transferDialogOpen}
        onClose={() => setTransferDialogOpen(false)}
        onTransfer={handleTransfer}
      />

      {/* Diálogo para ver/editar/agregar notas del cliente */}
      <Dialog 
        open={clientNotesDialogOpen} 
        onClose={handleCloseClientNotes}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventNoteIcon color="primary" />
              <Typography variant="h6">
                Notas de {selectedChat?.nameClient || 'Cliente'}
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="small"
              onClick={handleStartAddNew}
              disabled={addingNewNote || editingNote !== null}
            >
              + Agregar Nota
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Formulario para agregar nueva nota */}
          {addingNewNote && (
            <Box sx={{ mb: 3, p: 2, border: '2px solid', borderColor: 'primary.main', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Nueva Nota
              </Typography>
              <TextField
                fullWidth
                label="Descripción"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                multiline
                rows={3}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Fecha y Hora"
                type="datetime-local"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
                <Button onClick={handleCancelAddNew} size="small">
                  Cancelar
                </Button>
                <Button onClick={handleSaveNewNote} variant="contained" size="small">
                  Guardar
                </Button>
              </Box>
            </Box>
          )}

          {loadingNotes ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : clientNotes.length > 0 ? (
            <List>
              {clientNotes.map((note, index) => {
                const { formatted, isPast } = formatDate(note.time);
                const isEditing = editingNote?.id === note.id;
                
                return (
                  <React.Fragment key={note.id}>
                    {index > 0 && <Divider />}
                    <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2 }}>
                      {isEditing ? (
                        // Modo edición
                        <Box sx={{ width: '100%' }}>
                          <TextField
                            fullWidth
                            label="Descripción"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            multiline
                            rows={3}
                            margin="normal"
                          />
                          <TextField
                            fullWidth
                            label="Fecha y Hora"
                            type="datetime-local"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            margin="normal"
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                          <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
                            <Button onClick={handleCancelEdit} size="small">
                              Cancelar
                            </Button>
                            <Button onClick={handleSaveEdit} variant="contained" size="small">
                              Guardar
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        // Modo vista
                        <>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={isPast ? 'Pasada' : 'Próxima'}
                                size="small"
                                color={isPast ? 'default' : 'success'}
                                variant={isPast ? 'outlined' : 'filled'}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {formatted}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleStartEdit(note)}
                                disabled={editingNote !== null || addingNewNote}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteNote(note.id)}
                                disabled={editingNote !== null || addingNewNote}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                          <ListItemText
                            primary={note.description}
                            primaryTypographyProps={{
                              variant: 'body1',
                              sx: { fontWeight: isPast ? 'normal' : 500 }
                            }}
                          />
                        </>
                      )}
                    </ListItem>
                  </React.Fragment>
                );
              })}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No hay notas registradas para este cliente
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseClientNotes}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
      
      <SuccessFeedback
        open={!!successMessage}
        message={successMessage}
        onClose={() => setSuccessMessage('')}
      />
      
      <ErrorFeedback
        open={!!errorMessage}
        message={errorMessage}
        onClose={() => setErrorMessage('')}
      />
    </Box>
  );
};

export default ChatHeader;



