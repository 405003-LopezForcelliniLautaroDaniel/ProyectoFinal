// import React, { useEffect, useState } from 'react';
// import { Box, Button, TextField, Typography } from '@mui/material';
// import signalRService from '../../Services/signalRService.jsx';
// import { apiRoutes } from '../../apiRoutes.ts';
// import { getToken } from '../Login.jsx';
// import ChatSelect from './Conversation.jsx';
// import { useTheme } from '@mui/material/styles';
// import Nav from '../Nav.tsx';
// import ClientList from '../../Components/ClientList.jsx';
// import { useNavigate } from 'react-router-dom';
// import { useLanguage } from '../../Language/LanguageContext';

// const HomeContent = () => {
//   const { translations } = useLanguage();
//   const [messages, setMessages] = useState([]);
//   const [clients, setClients] = useState([]);
//   const [selectedClient, setSelectedClient] = useState(null);
//   const [messageInput, setMessageInput] = useState(''); // Estado para el campo de entrada
//   const [newMessage, setNewMessage] = useState(''); // Añadir esto si no está ya definido
//   const [hasMoreMessages, setHasMoreMessages] = useState(false);
//   const theme = useTheme()
//   const navigate = useNavigate();
//   useEffect(() => {
//     signalRService.startConnection();

//     signalRService.onReceiveMessage((user, message) => {
//       setMessages(prevMessages => [...prevMessages, { user, message }]);
//     });

//     fetchClients();

//     return () => {
//       signalRService.stopConnection();
//     };
//   }, []);

//   const fetchClients = async () => {
//     try {
//       const token = getToken();
//       const response = await fetch(apiRoutes.getClients.url, {
//         method: apiRoutes.getClients.method,
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       const clientsData = data.map(({ id, name, contact }) => ({
//         id,
//         name,
//         contact,
//       }));

//       setClients(clientsData);
//     } catch (error) {
//       console.error("Error al obtener los clientes:", error);
//     }
//   };

//   const handleClientSelect = (client) => {
//     setSelectedClient(client);
//     setMessages([]);
//     navigate(`/chat/telegram/0`); 
//   };


//   return (
//     <Box style={{ display: 'flex', width: '100%', height: '100vh' }}>
//       {/* Barra lateral (Nav) */}
//       <Nav />

//       {/* Contenido principal */}
//       <Box sx={{ flexGrow: 1, padding: '1rem' }}>
//         {/* <Typography variant="h6" sx={{ marginBottom: '1rem' }}>
//           {selectedClient ? selectedClient.name : 'Selecciona un cliente'}
//         </Typography> */}

//         {/* Chat */}
//         <Box
//           sx={{
//             display: 'flex',
//             height: '80vh',
//             gap: '1rem',
//           }}
//         >
//           {/* Conversación */}
//           <Box
//             sx={{
//               flex: 1,
//               backgroundColor: theme.palette.background.paper,
//               marginBottom: '1rem',
//               borderRadius: '4px',
//               overflowY: 'auto',
//               boxShadow: 2,
//             }}
//           >
//             {selectedClient ? (
//               <ChatSelect
//                 client={selectedClient}
//                 messages={messages}
//                 hasMoreMessages={hasMoreMessages}
//                 setHasMoreMessages={setHasMoreMessages}
//                 setMessages={setMessages}
//               />
//             ) : (
//               <Typography variant="body1">{translations.Chats.Title}</Typography>
//             )}
//           </Box>

//           <Box display="flex" flexDirection="column" marginLeft="1rem">
//             <Button
//               variant="contained"
//               color="primary"
//               onClick={() => {
//                 if (clients.length > 0) {
//                   handleClientSelect(clients[0]); // Puedes cambiar `clients[0]` al cliente deseado.
//                 } else {
//                   console.warn('No hay clientes disponibles.');
//                 }
//               }}
//             >
//               Telegram
//             </Button>
//           </Box>

//         </Box>
//       </Box>
//     </Box>
//   );

// };

// export default HomeContent;
