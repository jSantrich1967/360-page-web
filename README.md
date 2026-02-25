# 🏠 RealEstate SaaS Platform

Plataforma multi-tenant de gestión inmobiliaria con publicación automatizada en redes sociales.

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                       VERCEL (Edge)                          │
│                                                             │
│  ┌─────────────────┐    ┌──────────────────────────────┐   │
│  │   Admin Panel   │    │    Sitio Web Público          │   │
│  │  /admin/*       │    │    /[agency-slug]/*           │   │
│  │                 │    │                              │   │
│  │  Dashboard      │    │  Home                        │   │
│  │  Propiedades    │    │  Propiedades                 │   │
│  │  Clientes       │    │  Búsqueda                    │   │
│  │  Usuarios       │    │  Contacto                    │   │
│  │  Configuración  │    │  SEO + Sitemap               │   │
│  └────────┬────────┘    └──────────────┬───────────────┘   │
│           │                           │                     │
│  ┌────────▼───────────────────────────▼───────────────┐    │
│  │              Server Actions / API Routes            │    │
│  │                                                    │    │
│  │  property.actions.ts    publication.actions.ts    │    │
│  │  client.actions.ts      auth.actions.ts           │    │
│  └────────────────────────────┬───────────────────────┘    │
│                               │                             │
│  ┌────────────────────────────▼───────────────────────┐    │
│  │              Vercel Cron (cada minuto)              │    │
│  │              /api/cron/publish-worker              │    │
│  └────────────────────────────────────────────────────┘    │
└───────────────────────────────┬─────────────────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
     ┌────────▼───────┐ ┌──────▼──────┐ ┌───────▼──────┐
     │   Supabase     │ │  Meta API   │ │   Supabase   │
     │   Postgres     │ │ Instagram   │ │   Storage    │
     │   + Auth       │ │  Facebook   │ │   (Media)    │
     │   + RLS        │ └─────────────┘ └──────────────┘
     └────────────────┘
```

## Módulos

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| Auth & Multi-tenant | ✅ | Roles, RLS, invitaciones |
| Admin Panel | ✅ | Dashboard, CRUD completo |
| Gestión de Propiedades | ✅ | Formulario completo, estados |
| Sistema de Media | ✅ | Upload, reorder, cover |
| Sitio Web Público | ✅ | SEO, responsive, sitemap |
| Client Matching | ✅ | Algoritmo de puntuación |
| Redes Sociales | ✅ | IG Feed/Reels + FB Feed/Reels |
| Analytics | ✅ | Dashboard con métricas |
| Worker Cron | ✅ | Retry con backoff exponencial |

## Setup Rápido

### 1. Clonar e instalar

```bash
git clone <repo>
cd realestate-saas
npm install
```

### 2. Supabase

```bash
# Crear proyecto en supabase.com
# Ejecutar migraciones:
npx supabase db push
# O manualmente en SQL Editor de Supabase
```

### 3. Variables de entorno

```bash
cp .env.example .env.local
# Editar .env.local con tus valores
```

### 4. Meta App

1. Crear app en [developers.facebook.com](https://developers.facebook.com)
2. Agregar productos: Facebook Login, Instagram Graph API
3. Configurar redirect URI: `{APP_URL}/api/meta/callback`
4. Agregar META_APP_ID y META_APP_SECRET al .env

### 5. Ejecutar

```bash
npm run dev
```

## Flujo Multi-Tenant

1. Agencia se registra → se crea `agency` record
2. Usuario dueño se registra → `user` con `role=owner`
3. Dueño invita usuarios → `user_invitations` con token
4. Usuario acepta → crea cuenta con `agency_id` y rol
5. Todo dato lleva `agency_id` → RLS aísla completamente

## Flujo de Publicación Social

```
1. Agente selecciona propiedad
2. Va a /admin/properties/{id}/publish
3. Selecciona plataforma(s) + media + caption
4. Crea PublicationJob (status: PENDING)
5. Cron ejecuta cada minuto
6. Worker bloquea job (status: UPLOADING)
7. Llama Meta API → create container → wait → publish
8. Actualiza job (status: PUBLISHED o ERROR)
9. Si error: retry con backoff exponencial (1min, 5min, 15min)
```

## Seguridad

- ✅ Tokens Meta almacenados solo server-side (nunca expuestos al cliente)
- ✅ RLS en todas las tablas (aislamiento total por agency_id)
- ✅ CRON_SECRET para proteger endpoints de cron
- ✅ Server Actions verifican auth en cada llamada
- ✅ Audit log de todas las operaciones críticas
- ✅ Rate limiting en API routes (recomendado: Upstash/Redis)

## Estructura de Carpetas

```
src/
├── app/
│   ├── admin/                    # Panel administrativo
│   │   ├── layout.tsx            # Layout con sidebar
│   │   ├── dashboard/page.tsx    # Dashboard principal
│   │   ├── properties/           # CRUD propiedades
│   │   ├── clients/              # Gestión clientes
│   │   ├── users/                # Gestión usuarios
│   │   └── settings/             # Configuración
│   ├── (public)/
│   │   └── [slug]/               # Sitio web por agencia
│   │       ├── page.tsx          # Home
│   │       ├── propiedades/      # Listado + detalle
│   │       ├── buscar/           # Búsqueda avanzada
│   │       └── contacto/         # Contacto
│   └── api/
│       ├── cron/publish-worker/  # Cron endpoint
│       └── meta/                 # OAuth Meta
├── actions/                      # Server Actions
│   ├── property.actions.ts
│   ├── publication.actions.ts
│   └── client.actions.ts
├── components/
│   ├── admin/                    # Componentes admin
│   └── public/                   # Componentes públicos
├── lib/
│   ├── supabase/                 # Clientes Supabase
│   ├── meta/                     # Publisher Meta API
│   ├── matching/                 # Algoritmo matching
│   └── utils/                    # Utilidades
├── types/                        # TypeScript types
└── workers/                      # Worker lógica
    └── publication-worker.ts
supabase/
└── migrations/
    ├── 001_initial_schema.sql    # Schema completo
    └── 002_rls_policies.sql      # Políticas RLS
```

## Licencia

Propietario. Todos los derechos reservados.
