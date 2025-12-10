import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Typography, TextField, Divider, Paper, Stack, Chip, Container, Popover, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { apiRoutes } from '../../apiRoutes.ts';
import { getToken } from '../Login';
import Nav from '../Nav.tsx';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useLanguage } from '../../Language/LanguageContext';

const ChatSelect = () => {
    const { translations } = useLanguage();
    const [messages, setMessages] = useState([]);
    const [clients, setClients] = useState([]);
    const [chats, setChats] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [connection, setConnection] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null); // Para controlar el Popover
    const [openDialog, setOpenDialog] = useState(false);
    const [newEventDate, setNewEventDate] = useState(new Date());
    const [newEventDescription, setNewEventDescription] = useState('');
    const messagesEndRef = useRef(null);
    const token = getToken();
    const navigate = useNavigate();
    const theme = useTheme();
    const { idClient } = useParams(); // Obtener el idClient de la URL

    const handleClientSelect = (client) => {
        if (client?.id) {
            localStorage.setItem('client', client.id);  // Guarda solo el id del cliente
            navigate(`/chat/telegram/${client.id}`);  // Redirige al componente de chat con el ID del cliente
        } else {
            console.error('Cliente no válido.');
        }
    };

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await fetch(apiRoutes.getClients.url, {
                    method: apiRoutes.getClients.method,
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setClients(data);
                } else {
                    console.error('Error al obtener clientes');
                }
            } catch (error) {
                console.error('Error al obtener clientes:', error);
            }
        };

        fetchClients();
    }, [token]);

