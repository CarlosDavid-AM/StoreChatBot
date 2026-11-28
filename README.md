# 🛒 ElectroBot - Asistente Virtual para Tienda de Electrónica (StoreFinal)

**ElectroBot** es un sistema web integral compuesto por un servidor backend en **Node.js (Express)**, una base de datos **MySQL** normalizada y un frontend interactivo. Su objetivo principal es brindar atención automatizada y personalizada a clientes de una tienda de electrónica a través de un asistente de Inteligencia Artificial (impulsado por OpenAI y Tool Calling), capaz de consultar inventario, brindar especificaciones técnicas, detallar métodos de pago y registrar estadísticas de consultas en tiempo real.

---

## 🚀 Características Principales

- **Chatbot Inteligente con Function Calling**: Conectado a la API de OpenAI, utiliza herramientas (tools) para interactuar directamente con la base de datos MySQL en tiempo real:
  - `buscar_productos`: Búsqueda y filtrado por categoría, marca o modelo.
  - `obtener_especificaciones`: Consulta técnica a detalle de cada producto.
  - `registrar_consulta`: Registro automático de métricas de interés por producto.
  - `productos_mas_consultados`: Consulta del ranking de popularidad.
- **Filtro de Contenido (Lista Negra)**: Protección ante preguntas fuera de contexto o inapropiadas.
- **Historial y Manejo de Hilos**: Soporte para continuar conversaciones mediante identificadores de hilo (`thread_id`).
- **Base de Datos Normalizada (3FN)**: Almacena productos, especificaciones técnicas y registros históricos de consultas.
- **API REST de Verificación**: Endpoints adicionales para auditar y verificar el estado de productos y métricas de consultas.
- **Frontend Moderno**: Interfaz web limpia y responsiva (Single Page Application) servida directamente por Express para chatear y explorar productos.

---

## 🛠️ Tecnologías Utilizadas

