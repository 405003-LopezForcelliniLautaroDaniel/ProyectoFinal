import React, { useEffect, useState, useMemo } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Divider,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { useNavigate } from 'react-router-dom';
import { calendarService, CalendarEvent } from '../services/calendarService';
import { chatService, DashboardChatNewResult, DashboardChatOpenPercentageResult } from '../services/chatService';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatIcon from '@mui/icons-material/Chat';
import EventIcon from '@mui/icons-material/Event';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

const Inicio: React.FC = () => {
  const { user, lines } = useAuth();
  const { allChats, selectChat } = useChat();
  const navigate = useNavigate();
  
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editTime, setEditTime] = useState('');
  const [dashboardChatNew, setDashboardChatNew] = useState<DashboardChatNewResult | null>(null);
  const [dashboardChatOpenPercentage, setDashboardChatOpenPercentage] = useState<DashboardChatOpenPercentageResult | null>(null);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingPercentageChart, setLoadingPercentageChart] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await calendarService.getAllEvents();
        const now = new Date();
        const upcomingEvents = data
          .filter(event => new Date(event.time) >= now)
          .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
          .slice(0, 5);
        setEvents(upcomingEvents);
      } catch (error) {
      } finally {
        setLoadingEvents(false);
      }
    };
    loadEvents();
  }, []);

  useEffect(() => {
    if (!user?.rol) {
      const loadChatNewData = async () => {
        try {
          setLoadingChart(true);
          const data = await chatService.getDashboardChatNew();
          setDashboardChatNew(data);
        } catch (error) {
        } finally {
          setLoadingChart(false);
        }
      };
      loadChatNewData();
    }
  }, [user?.rol]);

  useEffect(() => {
    if (!user?.rol) {
      const loadChatOpenPercentageData = async () => {
        try {
          setLoadingPercentageChart(true);
          const data = await chatService.getDashboardChatOpenPercentage();
          setDashboardChatOpenPercentage(data);
        } catch (error) {
        } finally {
          setLoadingPercentageChart(false);
        }
      };
      loadChatOpenPercentageData();
    }
  }, [user?.rol]);

  const chatOpenPercentageData = useMemo(() => {
    if (!dashboardChatOpenPercentage) return [];
    
    const percentage = dashboardChatOpenPercentage?.Percentage || dashboardChatOpenPercentage?.percentage || 0;
    const remaining = 100 - percentage;
    
    return [
      { name: 'Abiertos', value: percentage },
      { name: 'Resto', value: remaining },
    ];
  }, [dashboardChatOpenPercentage]);

  const chatsNewChartData = useMemo(() => {
    if (!dashboardChatNew) return [];
    
    const dayLabels = dashboardChatNew?.Day || dashboardChatNew?.day || [];
    const totalsRaw = dashboardChatNew?.Total || dashboardChatNew?.total || [];
    
    let totals: number[] = [];
    if (Array.isArray(totalsRaw)) {
      totals = totalsRaw;
    } else if (totalsRaw && typeof totalsRaw === 'object') {
      totals = Object.keys(totalsRaw)
        .filter(key => !isNaN(Number(key)))
        .sort((a, b) => Number(a) - Number(b))
        .map(key => {
          const value = totalsRaw[Number(key)];
          return typeof value === 'number' ? value : Number(value) || 0;
        });
    }
    
    if (dayLabels.length > 0 && totals.length > 0) {
      return dayLabels.map((day, index) => {
        let formattedDate = day;
        if (typeof day === 'string') {
          if (day.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, dayOfMonth] = day.split('-').map(Number);
            const date = new Date(year, month - 1, dayOfMonth);
            formattedDate = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
          } else {
            const parts = day.split(/[\/\-]/);
            if (parts.length === 3) {
              formattedDate = `${parts[0]}/${parts[1]}`;
            } else {
              const date = new Date(day + 'T00:00:00');
              if (!isNaN(date.getTime())) {
                formattedDate = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
              }
            }
          }
        }
        return {
          name: formattedDate,
          value: totals[index] ?? 0,
        };
      }).filter(item => item.value > 0);
    }

    return [];
  }, [dashboardChatNew]);

  const pendingChats = allChats.filter(chat => chat.status === 'pending').slice(0, 5);
  const openChats = allChats.filter(chat => chat.status === 'taken').slice(0, 5);

  const handleChatClick = async (chatId: string, chatName: string, chatContact: string) => {
    await selectChat(chatId, chatName, chatContact);
    navigate('/chats');
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEditDescription(event.description);
    setEditTime(new Date(event.time).toISOString().slice(0, 16));
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedEvent) return;
    
    try {
      await calendarService.updateEvent(selectedEvent.id, {
        description: editDescription,
        time: editTime,
      });
      
      setEvents(events.map(e => 
        e.id === selectedEvent.id 
          ? { ...e, description: editDescription, time: editTime }
          : e
      ));
      
      setEditDialogOpen(false);
      setSelectedEvent(null);
    } catch (error) {
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await calendarService.deleteEvent(eventId);
      setEvents(events.filter(e => e.id !== eventId));
      setEditDialogOpen(false);
    } catch (error) {
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      <Container maxWidth="lg" sx={{ mt: 4, pb: { xs: 4, md: 6 } }}>
        <Grid container spacing={3}>
          {/* Información del Usuario */}
          <Grid item xs={12} md={user?.rol ? 12 : 4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Información del Usuario
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Usuario:</strong> {user?.userName}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Nombre:</strong> {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Email:</strong> {user?.email}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Rol:</strong> {user?.rol ? 'Administrador' : 'Usuario'}
                </Typography>
                {!user?.rol && (
                  <>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Areas/Roles asignadas:</strong>
                    </Typography>
                    {lines.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {lines.map((line) => (
                          <Chip
                            key={line.id}
                            label={line.name}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Sin áreas/roles asignadas
                      </Typography>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Contenido solo para usuarios no administradores */}
          {!user?.rol && (
            <>
              {/* Notas Próximas */}
              <Grid item xs={12} md={8}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6" color="primary">
                        Notas Próximas
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    {loadingEvents ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                      </Box>
                    ) : events.length > 0 ? (
                      <List dense>
                        {events.map((event) => (
                          <ListItem
                            key={event.id}
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              mb: 1,
                              '&:hover': {
                                backgroundColor: 'action.hover',
                              },
                            }}
                            secondaryAction={
                              <Box>
                                <IconButton
                                  edge="end"
                                  size="small"
                                  onClick={() => handleEditEvent(event)}
                                  sx={{ mr: 1 }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  edge="end"
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteEvent(event.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            }
                          >
                            <ListItemText
                              primary={event.description}
                              secondary={
                                <>
                                  <Typography variant="caption" component="span">
                                    {formatDate(event.time)}
                                  </Typography>
                                  {event.client && (
                                    <Typography variant="caption" component="span" sx={{ ml: 2 }}>
                                      • {event.client.name}
                                    </Typography>
                                  )}
                                </>
                              }
                              primaryTypographyProps={{
                                sx: {
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: 'vertical',
                                  wordBreak: 'break-word',
                                }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                        No hay notas próximas
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Chats Pendientes */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ChatIcon sx={{ mr: 1, color: 'warning.main' }} />
                      <Typography variant="h6" color="warning.main">
                        Chats Pendientes
                      </Typography>
                      <Chip
                        label={pendingChats.length}
                        size="small"
                        color="warning"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    {pendingChats.length > 0 ? (
                      <List dense>
                        {pendingChats.map((chat) => (
                          <ListItem
                            key={chat.id}
                            sx={{
                              border: '1px solid',
                              borderColor: 'warning.light',
                              borderRadius: 1,
                              mb: 1,
                              cursor: 'default',
                            }}
                          >
                            <ListItemText
                              primary={chat.nameClient}
                              secondary={chat.contact}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                        No hay chats pendientes
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Chats Abiertos */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ChatIcon sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="h6" color="success.main">
                        Chats Abiertos
                      </Typography>
                      <Chip
                        label={openChats.length}
                        size="small"
                        color="success"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    {openChats.length > 0 ? (
                      <List dense>
                        {openChats.map((chat) => (
                          <ListItemButton
                            key={chat.id}
                            onClick={() => handleChatClick(chat.id, chat.nameClient, chat.contact)}
                            sx={{
                              border: '1px solid',
                              borderColor: 'success.light',
                              borderRadius: 1,
                              mb: 1,
                              '&:hover': {
                                backgroundColor: 'success.lighter',
                              },
                            }}
                          >
                            <ListItemText
                              primary={chat.nameClient}
                              secondary={chat.contact}
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                        No hay chats abiertos
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Gráfico de Chats Nuevos por Día */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Chats Nuevos por Día
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                      Total: {chatsNewChartData.reduce((sum, item) => sum + item.value, 0)} chats nuevos
                    </Typography>
                    {loadingChart ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                        <CircularProgress />
                      </Box>
                    ) : chatsNewChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={chatsNewChartData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {chatsNewChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number, name: string, props: any) => [
                              `${value} chats`,
                              props.payload.name
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                        <Typography color="text.secondary">No hay datos disponibles</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Gráfico de Porcentaje de Chats Abiertos */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Porcentaje de Chats Abiertos
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                      {chatOpenPercentageData.length > 0 ? `${chatOpenPercentageData[0].value.toFixed(1)}% abiertos` : '0% abiertos'}
                    </Typography>
                    {loadingPercentageChart ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                        <CircularProgress />
                      </Box>
                    ) : chatOpenPercentageData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={chatOpenPercentageData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                          >
                            <Cell fill="#1976d2" />
                            <Cell fill="#e0e0e0" />
                          </Pie>
                          <Tooltip 
                            formatter={(value: number, name: string) => [
                              `${value.toFixed(1)}%`,
                              name === 'Abiertos' ? 'Chats abiertos' : 'Resto'
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                        <Typography color="text.secondary">No hay datos disponibles</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      </Container>

      {/* Dialog para editar nota */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Nota</DialogTitle>
        <DialogContent>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inicio;


