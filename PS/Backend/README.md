# Login Básico con JWT y Encriptación de Contraseñas

Proyecto base para autenticación de usuarios, pensado como plantilla en futuros desarrollos.

---

## Características principales

- 🔐 **Autenticación segura** mediante JSON Web Tokens (JWT).  
- 🔒 **Hash seguro** para el almacenamiento de contraseñas.  
- 📦 Respuesta estándar y manejo unificado de errores en todos los controladores.  
- ⚙️ Arquitectura escalable y preparada para adaptar fácilmente a nuevos proyectos.

---

## Uso con Entity Framework Core (Code First)

Para crear y aplicar migraciones a la base de datos, ejecuta los siguientes comandos:

```bash
dotnet ef migrations add <NombreMigracion>
dotnet ef database update