- **Entorno de ejecución**: [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- **Framework Web**: [Express 5](https://expressjs.com/)
- **Base de Datos**: [MySQL](https://www.mysql.com/) con el driver [`mysql2`](https://github.com/sidorares/node-mysql2) (soporte para promesas y pool de conexiones)
- **Inteligencia Artificial**: [OpenAI Node.js SDK](https://github.com/openai/openai-node)
- **Frontend**: HTML5, CSS3 y JavaScript moderno (Vanilla)
- **Otras dependencias**: `dotenv` (gestión de variables de entorno), `cors` y `nodemon` (recarga en desarrollo)

---

## 📁 Estructura del Proyecto

```text
├── public/                 # Archivos estáticos del Frontend
│   ├── css/style.css       # Estilos de la aplicación web
│   ├── js/                 # Lógica del cliente (app, api, storage)
│   └── index.html          # Interfaz de usuario del chat
├── src/
│   ├── chatbot/            # Lógica central del chatbot
│   │   ├── blacklist.js    # Filtro de palabras restringidas
│   │   ├── chatService.js  # Orquestador del ciclo de vida del chat e IA
│   │   ├── toolHandlers.js # Ejecución de consultas SQL para las tools
│   │   └── tools.js        # Declaración de herramientas para OpenAI
│   ├── config/             # Configuración de conexiones
│   │   ├── db.js           # Conexión y Pool de MySQL
│   │   └── openai.js       # Cliente configurado de OpenAI
│   ├── router/             # Definición de rutas Express
│   │   ├── chat.js         # Endpoint del chatbot (/api/chat)
│   │   └── consultas.js    # Endpoints de verificación (/api/consultas)
│   └── sql/
│       └── STOREFINAL.sql  # Script de creación y población de la base de datos
├── .env.example            # Plantilla de variables de entorno
├── index.js                # Punto de entrada de la aplicación
├── package.json            # Dependencias y scripts de ejecución
├── README.md               # Documentación del proyecto
└── StoreFinal.postman_collection.json # Colección de pruebas para Postman
```

---

## 📋 Requisitos Previos

Asegúrate de contar con lo siguiente instalado en tu entorno local:

1. [Node.js](https://nodejs.org/) (versión 18 o superior) y `npm`.
2. Servidor **MySQL** activo (puede ser mediante [XAMPP](https://www.apachefriends.org/), [WampServer](https://www.wampserver.com/), Docker o servicio MySQL nativo).
3. Una clave de API de **OpenAI** (o un proveedor compatible con la API de OpenAI).

---

## ⚙️ Pasos para Levantar el Proyecto

### 1. Clonar o acceder a la carpeta del proyecto

Abre una terminal en el directorio raíz del proyecto:

```bash
git clone https://github.com/CarlosDavid-AM/StoreChatBot.git
```

### 2. Acceder a la carpeta

Abre una terminal en el directorio raíz del proyecto:

```bash
cd StoreChatBot
```

### 3. Instalar dependencias

Descarga e instala las librerías necesarias ejecutando:

```bash
npm install
```

### 4. Configurar la Base de Datos en MySQL

1. Inicia tu gestor de MySQL (por ejemplo, el módulo MySQL en el panel de XAMPP o phpMyAdmin).
2. Abre la consola de MySQL o tu herramienta preferida (phpMyAdmin, MySQL Workbench, DBeaver) y ejecuta el script:
   - Archivo: `src/sql/STOREFINAL.sql`
3. Este script se encargará automáticamente de:
   - Crear la base de datos `STOREFINAL`.
   - Crear las tablas `productos`, `especificaciones` y `consultados`.
   - Insertar los datos iniciales de prueba.

### 5. Configurar las Variables de Entorno

Crea un archivo llamado `.env` en la raíz del proyecto (puedes copiar el archivo `.env.example`):

```bash
# En Windows (PowerShell):
Copy-Item .env.example .env

# En Linux/macOS o Git Bash:
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# Configuración OpenAI
PUNTO_CONECCION=
CLAVE=tu_api_key_de_openai_aqui
MODEL=gpt-4o-mini

# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_de_mysql
DB_NAME=STOREFINAL

# Puerto del Servidor Express
PORT=3000
```

> **Nota:** Si usas la API oficial de OpenAI directamente, `PUNTO_CONECCION` puede dejarse vacío a menos que utilices un proxy o endpoint personalizado (ej. Azure OpenAI o un gateway compatible).

### 6. Iniciar el Servidor

- **Modo Desarrollo** (con recarga automática mediante Nodemon):

  ```bash
  npm run dev
  ```

- **Modo Producción**:
  ```bash
  npm start
  ```

Al iniciar correctamente, verás en la consola:

```text
Servidor corriendo en http://localhost:3000
```

### 7. Acceder a la Aplicación

Abre tu navegador web e ingresa a:
👉 **[http://localhost:3000](http://localhost:3000)**

Desde allí podrás interactuar en tiempo real con el asistente virtual **ElectroBot**.

---

## 🔌 Endpoints de la API

### Chatbot (Lógica de Negocio)

| Método | Endpoint    | Descripción                 | Body Requerido                                    |
| :----- | :---------- | :-------------------------- | :------------------------------------------------ |
| `POST` | `/api/chat` | Envía un mensaje al chatbot | `{ "mensaje": "texto", "thread_id": "opcional" }` |

### Consultas de Verificación y Estadísticas

| Método | Endpoint                                  | Descripción                                             |
| :----- | :---------------------------------------- | :------------------------------------------------------ |
| `GET`  | `/api/consultas/productos`                | Lista todos los productos disponibles                   |
| `GET`  | `/api/consultas/productos/:id`            | Detalle de un producto y sus especificaciones técnicas  |
| `GET`  | `/api/consultas/especificaciones`         | Lista completa de especificaciones registradas          |
| `GET`  | `/api/consultas/consultados`              | Registro histórico de consultas realizadas por clientes |
| `GET`  | `/api/consultas/consultados/ranking`      | Ranking de productos más consultados                    |
| `GET`  | `/api/consultas/consultados/producto/:id` | Historial de consultas de un producto en específico     |

---

## 📮 Pruebas con Postman

El proyecto incluye el archivo `StoreFinal.postman_collection.json` en la raíz. Puedes importarlo directamente en [Postman](https://www.postman.com/) para probar todos los endpoints disponibles tanto del chatbot como de las consultas de verificación.
