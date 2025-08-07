import React, { useState } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Button,
  Chip,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

function AutocompleteWithAdd({
  label,
  options = [],
  value,
  onChange,
  error,
  helperText,
  loading = false,
  onAddNew,
  addButtonText = "Agregar nuevo",
  getOptionLabel = (option) => option?.nombre || option || '',
  getOptionValue = (option) => option?.nombre || option || '',
  disabled = false,
  placeholder = `Buscar ${label?.toLowerCase() || ''}...`,
  required = false,
  freeSolo = false,
  ...props
}) {
  const [inputValue, setInputValue] = useState('');

  const handleAddNew = () => {
    if (onAddNew) {
      onAddNew(inputValue);
      setInputValue('');
    }
  };

  const showAddButton = onAddNew && inputValue && !loading && 
    !options.some(option => 
      getOptionLabel(option).toLowerCase().includes(inputValue.toLowerCase())
    );

  return (
    <Box sx={{ position: 'relative' }}>
      <Autocomplete
        fullWidth
        options={options}
        value={value ? options.find(opt => getOptionValue(opt) === value) || value : null}
        onChange={(event, newValue) => {
          if (onChange) {
            onChange(getOptionValue(newValue));
          }
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={(option, value) => 
          getOptionValue(option) === getOptionValue(value)
        }
        loading={loading}
        disabled={disabled}
        freeSolo={freeSolo}
        clearOnBlur={false}
        selectOnFocus
        handleHomeEndKeys
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            error={!!error}
            helperText={helperText}
            required={required}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Box sx={{ fontWeight: 'medium' }}>
                {getOptionLabel(option)}
              </Box>
              {option.descripcion && (
                <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                  {option.descripcion}
                </Box>
              )}
            </Box>
          </Box>
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              variant="outlined"
              label={getOptionLabel(option)}
              {...getTagProps({ index })}
              key={index}
            />
          ))
        }
        {...props}
      />
      
      {showAddButton && (
        <Box sx={{ mt: 1 }}>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            variant="outlined"
            color="primary"
            disabled={loading}
          >
            {addButtonText} "{inputValue}"
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default AutocompleteWithAdd;