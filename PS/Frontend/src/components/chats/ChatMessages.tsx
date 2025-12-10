import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography, IconButton, LinearProgress } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { useChat } from '../../contexts/ChatContext';

// Función auxiliar para formatear el tiempo (segundos a MM:SS)
const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Componente para reproductor de audio con botón play/pause y barra de progreso
const AudioPlayer: React.FC<{ src: string }> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
    };
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', minWidth: '200px' }}>
      <IconButton 
        onClick={handlePlayPause}
        size="small"
        sx={{ 
          color: 'inherit',
          flexShrink: 0,
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            height: 4,
            borderRadius: 2,
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 2,
            }
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.8 }}>
            {formatTime(currentTime)}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.8 }}>
            {formatTime(duration)}
          </Typography>
        </Box>
      </Box>
      <audio ref={audioRef} src={src} preload="metadata" />
    </Box>
  );
};

const ChatMessages: React.FC = () => {
  const { selectedChat } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessagesLengthRef = useRef<number>(0);
  const previousChatIdRef = useRef<string | null>(null);

  // Función auxiliar para hacer scroll solo en el contenedor del chat
  const scrollToBottom = () => {
    if (!messagesEndRef.current) return;
    
    // Buscar el contenedor padre con scroll (el que tiene overflowY: 'auto')
    let scrollContainer: HTMLElement | null = messagesEndRef.current.parentElement;
    
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
  };

  // Auto-scroll solo en el contenedor del chat, no en toda la página
  useEffect(() => {
    const currentChatId = selectedChat?.id || null;
    const currentMessagesLength = selectedChat?.messages?.length || 0;
    
    // Si cambió el chat, hacer scroll hacia abajo para mostrar los últimos mensajes
    if (currentChatId !== previousChatIdRef.current) {
      previousChatIdRef.current = currentChatId;
      previousMessagesLengthRef.current = currentMessagesLength;
      
      // Esperar un poco para que el DOM se actualice antes de hacer scroll
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      return;
    }
    
    // Solo hacer scroll si hay nuevos mensajes (la cantidad aumentó)
    if (currentMessagesLength > previousMessagesLengthRef.current) {
      // Esperar un poco para que el DOM se actualice antes de hacer scroll
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      previousMessagesLengthRef.current = currentMessagesLength;
    }
  }, [selectedChat?.messages, selectedChat?.id]);

  if (!selectedChat) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        minHeight: '200px'
      }}>
        <Typography color="text.secondary">Selecciona un chat para ver los mensajes</Typography>
      </Box>
    );
  }

  const messages = selectedChat.messages || [];

  if (messages.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        minHeight: '200px'
      }}>
        <Typography color="text.secondary">Sin mensajes</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pb: 1 }}>
      {messages.map((m, index) => {
        // Si idUser es null, el mensaje es del cliente (idClient tiene valor)
        const isFromClient = m.idUser === null;
        const isFromMe = !isFromClient; // Es del usuario (agente)
        
        // Usar id si existe, sino generar uno con el índice y timestamp
        const messageKey = m.id || `msg-${index}-${m.time}`;
        
        // Verificar tipo de mensaje
        const isImage = m.idMessageType === 2;
        const isAudio = m.idMessageType === 4;
        const isFile = m.idMessageType === 3;
        const isUrl = m.content?.startsWith('http://') || m.content?.startsWith('https://');
        
        return (
          <Box key={messageKey} sx={{ display: 'flex', justifyContent: isFromMe ? 'flex-end' : 'flex-start' }}>
            <Box sx={{ maxWidth: '70%' }}>
              <Paper sx={{ 
                p: (isImage || isAudio || isFile) ? 1 : 1.5, 
                bgcolor: isFromMe ? 'primary.main' : 'grey.100', 
                color: isFromMe ? 'primary.contrastText' : 'text.primary',
                overflow: 'hidden'
              }}>
                {isImage && isUrl ? (
                  <Box>
                    <img 
                      src={m.content} 
                      alt="Imagen del chat"
                      style={{ 
                        maxWidth: '100%', 
                        height: 'auto',
                        display: 'block'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<span style="padding: 12px; display: block; word-break: break-all;">${m.content}</span>`;
                        }
                      }}
                    />
                  </Box>
                ) : isAudio && isUrl ? (
                  <AudioPlayer src={m.content} />
                ) : isFile && isUrl ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InsertDriveFileIcon sx={{ opacity: 0.8 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <Typography variant="body2" noWrap title={m.content} sx={{ maxWidth: 240 }}>
                        {m.content.split('/').pop() || 'Archivo'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <a href={m.content} download style={{ color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <DownloadIcon sx={{ fontSize: 16, mr: 0.5 }} />
                          Descargar
                        </a>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2">{m.content}</Typography>
                )}
              </Paper>
              <Typography variant="caption" color="text.secondary" sx={{ px: 1, display: 'block', mt: 0.5 }}>
                {new Date(m.time).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          </Box>
        );
      })}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default ChatMessages;



