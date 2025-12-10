# 📡 Guía rápida de SignalR

## 🔍 Console Logs que verás

### Al conectar:
```
✅ SignalR: Conectado - [connectionId]
```

### Al reconectar (si hay problemas):
```
🔄 SignalR: Reconectando...
✅ SignalR: Reconectado [connectionId]
```

### Cuando llega un evento del servidor:
```
📡 SignalR [NombreDelEvento]: { ...datos }
```

**Ejemplo:**
```javascript
📡 SignalR [ReceiveMessage]: {
  idChat: '08de116d-a7e8-4144-8e80-da94fa5d9fc7',
  idUser: null,
  idClient: '08de05d3-bc64-4e3c-88ac-ecbd7ef9dbdd',
  idMessageType: 1,
  content: 'Hola mundo',
  time: '2024-10-22T10:30:00'
}
```

## 📋 Eventos actuales configurados

### 1. `ReceiveMessage` - Nuevo mensaje
Cuando llega un mensaje nuevo del servidor.

**Estructura esperada:**
```typescript
{
  idChat: string;
  idUser: string | null;
  idClient: string | null;
  idMessageType: number;
  content: string;
  time: string;
}
```

### 2. `MessageReceived` - Confirmación
Cuando el servidor confirma que recibió un mensaje.

### 3. `ChatUpdated` - Chat actualizado
Cuando el estado de un chat cambia.

**Estructura esperada:**
```typescript
(chatId: string, status: string)
```

### 4. `ChatTransferred` - Chat transferido
Cuando un chat es transferido a otro usuario.

**Estructura esperada:**
```typescript
(chatId: string, userId: string)
```

### 5. `ChatArchived` - Chat archivado
Cuando un chat es archivado.

**Estructura esperada:**
```typescript
(chatId: string)
```

## 🛠️ Cómo agregar un nuevo evento

### 1. En el backend (C#):
```csharp
await Clients.User(userId).SendAsync("NuevoEvento", datos);
```

### 2. En el frontend:

**Opción A: En ChatContext**
```typescript
// En src/contexts/ChatContext.tsx

// 1. Crear handler
const handleNuevoEvento = (datos: any) => {
  console.log('Procesando nuevo evento:', datos);
  // Tu lógica aquí
};

// 2. Agregar al hook
useChatSignalR({
  onNewMessage: handleNewMessage,
  onChatUpdated: handleChatUpdated,
  onNuevoEvento: handleNuevoEvento, // ← Nuevo
});
```

**Opción B: Usar SignalR directamente en cualquier componente**
```typescript
import { useSignalR } from '../contexts/SignalRContext';

const MiComponente = () => {
  const { on, off, isConnected } = useSignalR();

  useEffect(() => {
    if (!isConnected) return;

    const handleEvento = (datos: any) => {
      console.log('Evento recibido:', datos);
    };

    on('NombreEvento', handleEvento);

    return () => {
      off('NombreEvento', handleEvento);
    };
  }, [isConnected, on, off]);
};
```

## 🎯 Testing

### Ver todos los eventos en consola:
Todos los eventos de SignalR se loggean automáticamente con este formato:
```
📡 SignalR [NombreEvento]: datos
```

### Verificar conexión:
```javascript
// En la consola del navegador
localStorage.getItem('authToken') // Debe tener un token
```

### Probar evento manualmente desde backend:
```csharp
// Enviar a todos
await Clients.All.SendAsync("TestEvento", "Hola desde el backend");

// Enviar a usuario específico
await Clients.User(userId).SendAsync("TestEvento", "Mensaje personal");

// Enviar a grupo
await Clients.Group(groupName).SendAsync("TestEvento", "Mensaje al grupo");
```

## 📝 Notas importantes

- ✅ La conexión es automática al iniciar sesión
- ✅ Reconexión automática: 0s, 2s, 10s, 30s
- ✅ El token JWT se incluye automáticamente
- ✅ Todos los eventos se loggean en consola
- ✅ Los logs solo muestran warnings y errores (no info)

## 🔧 Configuración

### Cambiar URL del hub:
```typescript
// En src/config/api.ts
export const SIGNALR_HUB_URL = 'https://tu-servidor.com/chathub';
```

### Cambiar nivel de logs:
```typescript
// En src/services/signalRService.ts
.configureLogging(signalR.LogLevel.Warning) // Warning | Information | Debug
```

