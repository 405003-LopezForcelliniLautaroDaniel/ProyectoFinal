import React from 'react';
import { Button } from '@mui/material';

const ClientList = ({ clients, handleClientSelect }) => {
  return (
    <>
      {clients.map(client => (
        <Button 
          key={client.id} 
          variant="outlined" 
          sx={{ marginBottom: '0.5rem' }} 
          onClick={() => handleClientSelect(client)}
        >
          {client.name} ({client.contact})
        </Button>
      ))}
    </>
  );
};

export default ClientList;