//Trae los chats
    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await fetch(apiRoutes.getChats.url, {
                    method: apiRoutes.getClients.method,
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setChats(data);
                } else {
                    console.error('Error al obtener clientes');
                }
            } catch (error) {
                console.error('Error al obtener clientes:', error);
            }
        };

        fetchChats();
    }, [token]);


    // OBTIENE LOS MENSAJE (Obtener los últimos 10 mensajes de un cliente seleccionado o cuando se accede a la ruta -- NO FUNCIONA)
    useEffect(() => {
        if (idClient === '0') {
            // Resetear el chat si se está en la ruta de telegram/0
            setSelectedClient(null);
            setMessages([]);
            localStorage.removeItem('client'); // Limpiar el cliente guardado
        } else if (idClient) {
            // Buscar el cliente por ID
            const client = clients.find((client) => client.id.toString() === idClient);
            if (client) {
                setSelectedClient(client); // Establecer el cliente seleccionado
            }

            const fetchMessages = async () => {
                try {
                    const response = await fetch(`${apiRoutes.getMessageTelegram.url}/${idClient}`, {
                        method: 'GET',
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setMessages(data.slice()); 
                        // setMessages(data.slice(-10)); // Solo los últimos 10 mensajes
                    } else {
                        console.error('Error al obtener mensajes');
                    }
                } catch (error) {
                    console.error('Error al obtener mensajes:', error);
                }
            };

            fetchMessages();
        }
    }, [idClient, clients, token]); // Dependemos de `idClient`, `clients`, y `token`
    
    // Configurar conexión a SignalR
    useEffect(() => {
        const setupSignalRConnection = async () => {
            const newConnection = new HubConnectionBuilder()
                .withUrl(`${apiRoutes.signalR.url}`, {
                    accessTokenFactory: () => token,
                })
                .configureLogging(LogLevel.Information)
                .withAutomaticReconnect()
                .build();

            try {
                await newConnection.start();
                console.log('Conectado a SignalR');
                setConnection(newConnection);
            } catch (error) {
                console.error('Error al conectar con SignalR:', error);
            }
        };

        setupSignalRConnection();

        return () => {
            if (connection) {
                connection.stop();
            }
        };
    }, [token]);

    // Escuchar mensajes entrantes
    useEffect(() => {
        if (connection && selectedClient) {
            const receiveMessageHandler = (message) => {
                // Primero, extraemos el ID del cliente y el contenido del mensaje
                const [clientId, messageContent] = message.split(':').map(part => part.trim());
    
                // Solo agregamos el mensaje si el ID del cliente coincide con el seleccionado
                if (parseInt(clientId) === selectedClient.id) {
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { idClient: clientId, content: messageContent } // Forzamos que siempre sea de cliente
                    ]);
                }
            };
    
            connection.on('ReceiveMessage', receiveMessageHandler);
    
            return () => {
                connection.off('ReceiveMessage', receiveMessageHandler);
            };
        }
    }, [connection, selectedClient]);

    // Enviar mensaje
    const handleSendMessage = async () => {
        if (newMessage.trim() && selectedClient) {
            try {
                // Primero, agregar el mensaje localmente al estado para que se muestre inmediatamente en el chat
                setMessages((prev) => [
                    ...prev,
                    { user: 'Me', content: newMessage } // Agregar el mensaje enviado
                ]);

                // Limpiar el campo de texto
                setNewMessage('');

                // Obtener el token desde el almacenamiento local
                const token = getToken();

                // Enviar el mensaje a la API utilizando fetch
                const response = await fetch(apiRoutes.messageTelegram.url, {
                    method: apiRoutes.messageTelegram.method,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        Message: newMessage,        // Mensaje a enviar
                        IdClient: selectedClient.id // ID del cliente con el que estás chateando
                    })
                });

                // Comprobar si la respuesta fue exitosa
                if (response.ok) {
                    // Puedes manejar la respuesta si es necesario
                    const data = await response.json();
                    console.log('Mensaje enviado:', data);
                } else {
                    console.error('Error al enviar el mensaje');
                }
            } catch (error) {
                console.error('Error al enviar el mensaje:', error);
            }
        }
    };

    // Scroll automático solo en el contenedor del chat, no en toda la página
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            // Buscar el contenedor padre con scroll (el que tiene overflowY: 'auto')
            let scrollContainer = messagesEndRef.current.parentElement;
            
            // Subir en el árbol DOM hasta encontrar el elemento con overflow-y: auto
            while (scrollContainer) {
                const style = window.getComputedStyle(scrollContainer);
                if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
                    break;
                }
                scrollContainer = scrollContainer.parentElement;
            }
            
            // Si encontramos el contenedor con scroll, hacer scroll solo ahí
            if (scrollContainer && messagesEndRef.current) {
                // Calcular la posición del elemento dentro del contenedor
                const elementTop = messagesEndRef.current.offsetTop;
                const elementHeight = messagesEndRef.current.offsetHeight;
                const containerHeight = scrollContainer.clientHeight;
                
                // Hacer scroll hacia abajo para mostrar el último mensaje
                scrollContainer.scrollTo({
                    top: elementTop + elementHeight - containerHeight,
                    behavior: 'smooth'
                });
            }
        }
    };

    // Hacer scroll cuando cambian los mensajes
    useEffect(() => {
        // Esperar un poco para que el DOM se actualice antes de hacer scroll
        setTimeout(() => {
            scrollToBottom();
        }, 100);
    }, [messages]);

    // Hacer scroll cuando se selecciona un cliente nuevo (se abre un chat)
    useEffect(() => {
        if (selectedClient) {
            // Esperar un poco para que el DOM se actualice antes de hacer scroll
            setTimeout(() => {
                scrollToBottom();
            }, 200);
        }
    }, [selectedClient?.id]);

    const handlePopoverOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const openPopover = Boolean(anchorEl);

    const handleShowEventDialog = () => {
        setOpenDialog(true);
        handlePopoverClose(); // Cerrar el popover
    };

    // Agregar evento (nota)
    const handleAddEvent = () => {
        const token = getToken();
        if (selectedClient && newEventDescription) {
            fetch(apiRoutes.newCalendar.url, {
                method: apiRoutes.newCalendar.method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    time: newEventDate.toISOString(),
                    description: newEventDescription,
                    idClient: selectedClient.id, // Añadir idClient
                })
            })
                .then(response => response.json())
                .then(newEvent => {
                    setNewEventDescription('');
                    setNewEventDate(new Date());
                    setOpenDialog(false); // Cerrar el diálogo después de agregar el evento
                })
                .catch(error => console.error('Error adding new event:', error));
        } else {
            console.error('Faltan datos para agregar el evento');
        }
    };

    return (
        <Box style={{ display: 'flex', width: '100%', height: '100vh' }}>
            <Nav />

            <Container sx={{ display: 'flex', flexGrow: 1, padding: 2 }}>
                <Paper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: 2 }}>
                    <Typography variant="h5" gutterBottom>
                        {selectedClient ? `${translations.Conversation.Chating} ${selectedClient.name}` : translations.Conversation.Title}
                    </Typography>
                    <Divider sx={{ marginBottom: 2 }} />

                    <Box sx={{ flexGrow: 1, overflowY: 'auto', padding: 2, borderRadius: 2, backgroundColor: theme.palette.grey[100] }}>
                        {messages.map((msg, idx) => {
                            const isClientMessage = msg.idClient;
                            const messageAlignment = isClientMessage ? 'flex-start' : 'flex-end';
                            const backgroundColor = isClientMessage ? theme.palette.grey[300] : theme.palette.primary.light;

                            return (
                                <Box
                                    key={idx}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: messageAlignment,
                                        marginBottom: 2,
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            padding: 1,
                                            borderRadius: 2,
                                            maxWidth: '60%',
                                            backgroundColor: backgroundColor,
                                        }}
                                    >
                                        {msg.content}
                                    </Typography>
                                </Box>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </Box>

                    <Box sx={{ display: 'flex', marginTop: 2 }}>
                        <TextField
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={translations.Conversation.Message}
                            fullWidth
                            variant="outlined"
                            sx={{ marginRight: 2 }}
                        />

                        {/* Botón para desplegar opciones */}
                        <Button variant="contained" onClick={handlePopoverOpen}>
                            {translations.Conversation.BtnOptions}
                        </Button>

                        {/* Popover con los botones */}
                        <Popover
                            open={openPopover}
                            anchorEl={anchorEl}
                            onClose={handlePopoverClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'center',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'center',
                            }}
                        >
                            <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Button variant="outlined" onClick={handleShowEventDialog}>{translations.Conversation.BtnNote}</Button>
                                <Button variant="outlined">{translations.Conversation.BtnOther}</Button>
                            </Box>
                        </Popover>

                        {/* Botón de enviar mensaje */}
                        <Button variant="contained" onClick={handleSendMessage}>
                            {translations.Conversation.BtnSend}
                        </Button>
                    </Box>
                </Paper>

                {/* Lista de clientes */}
{/* Lista de clientes */}
<Paper elevation={3} sx={{ padding: 2, maxWidth: '300px', overflowY: 'auto', marginRight: 2, height: '100%' }}>
    <Typography variant="h6" gutterBottom>
        {translations.Conversation.Clients}
    </Typography>
    {clients.map((client) => {
        // Encuentra el chat relacionado al cliente
        const chat = chats.find((c) => c.idClient === client.id);

        return (
            <Stack direction="row" spacing={1} key={client.id} sx={{ marginBottom: 1 }}>
                <Button
                    fullWidth
                    variant={selectedClient?.id === client.id ? 'contained' : 'outlined'}
                    onClick={() => handleClientSelect(client)}
                    sx={{ flexGrow: 1 }}
                >
                    {client.name} ({client.contact})
                </Button>
                {chat && (
                    <Chip
                        label={chat.idUser === null ? "" : ""}
                        color={chat.idUser === null ? "success" : "default"}
                        size="small"
                        variant={chat.idUser === null ? "filled" : "outlined"}
                    />
                )}
            </Stack>
        );
    })}
</Paper>

            </Container>

            {/* Dialog para crear la Nota */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Agregar Nota</DialogTitle>
                <DialogContent>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateTimePicker
                            value={newEventDate}
                            onChange={(newValue) => setNewEventDate(newValue)}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider>
                    <TextField
                        value={newEventDescription}
                        onChange={(e) => setNewEventDescription(e.target.value)}
                        label="Descripción"
                        fullWidth
                        multiline
                        rows={4}
                        sx={{ marginTop: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="secondary">Cancelar</Button>
                    <Button onClick={handleAddEvent} color="primary">Guardar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ChatSelect;
