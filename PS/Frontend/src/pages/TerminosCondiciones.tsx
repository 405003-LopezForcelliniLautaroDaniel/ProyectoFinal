import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
} from '@mui/material';

const FECHA_ULTIMA_ACTUALIZACION = '18/11/2025';

const TerminosCondiciones: React.FC = () => {
  return (
    <Box sx={{ pt: 2, pb: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
          Términos y Condiciones
        </Typography>

        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            1. Aceptación de los Términos
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            Al acceder y utilizar este servicio, usted acepta cumplir con estos términos y condiciones. 
            Si no está de acuerdo con alguna parte de estos términos, no debe utilizar el servicio.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
            2. Uso del Servicio
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            El servicio está destinado únicamente para uso autorizado. Usted se compromete a:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <Typography component="li" variant="body1" color="text.secondary" paragraph>
              Utilizar el servicio de manera legal y ética
            </Typography>
            <Typography component="li" variant="body1" color="text.secondary" paragraph>
              Mantener la confidencialidad de sus credenciales de acceso
            </Typography>
            <Typography component="li" variant="body1" color="text.secondary" paragraph>
              No compartir su cuenta con terceros
            </Typography>
            <Typography component="li" variant="body1" color="text.secondary" paragraph>
              No realizar actividades que puedan dañar o comprometer la seguridad del sistema
            </Typography>
          </Box>

          <Typography variant="h6" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
            3. Privacidad y Protección de Datos
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            Nos comprometemos a proteger su privacidad y manejar sus datos personales de acuerdo con 
            las leyes de protección de datos aplicables. Toda la información proporcionada será tratada 
            con confidencialidad y solo se utilizará para los fines autorizados del servicio.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
            4. Responsabilidades del Usuario
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            Usted es responsable de:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <Typography component="li" variant="body1" color="text.secondary" paragraph>
              Mantener la seguridad de su cuenta y contraseña
            </Typography>
            <Typography component="li" variant="body1" color="text.secondary" paragraph>
              Todas las actividades que ocurran bajo su cuenta
            </Typography>
            <Typography component="li" variant="body1" color="text.secondary" paragraph>
              Notificar inmediatamente cualquier uso no autorizado de su cuenta
            </Typography>
          </Box>

          <Typography variant="h6" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
            5. Limitación de Responsabilidad
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            El servicio se proporciona "tal cual" sin garantías de ningún tipo. No nos hacemos responsables 
            por daños directos, indirectos, incidentales o consecuentes que puedan resultar del uso o la 
            imposibilidad de usar el servicio.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
            6. Modificaciones de los Términos
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. 
            Las modificaciones entrarán en vigor inmediatamente después de su publicación. Es su 
            responsabilidad revisar periódicamente estos términos.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
            7. Terminación
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            Nos reservamos el derecho de suspender o terminar su acceso al servicio en cualquier momento, 
            sin previo aviso, por violación de estos términos y condiciones o por cualquier otra razón 
            que consideremos apropiada.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
            8. Contacto
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            Si tiene preguntas sobre estos términos y condiciones, por favor contacte al administrador 
            del sistema o al equipo de soporte técnico.
          </Typography>

          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="body2" color="text.secondary" align="center">
              Última actualización: {FECHA_ULTIMA_ACTUALIZACION}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default TerminosCondiciones;

