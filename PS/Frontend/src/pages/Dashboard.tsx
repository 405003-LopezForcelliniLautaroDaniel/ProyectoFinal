import React, { useEffect, useState, useMemo } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { chatService, ApiChat, DashboardChatResult, DashboardChatForLineResult, DashboardChatForUserResult, DashboardChatTakenResult, DashboardChatNewResult } from '../services/chatService';
import { calendarService, CalendarEvent, DashboardNoteResult } from '../services/calendarService';
import { userService, GetAllUsersResponse } from '../services/userService';
import { lineService, ApiLine } from '../services/lineService';

interface ChatWithUser extends ApiChat {
  idUser?: string | null;
  createdAt?: string;
}

interface ChatStats {
  date: string;
  chats: number;
}

interface LineChatStats {
  name: string;
  value: number;
}

interface NotesStats {
  total: number;
  withClient: number;
  withoutClient: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<ChatWithUser[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [users, setUsers] = useState<GetAllUsersResponse | null>(null);
  const [lines, setLines] = useState<ApiLine[]>([]);
  const [chatsWithMessages, setChatsWithMessages] = useState<Map<string, { firstMessageDate: string; userId: string | null }>>(new Map());
  const [dashboardChatStats, setDashboardChatStats] = useState<DashboardChatResult | null>(null);
  const [dashboardChatForLine, setDashboardChatForLine] = useState<DashboardChatForLineResult | null>(null);
  const [dashboardChatForUser, setDashboardChatForUser] = useState<DashboardChatForUserResult | null>(null);
  const [dashboardChatTaken, setDashboardChatTaken] = useState<DashboardChatTakenResult | null>(null);
  const [dashboardChatNew, setDashboardChatNew] = useState<DashboardChatNewResult | null>(null);
  const [dashboardNotes, setDashboardNotes] = useState<DashboardNoteResult | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [chatsData, eventsData, usersData, linesData, dashboardStats, dashboardChatForLineData, dashboardChatForUserData, dashboardChatTakenData, dashboardChatNewData, dashboardNotesData] = await Promise.all([
          chatService.getAllChats(),
          calendarService.getAllEvents(),
          userService.getAllUsers(),
          lineService.getAllLines(),
          chatService.getDashboardChatStats(),
          chatService.getDashboardChatForLine(),
          chatService.getDashboardChatForUser(),
          chatService.getDashboardChatTaken(),
          chatService.getDashboardChatNew(),
          calendarService.getDashboardNotes(),
        ]);

        setChats(chatsData as ChatWithUser[]);
        setEvents(eventsData);
        setUsers(usersData);
        setLines(linesData);
        setDashboardChatStats(dashboardStats);
        setDashboardChatForLine(dashboardChatForLineData);
        setDashboardChatForUser(dashboardChatForUserData);
        setDashboardChatTaken(dashboardChatTakenData);
        setDashboardChatNew(dashboardChatNewData);
        setDashboardNotes(dashboardNotesData);

        // Obtener información de mensajes para algunos chats (muestra representativa)
        // Obtenemos mensajes de chats pendientes y tomados para estadísticas
        const pendingChats = chatsData.filter(c => c.status === 'pending');
        const takenChats = chatsData.filter(c => c.status === 'taken');
        
        // Limitar a 30 chats en total para no sobrecargar (15 pendientes + 15 tomados)
        const pendingSample = pendingChats.slice(0, Math.min(15, pendingChats.length));
        const takenSample = takenChats.slice(0, Math.min(15, takenChats.length));
        const sampleChats = [...pendingSample, ...takenSample];
        
        const messagePromises = sampleChats.map(async (chat) => {
          try {
            const messages = await chatService.getChatById(chat.id);
            if (messages.length > 0) {
              // Ordenar mensajes por fecha para obtener el primero
              const sortedMessages = [...messages].sort((a, b) => 
                new Date(a.time).getTime() - new Date(b.time).getTime()
              );
              const firstMessage = sortedMessages[0];
              return {
                chatId: chat.id,
                firstMessageDate: firstMessage.time,
                userId: firstMessage.idUser,
              };
            }
            return null;
          } catch (error) {
            return null;
          }
        });

        const messagesData = await Promise.all(messagePromises);
        const messagesMap = new Map<string, { firstMessageDate: string; userId: string | null }>();
        
        messagesData.forEach(data => {
          if (data) {
            messagesMap.set(data.chatId, {
              firstMessageDate: data.firstMessageDate,
              userId: data.userId,
            });
          }
        });

        setChatsWithMessages(messagesMap);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Obtener información de usuarios y líneas para cada chat
  const chatsWithUserInfo = useMemo(() => {
    if (!chats.length || !users || !lines.length) return [];

    return chats.map(chat => {
      // Intentar obtener el usuario del chat desde los mensajes
      // Por ahora, usaremos una aproximación: si el chat está "taken", buscar el usuario
      // Esto requeriría obtener los mensajes de cada chat, lo cual es costoso
      // Por simplicidad, asignaremos chats a líneas de forma aleatoria o basada en algún criterio
      return chat;
    });
  }, [chats, users, lines]);

  // Gráfico 1: Chats entrantes en los últimos 7 días
  const chatsLast7Days = useMemo(() => {
    // Si tenemos datos del backend, usarlos directamente
    // Manejar tanto camelCase como PascalCase (axios puede convertir)
    const dayLabels = dashboardChatStats?.day || dashboardChatStats?.Day || [];
    const totalsRaw = dashboardChatStats?.total || dashboardChatStats?.Total || [];
    
    // Convertir totals a array si viene como objeto con índices numéricos (axios puede convertir arrays a objetos)
    let totals: number[] = [];
    if (Array.isArray(totalsRaw)) {
      totals = totalsRaw;
    } else if (totalsRaw && typeof totalsRaw === 'object') {
      // Si es un objeto, convertir a array usando los índices numéricos
      totals = Object.keys(totalsRaw)
        .filter(key => !isNaN(Number(key)))
        .sort((a, b) => Number(a) - Number(b))
        .map(key => {
          const value = totalsRaw[Number(key)];
          return typeof value === 'number' ? value : Number(value) || 0;
        });
    }
    
    if (dashboardChatStats && dayLabels.length > 0 && totals.length > 0) {
      return dayLabels.map((day, index) => {
        // Formatear la fecha para mostrar día y mes (sin año)
        let formattedDate = day;
        if (typeof day === 'string') {
          // Manejar formato ISO "YYYY-MM-DD"
          if (day.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Parsear manualmente para evitar problemas de zona horaria
            const [year, month, dayOfMonth] = day.split('-').map(Number);
            const date = new Date(year, month - 1, dayOfMonth);
            formattedDate = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
          } else {
            // Si viene en formato "DD/MM/YYYY" o "DD-MM-YYYY"
            const parts = day.split(/[\/\-]/);
            if (parts.length === 3) {
              formattedDate = `${parts[0]}/${parts[1]}`; // DD/MM
            } else {
              // Intentar parsear como fecha ISO u otro formato
              const date = new Date(day + 'T00:00:00');
              if (!isNaN(date.getTime())) {
                formattedDate = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
              }
            }
          }
        }
        return {
          fecha: formattedDate,
          fechaOriginal: day, // Guardar la fecha original para el tooltip
          chats: totals[index] ?? 0,
        };
      });
    }

    // Fallback: calcular desde los datos locales si no hay datos del backend
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Inicializar días de los últimos 7 días
    const days: ChatStats[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({ date: dateStr, chats: 0 });
    }

    // Contar chats por día usando la información de mensajes cuando esté disponible
    chats.forEach(chat => {
      const messageInfo = chatsWithMessages.get(chat.id);
      let chatDate: Date;
      
      if (messageInfo && messageInfo.firstMessageDate) {
        chatDate = new Date(messageInfo.firstMessageDate);
      } else {
        // Si no tenemos fecha del mensaje, distribuir equitativamente entre los últimos 7 días
        // basado en el índice del chat para mantener consistencia
        const chatIndex = chats.indexOf(chat);
        const daysAgo = chatIndex % 7;
        chatDate = new Date(today);
        chatDate.setDate(chatDate.getDate() - daysAgo);
      }
      
      chatDate.setHours(0, 0, 0, 0);
      const chatDateStr = chatDate.toISOString().split('T')[0];
      
      const dayIndex = days.findIndex(d => d.date === chatDateStr);
      if (dayIndex !== -1 && chat.status === 'pending') {
        days[dayIndex].chats += 1;
      }
    });

    // Si no hay datos suficientes, distribuir los chats pendientes
    const totalPending = chats.filter(c => c.status === 'pending').length;
    const totalCounted = days.reduce((sum, d) => sum + d.chats, 0);
    
    if (totalCounted === 0 && totalPending > 0) {
      // Distribuir equitativamente
      const chatsPerDay = Math.ceil(totalPending / 7);
      days.forEach((day, index) => {
        const startIdx = index * chatsPerDay;
        const endIdx = Math.min(startIdx + chatsPerDay, totalPending);
        day.chats = Math.max(0, endIdx - startIdx);
      });
    }

    return days.map(day => ({
      fecha: new Date(day.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      fechaOriginal: day.date,
      chats: day.chats,
    }));
  }, [dashboardChatStats, chats, chatsWithMessages]);

  // Gráfico 2: Chats por línea (gráfico tipo rosca)
  const chatsByLine = useMemo(() => {
    // Si tenemos datos del backend, usarlos directamente
    const lineNames = dashboardChatForLine?.Line || dashboardChatForLine?.line || [];
    const totals = dashboardChatForLine?.Total || dashboardChatForLine?.total || [];
    
    if (lineNames.length > 0 && totals.length > 0) {
      return lineNames.map((lineName, index) => ({
        name: lineName,
        value: totals[index] || 0,
      })).filter(item => item.value > 0);
    }

    // Fallback: calcular desde los datos locales si no hay datos del backend
    if (!chats.length || !lines.length || !users) return [];

    // Crear un mapa de usuario a líneas
    const userLinesMap = new Map<string, string[]>();
    users.user.forEach(userWithLines => {
      const userId = userWithLines.user.id;
      const userLineIds = userWithLines.lines.map(l => l.id);
      userLinesMap.set(userId, userLineIds);
    });

    // Contar chats por línea usando información de mensajes cuando esté disponible
    const lineCounts = new Map<string, number>();
    
    lines.forEach(line => {
      lineCounts.set(line.id, 0);
    });

    // Contar chats tomados
    const takenChats = chats.filter(c => c.status === 'taken');
    
    takenChats.forEach(chat => {
      const messageInfo = chatsWithMessages.get(chat.id);
      let assignedLines: string[] = [];
      
      if (messageInfo && messageInfo.userId) {
        // Obtener líneas del usuario que tiene el chat
        assignedLines = userLinesMap.get(messageInfo.userId) || [];
      }
      
      if (assignedLines.length > 0) {
        // Asignar el chat a la primera línea del usuario
        const lineId = assignedLines[0];
        lineCounts.set(lineId, (lineCounts.get(lineId) || 0) + 1);
      } else {
        // Si no tenemos información del usuario, distribuir equitativamente
        const lineIndex = takenChats.indexOf(chat) % lines.length;
        const lineId = lines[lineIndex].id;
        lineCounts.set(lineId, (lineCounts.get(lineId) || 0) + 1);
      }
    });

    return Array.from(lineCounts.entries())
      .map(([lineId, count]) => {
        const line = lines.find(l => l.id === lineId);
        return {
          name: line?.name || 'Sin línea',
          value: count,
        };
      })
      .filter(item => item.value > 0);
  }, [dashboardChatForLine, chats, lines, users, chatsWithMessages]);

  // Gráfico 3 y 4: Estadísticas de notas
  const notesStats = useMemo(() => {
    // Si tenemos datos del backend, usarlos directamente
    // note = notas sueltas (sin cliente)
    // noteForClient = notas con cliente asociado
    const withoutClient = dashboardNotes?.Note || dashboardNotes?.note || 0;
    const withClient = dashboardNotes?.NoteForClient || dashboardNotes?.noteForClient || 0;
    const total = withoutClient + withClient;

    // Si no hay datos del backend, calcular desde los datos locales
    if (total === 0 && !dashboardNotes) {
      const localTotal = events.length;
      const localWithClient = events.filter(e => e.idClient).length;
      const localWithoutClient = localTotal - localWithClient;

      return {
        total: localTotal,
        withClient: localWithClient,
        withoutClient: localWithoutClient,
      };
    }

    return {
      total,
      withClient,
      withoutClient,
    };
  }, [dashboardNotes, events]);

  const notesChartData = useMemo(() => {
    return [
      { name: 'Con usuario asociado', value: notesStats.withClient },
      { name: 'Notas sueltas', value: notesStats.withoutClient },
    ];
  }, [notesStats]);

  // Gráfico 4: Chats por usuario
  const chatsByUser = useMemo(() => {
    const userNames = dashboardChatForUser?.User || dashboardChatForUser?.user || [];
    const totals = dashboardChatForUser?.Total || dashboardChatForUser?.total || [];
    
    if (userNames.length === 0 || totals.length === 0) {
      return [];
    }

    const allUsersData = userNames.map((userName, index) => ({
      name: userName,
      chats: totals[index] || 0,
    }));

    // Si se selecciona un usuario específico, filtrar
    if (selectedUser !== 'all') {
      return allUsersData.filter(user => user.name === selectedUser);
    }

    return allUsersData;
  }, [dashboardChatForUser, selectedUser]);

  const availableUsers = useMemo(() => {
    const userNames = dashboardChatForUser?.User || dashboardChatForUser?.user || [];
    return userNames;
  }, [dashboardChatForUser]);

  // Gráfico 5: Chats abiertos por usuario
  const chatsTakenByUser = useMemo(() => {
    const userNames = dashboardChatTaken?.User || dashboardChatTaken?.user || [];
    const totals = dashboardChatTaken?.Total || dashboardChatTaken?.total || [];
    
    if (userNames.length === 0 || totals.length === 0) {
      return [];
    }

    return userNames.map((userName, index) => ({
      name: userName,
      chats: totals[index] || 0,
    }));
  }, [dashboardChatTaken]);

  // Gráfico 6: Chats nuevos por día
  const chatsNewByDay = useMemo(() => {
    const dayLabels = dashboardChatNew?.Day || dashboardChatNew?.day || [];
    const totalsRaw = dashboardChatNew?.Total || dashboardChatNew?.total || [];
    
    // Convertir totals a array si viene como objeto con índices numéricos
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
        // Formatear la fecha para mostrar día y mes (sin año)
        let formattedDate = day;
        if (typeof day === 'string') {
          // Manejar formato ISO "YYYY-MM-DD"
          if (day.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Parsear manualmente para evitar problemas de zona horaria
            const [year, month, dayOfMonth] = day.split('-').map(Number);
            const date = new Date(year, month - 1, dayOfMonth);
            formattedDate = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
          } else {
            // Si viene en formato "DD/MM/YYYY" o "DD-MM-YYYY"
            const parts = day.split(/[\/\-]/);
            if (parts.length === 3) {
              formattedDate = `${parts[0]}/${parts[1]}`; // DD/MM
            } else {
              // Intentar parsear como fecha ISO u otro formato
              const date = new Date(day + 'T00:00:00');
              if (!isNaN(date.getTime())) {
                formattedDate = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
              }
            }
          }
        }
        return {
          fecha: formattedDate,
          fechaOriginal: day,
          chats: totals[index] ?? 0,
        };
      });
    }

    return [];
  }, [dashboardChatNew]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 2, pb: 4 }}>
        <Container maxWidth="xl">
          <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            Dashboard Administrador
          </Typography>

          <Grid container spacing={3}>
          {/* Gráfico 1: Chats entrantes últimos 7 días */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Chats iniciados (Últimos 7 Días)
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                  Total: {chatsLast7Days.reduce((sum, item) => sum + item.chats, 0)} chats
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chatsLast7Days}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="fecha"
                    />
                    <YAxis 
                      allowDecimals={false}
                      domain={[0, 'auto']}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value} chats`, 'Chats']}
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0 && payload[0].payload) {
                          const dataPoint = payload[0].payload;
                          if (dataPoint.fechaOriginal) {
                            const date = new Date(dataPoint.fechaOriginal);
                            if (!isNaN(date.getTime())) {
                              return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
                            }
                          }
                        }
                        return label;
                      }}
                    />
                    <Line type="monotone" dataKey="chats" stroke="#1976d2" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Gráfico 2: Chats por línea (rosca) */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Chats por Area/Rol
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                  Total: {chatsByLine.reduce((sum, item) => sum + item.value, 0)} chats
                </Typography>
                {chatsByLine.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chatsByLine}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chatsByLine.map((entry, index) => (
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

          {/* Gráfico 3: Distribución de Notas */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Distribución de Notas
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                  Total: {notesStats.total} notas
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={notesChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {notesChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#00C49F' : '#FF8042'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string, props: any) => [
                        `${value} notas`,
                        props.payload.name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Gráfico 4: Chats por Usuario */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Chats por Usuario
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Filtrar</InputLabel>
                    <Select
                      value={selectedUser}
                      label="Filtrar"
                      onChange={(e) => setSelectedUser(e.target.value)}
                    >
                      <MenuItem value="all">Todos</MenuItem>
                      {availableUsers.map((userName) => (
                        <MenuItem key={userName} value={userName}>
                          {userName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                  Total: {chatsByUser.reduce((sum, item) => sum + item.chats, 0)} chats
                </Typography>
                {chatsByUser.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chatsByUser}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="chats"
                      >
                        {chatsByUser.map((entry, index) => (
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

          {/* Gráfico 5: Conversaciones Actuales por Usuario */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Conversaciones Actuales por Usuario
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                  Total: {chatsTakenByUser.reduce((sum, item) => sum + item.chats, 0)} conversaciones
                </Typography>
                {chatsTakenByUser.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chatsTakenByUser}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="chats"
                      >
                        {chatsTakenByUser.map((entry, index) => (
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

          {/* Gráfico 6: Chats Nuevos por Día */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Chats Nuevos por Día
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                  Total: {chatsNewByDay.reduce((sum, item) => sum + item.chats, 0)} chats nuevos
                </Typography>
                {chatsNewByDay.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chatsNewByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="fecha"
                      />
                      <YAxis 
                        allowDecimals={false}
                        domain={[0, 'auto']}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value} chats`, 'Chats']}
                        labelFormatter={(label, payload) => {
                          if (payload && payload.length > 0 && payload[0].payload) {
                            const dataPoint = payload[0].payload;
                            if (dataPoint.fechaOriginal) {
                              const date = new Date(dataPoint.fechaOriginal);
                              if (!isNaN(date.getTime())) {
                                return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
                              }
                            }
                          }
                          return label;
                        }}
                      />
                      <Line type="monotone" dataKey="chats" stroke="#FF8042" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                    <Typography color="text.secondary">No hay datos disponibles</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        </Container>
    </Box>
  );
};

export default Dashboard;

