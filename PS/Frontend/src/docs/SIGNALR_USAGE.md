# Guía de uso de SignalR

## 📡 Configuración completada

El entorno de SignalR está completamente configurado y listo para usar. La conexión se establece automáticamente cuando el usuario está autenticado.

## 🔧 Arquitectura

### Archivos principales:

1. **`src/services/signalRService.ts`** - Servicio principal de SignalR con métodos de conexión y comunicación
2. **`src/contexts/SignalRContext.tsx`** - Contexto de React para acceder a SignalR en cualquier componente
3. **`src/hooks/useChatSignalR.ts`** - Hook personalizado para eventos de chat
4. **`src/config/api.ts`** - Configuración de URLs (incluye `SIGNALR_HUB_URL`)

## 🚀 Uso básico

### 1. Usar el hook de SignalR en un componente

```tsx
import { useSignalR } from '../../contexts/SignalRContext';

const MyComponent = () => {
  const { isConnected, on, off, invoke, send } = useSignalR();

  useEffect(() => {
    if (!isConnected) return;

    // Escuchar un evento del servidor
    const handleMyEvent = (data: any) => {
      console.log('Evento recibido:', data);
    };

    on('MyEvent', handleMyEvent);

    // Cleanup
    return () => {
      off('MyEvent', handleMyEvent);
    };
  }, [isConnected, on, off]);

  return <div>Estado: {isConnected ? 'Conectado' : 'Desconectado'}</div>;
};
```

### 2. Enviar mensajes al servidor

```tsx
const { invoke, send } = useSignalR();

// Invoke: Espera respuesta del servidor
const handleClick = async () => {
  try {
    const result = await invoke('MethodName', arg1, arg2);
    console.log('Respuesta del servidor:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Send: No espera respuesta (fire and forget)
const handleSend = async () => {
  try {
    await send('MethodName', arg1, arg2);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 📨 Eventos de Chat implementados

El hook `useChatSignalR` ya está integrado en el `ChatContext` y escucha los siguientes eventos:

- **`ReceiveMessage`** - Cuando llega un mensaje nuevo del servidor
- **`MessageReceived`** - Confirmación de que un mensaje fue recibido
- **`ChatUpdated`** - Cuando se actualiza el estado de un chat
- **`ChatTransferred`** - Cuando un chat es transferido
- **`ChatArchived`** - Cuando un chat es archivado

### Ejemplo de uso en ChatContext:

```tsx
useChatSignalR({
  onNewMessage: (message) => {
    console.log('Nuevo mensaje:', message);
    addMessage(message);
  },
  onChatUpdated: (chatId, status) => {
    console.log('Chat actualizado:', chatId, status);
    updateChatInList(chatId, status);
  },
});
```

## 🎯 Eventos que el backend debe emitir

Para que los mensajes lleguen en tiempo real, el backend debe emitir estos eventos:

### 1. Enviar mensaje a un usuario específico
```csharp
await Clients.User(userId).SendAsync("ReceiveMessage", message);
```

### 2. Enviar a un grupo de chat
```csharp
await Clients.Group(chatId).SendAsync("ReceiveMessage", message);
```

### 3. Notificar actualización de chat
```csharp
await Clients.All.SendAsync("ChatUpdated", chatId, status);
```

## 🔍 Componente de estado (opcional)

Puedes agregar el componente `SignalRStatus` en tu layout para ver el estado de conexión:

```tsx
import SignalRStatus from './components/general/SignalRStatus';

// En tu componente principal
<SignalRStatus />
```

## 📝 Agregar nuevos eventos

### 1. Agregar evento en el hook `useChatSignalR`:

```tsx
// En src/hooks/useChatSignalR.ts
interface UseChatSignalRProps {
  // ... otros eventos
  onMyNewEvent?: (data: any) => void;
}

// En el useEffect:
const handleMyNewEvent = (data: any) => {
  console.log('Mi nuevo evento:', data);
  if (onMyNewEvent) {
    onMyNewEvent(data);
  }
};

if (onMyNewEvent) on('MyNewEvent', handleMyNewEvent);

// En el cleanup:
if (onMyNewEvent) off('MyNewEvent', handleMyNewEvent);
```

### 2. Usar el nuevo evento en ChatContext:

```tsx
useChatSignalR({
  // ... otros handlers
  onMyNewEvent: (data) => {
    console.log('Evento personalizado:', data);
    // Tu lógica aquí
  },
});
```

## 🔐 Autenticación

La conexión de SignalR incluye automáticamente el token JWT del usuario:

```typescript
accessTokenFactory: () => token || ''
```

El token se obtiene de `localStorage.getItem('authToken')`.

## 🔄 Reconexión automática

SignalR está configurado con reconexión automática:
- Primer intento: inmediato
- Segundo intento: 2 segundos
- Tercer intento: 10 segundos
- Intentos siguientes: cada 30 segundos

## ⚙️ Configuración

Para cambiar la URL del hub, edita `src/config/api.ts`:

```typescript
export const SIGNALR_HUB_URL = 'https://tu-servidor.com/chathub';
```

## 📊 Logs de debugging

Todos los eventos y métodos de SignalR incluyen logs detallados en la consola para facilitar el debugging:

- Conexión establecida
- Eventos recibidos
- Métodos invocados
- Reconexiones
- Errores

## 🎉 ¡Listo!

El entorno de SignalR está completamente configurado y funcionando. Los mensajes que lleguen del backend se mostrarán automáticamente en tiempo real en el chat activo.

