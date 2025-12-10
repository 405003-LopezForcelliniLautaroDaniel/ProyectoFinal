import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { QRCodeSVG } from 'qrcode.react';
import { paymentService, PaymentResponse } from '../../services/paymentService';

interface PaymentQRDialogProps {
  open: boolean;
  quantity: number;
  onClose: () => void;
  onPaymentSuccess: (availableAdded: number) => void;
}

const PaymentQRDialog: React.FC<PaymentQRDialogProps> = ({
  open,
  quantity,
  onClose,
  onPaymentSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [paymentApproved, setPaymentApproved] = useState(false);

  // Crear el pago cuando se abre el diálogo
  useEffect(() => {
    if (open && quantity > 0) {
      createPayment();
    }
    return () => {
      // Limpiar estado al cerrar
      if (!open) {
        setPaymentData(null);
        setError(null);
        setPaymentApproved(false);
      }
    };
  }, [open, quantity]);

  useEffect(() => {
    if (!paymentData || paymentApproved) return;

    const interval = setInterval(async () => {
      try {
        const status = await paymentService.checkPaymentStatus(paymentData.paymentId);
        
        if (status.status === 'approved') {
          setPaymentApproved(true);
          clearInterval(interval);
          setTimeout(() => {
            onPaymentSuccess(status.availableAdded || quantity);
            handleClose();
          }, 2000);
        } else if (status.status === 'rejected' || status.status === 'cancelled') {
          setError('El pago fue rechazado o cancelado');
          clearInterval(interval);
        }
      } catch (err) {
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentData, paymentApproved]);

  const createPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentService.createPayment({
        quantity,
        title: `Compra de ${quantity} usuario(s) adicional(es)`,
        description: `Agregar ${quantity} usuario(s) a tu cuenta`,
      });
      setPaymentData(response);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al crear el pago. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (paymentData && !paymentApproved) {
      paymentService.cancelPayment(paymentData.paymentId).catch(() => {});
    }
    onClose();
  };

  const handleCheckStatus = async () => {
    if (!paymentData) return;
    setChecking(true);
    try {
      const status = await paymentService.checkPaymentStatus(paymentData.paymentId);
      if (status.status === 'approved') {
        setPaymentApproved(true);
        setTimeout(() => {
          onPaymentSuccess(status.availableAdded || quantity);
          handleClose();
        }, 2000);
      } else if (status.status === 'rejected' || status.status === 'cancelled') {
        setError('El pago fue rechazado o cancelado');
      } else {
        setError('El pago aún está pendiente. Por favor espera.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al verificar el estado del pago');
    } finally {
      setChecking(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {paymentApproved ? '¡Pago Exitoso!' : 'Pagar con Mercado Pago'}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Generando código QR...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : paymentApproved ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 80 }} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              ¡Pago aprobado!
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Se agregaron {quantity} usuario(s) a tu cuenta
            </Typography>
          </Box>
        ) : paymentData ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
              Escanea el código QR con la app de Mercado Pago para completar el pago
            </Typography>
            
            {/* QR Code */}
            <Box
              sx={{
                p: 2,
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: 2,
                mb: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {paymentData.qrData.startsWith('data:image') ? (
                // Si es una imagen base64, mostrarla directamente
                <img
                  src={paymentData.qrData}
                  alt="QR de pago"
                  style={{ width: 250, height: 250, display: 'block' }}
                />
              ) : (
                // Si es un URL, generar el QR
                <QRCodeSVG
                  value={paymentData.qrData}
                  size={250}
                  level="H"
                  includeMargin={true}
                />
              )}
            </Box>

            <Typography variant="h6" sx={{ mb: 1 }}>
              Total: ${paymentData.amount.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {quantity} usuario(s) adicional(es)
            </Typography>

            <Alert severity="info" sx={{ width: '100%' }}>
              El sistema verificará automáticamente cuando se complete el pago
            </Alert>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions>
        {!paymentApproved && (
          <>
            <Button onClick={handleClose} disabled={checking}>
              Cancelar
            </Button>
            {paymentData && !loading && (
              <Button
                onClick={handleCheckStatus}
                variant="outlined"
                disabled={checking}
              >
                {checking ? <CircularProgress size={20} /> : 'Verificar Pago'}
              </Button>
            )}
            {error && (
              <Button onClick={createPayment} variant="contained" color="primary">
                Reintentar
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PaymentQRDialog;

