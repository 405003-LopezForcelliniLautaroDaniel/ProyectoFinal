import React, { useRef } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';

interface Props {
  onFilesSelected?: (files: FileList) => void;
}

const AttachmentButton: React.FC<Props> = ({ onFilesSelected }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected?.(e.target.files);
      // Reset para permitir volver a seleccionar el mismo archivo
      e.currentTarget.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={handleChange}
        // Acepta imágenes, audio, video y documentos comunes
        accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip"
      />
      <Tooltip title="Adjuntar archivos (fotos, audio, documentos)">
        <IconButton onClick={handleClick} sx={{ alignSelf: 'flex-end' }}>
          <AttachFileIcon />
        </IconButton>
      </Tooltip>
    </>
  );
};

export default AttachmentButton;
