import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Checkbox,
  Toolbar
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Clear as ClearIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import sociosService from '../../services/socios.service';
import zonasService from '../../services/zonas.service';

function SociosList() {
  const navigate = useNavigate();
  
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [zonaFilter, setZonaFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  
  // Opciones para filtros
  const [zonas, setZonas] = useState([]);
  
  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Ordenamiento
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('dni');
  
  // Diálogo de eliminación
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    socio: null
  });
  
  // Selección múltiple
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    loadInitialData();
    // Cargar socios solo una vez al montar el componente
    loadSocios();
  }, []);

  // Función para manejar búsqueda manual
  const handleSearch = () => {
    loadSocios();
  };

  // Solo recargar cuando cambian los filtros de zona y estado
  useEffect(() => {
    if (zonaFilter || estadoFilter) {
      loadSocios();
    }
  }, [zonaFilter, estadoFilter]);

  const loadInitialData = async () => {
    try {
      const zonasResult = await zonasService.getZonas();

      if (zonasResult.success) {
        setZonas(Array.isArray(zonasResult.data) ? zonasResult.data : []);
      } else {
        console.error('Error cargando zonas:', zonasResult.error);
        setZonas([]);
      }
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      setZonas([]);
    }
  };

  const loadSocios = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await sociosService.getSocios({
        searchTerm,
        zona: zonaFilter,
        estado: estadoFilter
      });

      if (result.success) {
        const sociosData = Array.isArray(result.data) ? result.data : [];
        setSocios(sociosData);
        setSelected([]);
      } else {
        setError(result.error || 'Error al cargar el personal');
        setSocios([]);
      }
    } catch (error) {
      console.error('Error al cargar personal:', error);
      setError('Error al cargar el personal');
      setSocios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const result = await sociosService.deleteSocio(deleteDialog.socio.id);
      
      if (result.success) {
        setSuccess(result.message);
        loadSocios();
        setDeleteDialog({ open: false, socio: null });
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error al eliminar personal:', error);
      setError('Error al eliminar el personal');
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    
    try {
      const result = await sociosService.bulkDelete(selected);
      
      if (result.success) {
        setSuccess(result.message);
        setSelected([]);
        loadSocios();
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error en eliminación masiva:', error);
      setError('Error en la eliminación masiva');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setZonaFilter('');
    setEstadoFilter('');
  };

  const getInitials = (nombres, apellidos) => {
    const n = nombres ? nombres.charAt(0) : '';
    const a = apellidos ? apellidos.charAt(0) : '';
    return (n + a).toUpperCase();
  };

  // Funciones de ordenamiento
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  // Funciones de selección
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = socios.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Filtrar y ordenar datos
  const filteredSocios = socios.filter(socio => {
    const matchesSearch = !searchTerm || 
      socio.dni?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      socio.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      socio.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      socio.celular?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesZona = !zonaFilter || socio.zona === zonaFilter;
    const matchesEstado = !estadoFilter || socio.estado === estadoFilter;
    
    return matchesSearch && matchesZona && matchesEstado;
  });

  const sortedSocios = stableSort(filteredSocios, getComparator(order, orderBy));
  const paginatedSocios = sortedSocios.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Cambiar página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const columns = [
    { id: 'dni', label: 'DNI', sortable: true, width: 100 },
    { id: 'nombres', label: 'Nombres', sortable: true, width: 140 },
    { id: 'apellidos', label: 'Apellidos', sortable: true, width: 140 },
    { id: 'celular', label: 'Celular', sortable: true, width: 110 },
    { id: 'zona', label: 'Zona', sortable: true, width: 150 },
    { id: 'acciones', label: 'Acciones', sortable: false, width: 150 }
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Lista de Personal
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona todo el personal registrado en el sistema
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Filtros y acciones */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <Box display="flex" gap={1}>
              <TextField
                fullWidth
                placeholder="Buscar personal por DNI, nombre, apellido o celular..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              <Button
                variant="outlined"
                onClick={handleSearch}
                disabled={loading}
                sx={{ minWidth: 'auto', px: 2 }}
              >
                {loading ? <CircularProgress size={20} /> : <SearchIcon />}
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Zona</InputLabel>
              <Select
                value={zonaFilter}
                label="Zona"
                onChange={(e) => setZonaFilter(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {zonas.map((zona) => (
                  <MenuItem key={zona.id} value={zona.nombre}>
                    {zona.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={estadoFilter}
                label="Estado"
                onChange={(e) => setEstadoFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="activo">Activo</MenuItem>
                <MenuItem value="inactivo">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
              >
                Limpiar
              </Button>
              
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/personal/nuevo')}
              >
                Nuevo Personal
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Acciones masivas */}
        {selected.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'action.selected', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {selected.length} persona(s) seleccionada(s)
            </Typography>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={handleBulkDelete}
            >
              Eliminar seleccionados
            </Button>
          </Box>
        )}
      </Paper>

      {/* Tabla */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < socios.length}
                    checked={socios.length > 0 && selected.length === socios.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell width={60}>Avatar</TableCell>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    width={column.width}
                    sortDirection={orderBy === column.id ? order : false}
                  >
                    {column.sortable ? (
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : 'asc'}
                        onClick={() => handleRequestSort(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedSocios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No hay personal registrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSocios.map((socio) => {
                  const isItemSelected = isSelected(socio.id);
                  return (
                    <TableRow
                      hover
                      key={socio.id}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          onChange={(event) => handleClick(event, socio.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {getInitials(socio.nombres, socio.apellidos)}
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace" fontWeight="bold">
                          {socio.dni || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>{socio.nombres || '-'}</TableCell>
                      <TableCell>{socio.apellidos || '-'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {socio.celular || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={socio.zona || 'Sin zona'} 
                          size="small" 
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Ver detalles">
                            <IconButton 
                              size="small" 
                              onClick={() => navigate(`/personal/ver/${socio.id}`)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Editar">
                            <IconButton 
                              size="small" 
                              onClick={() => navigate(`/personal/editar/${socio.id}`)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Eliminar">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => setDeleteDialog({ open: true, socio })}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredSocios.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </Paper>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, socio: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar del personal a{' '}
            <strong>
              {deleteDialog.socio?.nombres} {deleteDialog.socio?.apellidos}
            </strong>
            ?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, socio: null })}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default SociosList;