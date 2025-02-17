import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
} from '@mui/material';
import { IconPlus } from '@tabler/icons-react';
import { Cabinet } from '@/mock/data';

interface CabinetDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (cabinet: Partial<Cabinet>) => void;
  cabinet?: Cabinet;
}

const CabinetDialog: React.FC<CabinetDialogProps> = ({
  open,
  onClose,
  onSave,
  cabinet,
}) => {
  const [formData, setFormData] = React.useState<Partial<Cabinet>>({
    name: '',
    location: '',
    capacity: 0,
    equipment: [],
    status: 'available',
    ...cabinet,
  });

  const [newEquipment, setNewEquipment] = React.useState('');

  React.useEffect(() => {
    if (cabinet) {
      setFormData(cabinet);
    } else {
      setFormData({
        name: '',
        location: '',
        capacity: 0,
        equipment: [],
        status: 'available',
      });
    }
    setNewEquipment('');
  }, [cabinet]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.name === 'capacity' 
      ? parseInt(e.target.value) || 0
      : e.target.value;
    
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleAddEquipment = () => {
    if (newEquipment.trim() && !formData.equipment?.includes(newEquipment.trim())) {
      setFormData({
        ...formData,
        equipment: [...(formData.equipment || []), newEquipment.trim()],
      });
      setNewEquipment('');
    }
  };

  const handleRemoveEquipment = (item: string) => {
    setFormData({
      ...formData,
      equipment: formData.equipment?.filter((equipment) => equipment !== item) || [],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.capacity && formData.capacity > 0) {
      onSave(formData);
    }
  };

  const isValid = () => {
    return (
      formData.name?.trim() &&
      formData.location?.trim() &&
      formData.capacity &&
      formData.capacity > 0 &&
      formData.status
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {cabinet ? 'Edit Cabinet' : 'Add New Cabinet'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Capacity"
              name="capacity"
              type="number"
              value={formData.capacity}
              onChange={handleChange}
              required
              fullWidth
              inputProps={{ min: 1 }}
              error={formData.capacity !== undefined && formData.capacity <= 0}
              helperText={formData.capacity !== undefined && formData.capacity <= 0 ? "Capacity must be greater than 0" : ""}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                name="status"
                onChange={(e) => setFormData({
                  ...formData,
                  status: e.target.value as 'available' | 'occupied' | 'maintenance',
                })}
                label="Status"
                required
              >
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="occupied">Occupied</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>
            <Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  label="Add Equipment"
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  fullWidth
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddEquipment();
                    }
                  }}
                />
                <IconButton 
                  onClick={handleAddEquipment}
                  color="primary"
                  sx={{ mt: 1 }}
                >
                  <IconPlus size={24} />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.equipment?.map((item, index) => (
                  <Chip
                    key={index}
                    label={item}
                    onDelete={() => handleRemoveEquipment(item)}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={!isValid()}
          >
            {cabinet ? 'Save Changes' : 'Add Cabinet'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CabinetDialog;