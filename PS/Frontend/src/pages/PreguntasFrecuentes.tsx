import React from 'react';
import {
  Container,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const PreguntasFrecuentes: React.FC = () => {
  const preguntas = [
    {
      pregunta: '¿Cómo puedo gestionar usuarios y roles?',
      respuesta: 'Los administradores pueden acceder a la sección "Gestionar" desde el menú de navegación. Allí podrás crear, editar y eliminar usuarios y roles según tus permisos.',
    },
    {
      pregunta: '¿Cómo puedo gestionar áreas/roles de comunicacion?',
      respuesta: 'Las áreas de comunicacion pueden ser gestionados desde la sección "Gestionar". Los administradores pueden crear, editar y eliminar áreas/roles según sea necesario. Estas áreas/roles organizan los chats y permiten que los clientes seleccionen el área que necesitan.',
    },
    {
      pregunta: '¿Cómo funciona el sistema de chats?',
      respuesta: 'El sistema de chats te permite comunicarte con los clientes. Los clientes van a seleccionar el área que consideren y entrará al chat. Puedes ver los chats pendientes, tomar chats y responder mensajes. Los chats se organizan por líneas asignadas.',
    },
    {
      pregunta: '¿Cómo uso el calendario?',
      respuesta: 'El calendario te permite crear y gestionar notas y eventos. Puedes crear nuevas notas haciendo clic en una fecha o directamente desde el chat de algun cliente, y ver todas tus notas organizadas por fecha.',
    },
    {
      pregunta: '¿Qué es el Dashboard?',
      respuesta: 'El Dashboard muestra estadísticas y gráficos sobre los chats iniciados, distribución por líneas y notas realizadas. Sirve para mantener un control semanal de ciertas acciones. Solo está disponible para administradores.',
    },
    {
      pregunta: '¿Cómo puedo cambiar mi contraseña?',
      respuesta: 'Para cambiar tu contraseña, deberá hacerlo un nivel administrador. Contacta al administrador del sistema para realizar este cambio.',
    },
  ];

  return (
    <Box sx={{ pt: 2, pb: 4 }}>
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            Preguntas Frecuentes
          </Typography>

          <Box sx={{ mb: 4 }}>
            {preguntas.map((item, index) => (
              <Accordion key={index} sx={{ mb: 2 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel${index}-content`}
                  id={`panel${index}-header`}
                >
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    {item.pregunta}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" color="text.secondary">
                    {item.respuesta}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>

          <Paper sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom>
              ¿No encuentras lo que buscas?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Si tienes más preguntas o necesitas ayuda adicional, por favor contacta al administrador del sistema o al equipo de soporte técnico.
            </Typography>
          </Paper>
        </Container>
    </Box>
  );
};

export default PreguntasFrecuentes;

