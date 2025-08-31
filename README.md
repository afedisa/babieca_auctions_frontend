# Subastas Babieca Factory

Una plataforma moderna de subastas en línea desarrollada con React, TypeScript y Tailwind CSS. Permite a los usuarios participar en subastas de productos con un sistema de pujas en tiempo real.

## 🚀 Características

### Para Usuarios
- **Autenticación segura**: Sistema de registro e inicio de sesión con validación
- **Navegación intuitiva**: Interfaz moderna y responsive
- **Participación en subastas**: Sistema de pujas con confirmación
- **Seguimiento de pujas**: Visualización de pujas propias y estado de participación
- **Perfil de usuario**: Gestión de información personal

### Para Administradores
- **Panel de administración**: Gestión completa de subastas y usuarios
- **Creación de subastas**: Formulario completo para crear nuevas subastas
- **Gestión de usuarios**: Bloqueo/desbloqueo y administración de cuentas
- **Monitoreo en tiempo real**: Seguimiento de subastas activas y finalizadas
- **Control de estado**: Gestión de pagos y recogida de productos

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript
- **Estilos**: Tailwind CSS
- **Iconos**: Lucide React
- **Build Tool**: Vite
- **Backend**: Strapi CMS (API REST)
- **Base de datos**: PostgreSQL (a través de Strapi)
- **Autenticación**: Sistema integrado con Strapi

## 📋 Requisitos Previos

- Node.js (versión 18 o superior)
- npm o yarn
- Servidor Strapi configurado (backend)

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd subastas-babieca-factory
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear un archivo `.env` en la raíz del proyecto:
```env
VITE_API_BASE_URL=http://localhost:1337/api
```

### 4. Ejecutar en modo desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🏗️ Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter de código

## 🔧 Configuración del Backend

### Requisitos del Backend (Strapi)
El proyecto requiere un servidor Strapi con las siguientes colecciones:

#### Usuarios (Users)
- `username`: String
- `email`: String (único)
- `password`: String (hasheado)
- `userType`: Enum ('particular', 'profesional')
- `phone`: String
- `role`: Enum ('user', 'admin', 'superadmin')
- `isBlocked`: Boolean

#### Subastas (Auctions)
- `productName`: String
- `productDescription`: Text
- `productImages`: Array de URLs
- `productDocuments`: String (URL opcional)
- `startingPrice`: Number
- `startDate`: DateTime
- `endDate`: DateTime
- `currentBid`: Number
- `bidCount`: Number
- `participantCount`: Number
- `isActive`: Boolean
- `winner`: String (opcional)
- `isPaid`: Boolean
- `isCollected`: Boolean
- `createdBy`: String

#### Pujas (Bids)
- `auction`: Relación con Auction
- `bidder`: Relación con User
- `bidPrice`: Number
- `bidDate`: DateTime
- `isWinner`: Boolean

## 👥 Tipos de Usuario

### Usuario Regular
- Puede ver subastas activas
- Puede participar en pujas
- Puede ver su historial de pujas
- Puede gestionar su perfil

### Administrador
- Todas las funciones de usuario regular
- Puede crear nuevas subastas
- Puede cancelar subastas activas
- Puede ver subastas finalizadas
- Puede gestionar usuarios (bloquear/desbloquear)

### Super Administrador
- Todas las funciones de administrador
- Puede crear otros administradores
- Puede eliminar usuarios
- Acceso completo al sistema

## 🔐 Autenticación

### Credenciales de Demo
- **Email**: root@babieca.com
- **Contraseña**: Af.babieca2025

### Registro de Nuevos Usuarios
Los usuarios pueden registrarse proporcionando:
- Nombre de usuario
- Email
- Contraseña
- Tipo de usuario (particular/profesional)
- Número de teléfono

## 🎨 Diseño y UX

- **Diseño responsive**: Optimizado para móvil, tablet y escritorio
- **Tema personalizado**: Colores corporativos con verde como color principal
- **Animaciones suaves**: Transiciones y micro-interacciones
- **Accesibilidad**: Contraste adecuado y navegación por teclado
- **Feedback visual**: Estados de hover, loading y confirmación

## 📱 Funcionalidades Principales

### Sistema de Subastas
- Visualización de subastas activas y finalizadas
- Información detallada de productos
- Contador de tiempo restante
- Historial de pujas
- Sistema de confirmación de pujas

### Panel de Administración
- Dashboard con métricas
- Gestión de subastas (crear, cancelar, monitorear)
- Gestión de usuarios (crear, bloquear, eliminar)
- Visualización de ganadores y estados de pago

### Gestión de Usuarios
- Perfiles de usuario editables
- Historial de participación
- Sistema de roles y permisos
- Bloqueo/desbloqueo de cuentas

## 🔄 Flujo de Trabajo

1. **Registro/Login**: El usuario se registra o inicia sesión
2. **Exploración**: Navega por las subastas disponibles
3. **Participación**: Realiza pujas en subastas de interés
4. **Seguimiento**: Monitorea el estado de sus pujas
5. **Finalización**: Recibe notificación si gana una subasta

## 🚀 Despliegue

### Build para Producción
```bash
npm run build
```

### Variables de Entorno para Producción
```env
VITE_API_BASE_URL=https://tu-servidor-strapi.com/api
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Estructura del Proyecto

```
src/
├── components/          # Componentes React reutilizables
│   ├── AdminPanel.tsx   # Panel de administración
│   ├── BidModal.tsx     # Modal para realizar pujas
│   ├── CreateAuctionModal.tsx # Modal para crear subastas
│   ├── HomePage.tsx     # Página principal
│   ├── Layout.tsx       # Layout principal
│   └── LoginForm.tsx    # Formulario de autenticación
├── contexts/            # Contextos de React
│   ├── AuthContext.tsx  # Gestión de autenticación
│   └── AuctionContext.tsx # Gestión de subastas
├── services/            # Servicios y utilidades
│   └── authService.ts   # Servicios de autenticación
├── types/               # Definiciones de TypeScript
│   └── index.ts         # Tipos principales
├── config/              # Configuración
│   └── firebase.ts      # Configuración de Firebase
├── App.tsx              # Componente principal
├── main.tsx             # Punto de entrada
└── index.css            # Estilos globales
```

## 🐛 Solución de Problemas

### Error de conexión con el backend
- Verificar que el servidor Strapi esté ejecutándose
- Comprobar la URL en las variables de entorno
- Verificar que las colecciones estén configuradas correctamente

### Problemas de autenticación
- Limpiar localStorage del navegador
- Verificar credenciales de demo
- Comprobar configuración de CORS en Strapi

### Errores de build
- Ejecutar `npm install` para reinstalar dependencias
- Verificar versión de Node.js
- Limpiar caché con `npm run build --force`

## 📞 Soporte

Para soporte técnico o consultas sobre el proyecto, contactar al equipo de desarrollo.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Desarrollado con ❤️ para Babieca Factory**