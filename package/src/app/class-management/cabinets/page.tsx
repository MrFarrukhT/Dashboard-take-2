'use client';
import React, { useCallback, useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  Paper,
  styled,
} from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { Cabinet, mockCabinets, mockTeachers, Teacher } from '@/mock/data';

// Styled components for the grid
const GridCell = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  textAlign: 'center',
  cursor: 'pointer',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[2],
  },
}));

interface CellData {
  isActive: boolean;
  teacherId: string | null;
}

type GridData = {
  [key: string]: {
    [key: string]: CellData;
  };
};

import { IconEdit, IconTrash } from '@tabler/icons-react';
import CabinetDialog from './CabinetDialog';

const Cabinets = () => {
  // State management
  const [cabinets, setCabinets] = useState<Cabinet[]>(mockCabinets);
  const [teachers] = useState<Teacher[]>(mockTeachers);
  const [gridData, setGridData] = useState<GridData>({});
  const [selectedCabinet, setSelectedCabinet] = useState<Cabinet | undefined>();

  // Initialize grid data
  useEffect(() => {
    const initialData: GridData = {};
    cabinets.forEach(cabinet => {
      initialData[cabinet.id] = {};
      for (let hour = 9; hour <= 20; hour++) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
        initialData[cabinet.id][timeSlot] = {
          isActive: false,
          teacherId: null
        };
      }
    });
    
    // Load saved data from localStorage if available
    const savedData = localStorage.getItem('cabinetGridData');
    if (savedData) {
      setGridData(JSON.parse(savedData));
    } else {
      setGridData(initialData);
    }
  }, [cabinets]);

  // Save grid data to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(gridData).length > 0) {
      localStorage.setItem('cabinetGridData', JSON.stringify(gridData));
    }
  }, [gridData]);

  // Handle cell click to toggle active state
  const handleCellClick = (cabinetId: string, timeSlot: string) => {
    setGridData(prev => ({
      ...prev,
      [cabinetId]: {
        ...prev[cabinetId],
        [timeSlot]: {
          ...prev[cabinetId][timeSlot],
          isActive: !prev[cabinetId][timeSlot].isActive
        }
      }
    }));
  };

  // Handle teacher selection
  const handleTeacherSelect = (cabinetId: string, timeSlot: string, teacherId: string | null) => {
    setGridData(prev => ({
      ...prev,
      [cabinetId]: {
        ...prev[cabinetId],
        [timeSlot]: {
          ...prev[cabinetId][timeSlot],
          teacherId
        }
      }
    }));
  };
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
    open: boolean;
  }>({
    message: '',
    type: 'success',
    open: false,
  });

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'occupied':
        return 'warning';
      case 'maintenance':
        return 'error';
      default:
        return 'default';
    }
  };

  // Handlers
  const handleOpenDialog = useCallback((cabinet?: Cabinet) => {
    setSelectedCabinet(cabinet);
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setSelectedCabinet(undefined);
    setDialogOpen(false);
  }, []);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({
      message,
      type,
      open: true,
    });
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const handleSaveCabinet = useCallback(async (cabinetData: Partial<Cabinet>) => {
    setLoading(true);
    try {
      if (selectedCabinet) {
        // Update existing cabinet
        const updatedCabinets = cabinets.map((cabinet) =>
          cabinet.id === selectedCabinet.id
            ? { ...cabinet, ...cabinetData }
            : cabinet
        );
        setCabinets(updatedCabinets);
        showNotification('Cabinet updated successfully', 'success');
      } else {
        // Add new cabinet
        const newCabinet: Cabinet = {
          id: String(Date.now()), // Generate a unique ID
          ...cabinetData as Omit<Cabinet, 'id'>,
        };
        setCabinets((prev) => [...prev, newCabinet]);
        showNotification('Cabinet added successfully', 'success');
      }
      handleCloseDialog();
    } catch (error) {
      showNotification(
        'Error saving cabinet. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [cabinets, selectedCabinet, handleCloseDialog]);

  const handleDeleteCabinet = useCallback(async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this cabinet?')) {
      return;
    }

    setLoading(true);
    try {
      setCabinets((prev) => prev.filter((cabinet) => cabinet.id !== id));
      showNotification('Cabinet deleted successfully', 'success');
    } catch (error) {
      showNotification(
        'Error deleting cabinet. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <PageContainer title="Cabinets" description="Manage classroom spaces">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h3">Cabinets</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleOpenDialog()}
                  disabled={loading}
                >
                  Add New Cabinet
                </Button>
              </Box>
              
              {loading && (
                <Box display="flex" justifyContent="center" my={3}>
                  <CircularProgress />
                </Box>
              )}

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Capacity</TableCell>
                      <TableCell>Equipment</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cabinets.map((cabinet) => (
                      <TableRow key={cabinet.id}>
                        <TableCell>{cabinet.name}</TableCell>
                        <TableCell>{cabinet.location}</TableCell>
                        <TableCell>{cabinet.capacity} students</TableCell>
                        <TableCell>
                          {cabinet.equipment.map((item, index) => (
                            <Chip
                              key={index}
                              label={item}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={cabinet.status}
                            color={getStatusColor(cabinet.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            size="small"
                            sx={{ mr: 1 }}
                            onClick={() => handleOpenDialog(cabinet)}
                            disabled={loading}
                          >
                            <IconEdit size={18} />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteCabinet(cabinet.id)}
                            disabled={loading}
                          >
                            <IconTrash size={18} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Daily Schedule Grid */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box mb={3}>
                <Typography variant="h3" mb={2}>Daily Schedule</Typography>
                <Box display="flex" gap={2} alignItems="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Paper sx={{ width: 24, height: 24, bgcolor: 'background.paper' }} />
                    <Typography variant="body2">Inactive</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Paper sx={{ width: 24, height: 24, bgcolor: 'primary.light' }} />
                    <Typography variant="body2">Active</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ ml: 2 }}>Click cell to toggle active/inactive</Typography>
                </Box>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      {cabinets.map((cabinet) => (
                        <TableCell key={cabinet.id} align="center">
                          {cabinet.name}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.from({ length: 12 }, (_, index) => {
                      const hour = index + 9;
                      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
                      return (
                        <TableRow key={timeSlot}>
                          <TableCell>{timeSlot}</TableCell>
                          {cabinets.map((cabinet) => (
                            <TableCell key={`${cabinet.id}-${timeSlot}`} align="center">
                              <GridCell
                                onClick={() => handleCellClick(cabinet.id, timeSlot)}
                                elevation={gridData[cabinet.id]?.[timeSlot]?.isActive ? 2 : 0}
                                sx={{
                                  bgcolor: gridData[cabinet.id]?.[timeSlot]?.isActive
                                    ? 'primary.light'
                                    : 'background.paper',
                                }}
                              >
                                <Select
                                  size="small"
                                  value={gridData[cabinet.id]?.[timeSlot]?.teacherId || ''}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleTeacherSelect(cabinet.id, timeSlot, e.target.value);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  sx={{ minWidth: 120 }}
                                  disabled={!gridData[cabinet.id]?.[timeSlot]?.isActive}
                                >
                                  <MenuItem value="">
                                    <em>None</em>
                                  </MenuItem>
                                  {teachers.map(teacher => (
                                    <MenuItem key={teacher.id} value={teacher.id}>
                                      {teacher.name}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </GridCell>
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <CabinetDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveCabinet}
        cabinet={selectedCabinet}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.type}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default Cabinets;