import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { zonaSchema } from '../../utils/validators';
import zonasService from '../../services/zonas.service';

function AddZonaModal({ 
  open, 
  onClose, 
  onSuccess, 
  initialName = '',
  title = 'Agregar Nueva Zona' 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: yupResolver(zonaSchema),
    defaultValues: {
      nombre: initialName,
      descripcion: '',
      activa: true
    }
  });

  // Establecer el nombre inicial cuando se abra el modal
  React.useEffect(() => {
    if (open && initialName) {
      setValue('nombre', initialName);
    }
  }, [open, initialName, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const result = await zonasService.createZona(data);
      
      if (result.success) {
        // Notificar éxito al componente padre
        if (onSuccess) {
          onSuccess(result.data);
        }
        
        // Limpiar formulario y cerrar modal
        reset();
        onClose();
      } else {
        setError(result.error || 'Error al crear la zona');
      }
    } catch (error) {
      console.error('Error al crear zona:', error);
      setError('Error inesperado al crear la zona');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      reset();
      setError('');
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationIcon color="primary" />
          {title}
        </Box>
        <IconButton 
          onClick={handleClose} 
          size="small"
          disabled={loading}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            autoFocus
            fullWidth
            label="Nombre de la zona"
            placeholder="Ej: Zona Norte, Zona Centro..."
            {...register('nombre')}
            error={!!errors.nombre}
            helperText={errors.nombre?.message}
            disabled={loading}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Descripción (opcional)"
            placeholder="Descripción adicional de la zona..."
            multiline
            rows={3}
            {...register('descripcion')}
            error={!!errors.descripcion}
            helperText={errors.descripcion?.message}
            disabled={loading}
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleClose}
            disabled={loading}
            color="inherit"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Zona'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default AddZonaModal;