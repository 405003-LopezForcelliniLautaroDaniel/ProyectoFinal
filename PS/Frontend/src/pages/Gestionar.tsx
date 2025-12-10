import React, { useMemo, useState } from 'react';
import { Box, Tabs, Tab, Drawer, List, ListItemButton, ListItemText, Divider, Container, IconButton, Toolbar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import UserSearchPanel from '../components/gestionar/UserSearchPanel';
import UserCreateForm from '../components/gestionar/UserCreateForm';
import LineCreateForm from '../components/gestionar/LineCreateForm';
import LineSearchPanel from '../components/gestionar/LineSearchPanel';

type LeftMenu = 'usuarios' | 'roles';

const drawerWidth = 180;

const Gestionar: React.FC = () => {
  const [leftMenu, setLeftMenu] = useState<LeftMenu>('usuarios');
  const [tab, setTab] = useState<'buscar' | 'crear'>('buscar');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleTabChange = (_: React.SyntheticEvent, value: number) => {
    setTab(value === 0 ? 'buscar' : 'crear');
  };

  const tabsIndex = useMemo(() => (tab === 'buscar' ? 0 : 1), [tab]);

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

        {/* Sidebar vertical */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: { md: drawerWidth },
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
          open
        >
          {/* Deja espacio bajo el AppBar */}
          <Box sx={{ height: (theme) => theme.mixins.toolbar.minHeight }} />
          <List>
            <ListItemButton selected={leftMenu === 'usuarios'} onClick={() => setLeftMenu('usuarios')}>
              <ListItemText primary="Usuarios" />
            </ListItemButton>
            <Divider />
            <ListItemButton selected={leftMenu === 'roles'} onClick={() => setLeftMenu('roles')}>
              <ListItemText primary="Areas / Roles" />
            </ListItemButton>
          </List>
        </Drawer>

        {/* Drawer temporal para móviles */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' } }}
        >
          <Toolbar />
          <List>
            <ListItemButton selected={leftMenu === 'usuarios'} onClick={() => { setLeftMenu('usuarios'); setMobileOpen(false); }}>
              <ListItemText primary="Usuarios" />
            </ListItemButton>
            <Divider />
            <ListItemButton selected={leftMenu === 'roles'} onClick={() => { setLeftMenu('roles'); setMobileOpen(false); }}>
              <ListItemText primary="Areas / Roles" />
            </ListItemButton>
          </List>
        </Drawer>

        {/* Contenido principal */}
        <Box component="main" sx={{ flexGrow: 1, minHeight: 0, p: { xs: 1.5, md: 1.5 }, pr: { xs: 2, md: 5 }, ml: { xs: 0, md: `${drawerWidth}px` }, overflow: 'hidden' }}>
          {/* Tabs superiores Buscar / Crear */}
      <Container maxWidth={false} disableGutters sx={{ pr: { xs: 1, md: 6 }, pb: { xs: 4, md: 6 }, height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            {/* Botón hamburguesa solo en móviles */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', mb: 1, px: 1 }}>
              <IconButton color="inherit" onClick={() => setMobileOpen(true)} aria-label="abrir menú">
                <MenuIcon />
              </IconButton>
            </Box>
            <Tabs
              value={tabsIndex}
              onChange={handleTabChange}
              aria-label="tabs gestionar usuarios"
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 2, px: 0 }}
            >
              <Tab label="Buscar" />
              <Tab label="Crear" />
            </Tabs>

            {leftMenu === 'usuarios' && (
              <>
                {tab === 'buscar' ? <UserSearchPanel /> : <UserCreateForm />}
              </>
            )}

            {leftMenu === 'roles' && (
              <>
                {tab === 'buscar' ? <LineSearchPanel /> : <LineCreateForm />}
              </>
            )}
          </Container>
        </Box>
    </Box>
  );
};

export default Gestionar;


