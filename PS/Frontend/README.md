# React Auth App

Una aplicación React con Material UI que incluye un sistema de autenticación completo.

## Características

- ✅ React 18 con TypeScript
- ✅ Material UI para componentes de interfaz
- ✅ Sistema de autenticación con contexto
- ✅ Rutas protegidas
- ✅ Configuración de API con Axios
- ✅ Manejo de errores y estados de carga
- ✅ Arquitectura en capas (servicios, contextos, componentes)

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar el servidor de desarrollo:
```bash
npm start
```

La aplicación se abrirá en [http://localhost:3000](http://localhost:3000)

## Configuración del Backend

La aplicación está configurada para conectarse con un backend en `http://localhost:5204`.

### Endpoint de Login

- **URL**: `POST http://localhost:5204/api/v1/login`
- **Body**:
```json
{
  "UserName": "usuario",
  "Password": "contraseña"
}
```

- **Respuesta esperada**:
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "username": "usuario",
    "email": "usuario@ejemplo.com",
    "name": "Nombre Usuario"
  }
}
```

## Estructura del Proyecto

```
src/
├── components/          # Componentes de UI
│   ├── Dashboard.tsx
│   ├── LoginForm.tsx
│   └── ProtectedRoute.tsx
├── config/             # Configuración
│   └── api.ts
├── contexts/           # Contextos de React
│   └── AuthContext.tsx
├── services/           # Servicios de API
│   └── authService.ts
├── types/              # Tipos TypeScript
│   └── auth.ts
├── App.tsx
├── index.tsx
└── index.css
```

## Uso

1. **Login**: Los usuarios pueden iniciar sesión con sus credenciales
2. **Dashboard**: Después del login exitoso, los usuarios son redirigidos al dashboard
3. **Logout**: Los usuarios pueden cerrar sesión desde el dashboard
4. **Rutas Protegidas**: El dashboard solo es accesible para usuarios autenticados

## Personalización

- Modifica `src/config/api.ts` para cambiar la URL base del backend
- Personaliza el tema en `src/App.tsx`
- Agrega más componentes en `src/components/`
- Extiende los tipos en `src/types/`

## Scripts Disponibles

- `npm start`: Inicia el servidor de desarrollo
- `npm build`: Construye la aplicación para producción
- `npm test`: Ejecuta las pruebas
- `npm eject`: Expone la configuración de webpack (irreversible)

