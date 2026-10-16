# Sistema de Reservas de Hotel — Frontend

Interfaz en **React 18 + TypeScript + Vite** para el taller del Patrón Facade.
El código está en inglés y la interfaz en español. Consume la API del backend (Spring Boot en Render).

## Funcionalidades

| Requerimiento | Dónde |
|---------------|-------|
| Registro e inicio de sesión con token (JWT) | `pages/RegisterPage.tsx`, `pages/LoginPage.tsx` |
| Buscador de habitaciones por fechas con disponibilidad | `pages/SearchPage.tsx` |
| Selección de habitación con vista previa del precio dinámico | `components/RoomCard.tsx`, `components/PriceBreakdown.tsx` |
| Formulario de reserva con datos del huésped | `pages/BookingPage.tsx` |
| Panel de gestión: servicios, resumen, check-in y check-out | `pages/ReservationDetailPage.tsx` |
| Factura final generada por el servidor | `components/InvoiceView.tsx` |

## Estructura (orientada a objetos)

```
src/
├── api/          ApiClient (clase que hace las peticiones) y AppError (error seguro para mostrar)
├── services/     AuthService, HotelService, SessionStore (clases) y sus instancias en index.ts
├── models/       tipos TypeScript iguales a las respuestas del backend
├── validation/   Validator (reglas) y limits.ts (límites compartidos con el backend)
├── context/      AuthContext: sesión del usuario y cierre automático al expirar el token
├── components/   piezas reutilizables (FormField, Alert, RoomCard, InvoiceView, ErrorBoundary...)
├── pages/        una página por pantalla
├── utils/        fechas, formato de dinero y textos en español
└── styles/       estilos globales
```

## Límites de los formularios

| Campo | Regla |
|-------|-------|
| Nombre | 3–60 caracteres, solo letras y espacios |
| Correo | formato válido, máx. 100 caracteres |
| Contraseña | 8–64 caracteres, mayúscula, minúscula y número, sin espacios |
| Documento | 6–12 dígitos (solo números) |
| Teléfono | 7–15 dígitos (solo números) |
| Fechas | entrada desde hoy hasta 1 año; salida posterior a la entrada; máx. 30 noches |
| Huéspedes | 1 a la capacidad de la habitación (1, 2 o 4) |

Cada campo muestra qué se debe escribir, sus límites y, si aplica, un contador de caracteres.

## Seguridad y manejo de errores

- El token se envía en el header `Authorization: Bearer ...`; al expirar o ser rechazado se cierra la sesión.
- Los formularios no envían datos por la URL (`preventDefault` + `fetch` con cuerpo JSON).
- Todos los errores se muestran como mensajes amigables en español; nunca detalles técnicos.
- `ErrorBoundary` evita pantallas en blanco si algo falla al dibujar una página.
- El build de producción no genera *source maps* y elimina los `console.*`.

## Ejecutar en local

Requisitos: Node.js 18+ y el backend corriendo en `http://localhost:8080`.

```bash
npm install
cp .env.example .env      # ajusta VITE_API_URL si hace falta
npm run dev               # http://localhost:5173
npm run build             # verifica tipos y genera dist/
```

## Despliegue en Vercel

1. Sube este repositorio a GitHub.
2. En [Vercel](https://vercel.com/new) → **Add New Project** → importa el repositorio.
   Vercel detecta Vite (`vercel.json` ya define build, carpeta `dist` y redirecciones para las rutas).
3. En **Environment Variables** agrega:
   `VITE_API_URL = https://<tu-backend>.onrender.com` (sin `/` al final).
4. **Deploy**. Copia la URL que te da Vercel (por ejemplo `https://hotel-facade.vercel.app`).
5. En Render, en el backend, pon esa URL en `CORS_ALLOWED_ORIGINS`
   (puedes agregar `,https://*.vercel.app` para las vistas previas) y vuelve a desplegar.

> Si cambias `VITE_API_URL` debes volver a desplegar en Vercel, porque la variable se incluye al compilar.
