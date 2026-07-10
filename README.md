# Norish MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server that provides AI assistants with access to the [Norish](https://github.com/norish-recipes/norish) recipe management API.

Connect your LLM client to your personal Norish instance for recipe browsing, meal planning, and grocery list management — all through a standardized MCP interface.

## Features

This server exposes the following tools:

### Recipes

| Tool                 | Description                                                     |
| -------------------- | --------------------------------------------------------------- |
| `get_recipe`         | Get a recipe by ID with ingredients and cooking steps           |
| `list_recipes`       | List recipes with optional search and pagination                |
| `create_recipe`      | Create a new recipe directly with structured data               |
| `import_recipe_url`  | Import a recipe from a URL (parses webpage)                     |
| `import_recipe_text` | Import a recipe from pasted text (plain text, JSON-LD, or YAML) |

### Meal Planning

| Tool                        | Description                                                 |
| --------------------------- | ----------------------------------------------------------- |
| `get_today_planned_recipes` | Get planned recipes for today                               |
| `get_week_planned_recipes`  | Get planned recipes for the current week                    |
| `get_month_planned_recipes` | Get planned recipes for the current month                   |
| `add_to_plan`               | Add a recipe to your meal plan for a specific date and slot |
| `remove_from_plan`          | Remove a planned recipe item from your meal plan            |

### Grocery List

| Tool                   | Description                                   |
| ---------------------- | --------------------------------------------- |
| `grocery_list`         | List all items in the shopping list           |
| `grocery_create`       | Create a new grocery item                     |
| `grocery_mark_done`    | Mark a grocery item as done (checked off)     |
| `grocery_mark_undone`  | Uncheck a previously checked-off grocery item |
| `grocery_delete`       | Delete a grocery item from the shopping list  |
| `grocery_assign_store` | Assign a grocery item to a specific store     |

### Stores

| Tool           | Description                                   |
| -------------- | --------------------------------------------- |
| `list_stores`  | List all stores                               |
| `create_store` | Create a new store with name, color, and icon |

### System

| Tool           | Description                                             |
| -------------- | ------------------------------------------------------- |
| `health_check` | Check the Norish API health (DB, parser service status) |

## Prerequisites

- [Node.js](https://nodejs.org/) v22+ or Docker Compose
- A running [Norish](https://github.com/norish-recipes/norish) instance with API access
- Your Norish `NORISH_API_KEY` (generate from your Norish account settings)

## Setup

### 1. Clone and install dependencies

```bash
git clone <this-repo-url>
cd norish-mcp
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable         | Required           | Description                                                                                                                                      |
| ---------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NORISH_API_URL` | Yes                | The URL of your running Norish instance (e.g. `https://meals.nashor.cloud:6002`)                                                                 |
| `NORISH_API_KEY` | Yes                | Your API key from the Norish instance                                                                                                            |
| `MCP_AUTH_ENABLED` | No (default: `true`) | Set to `"false"` to disable authentication entirely. When enabled, `MCP_API_KEY` is required.                  |
| `MCP_API_KEY`    | Yes (when auth enabled)                | Secret key for authenticating requests to this MCP server. Clients must send it as a `Bearer` token in the `Authorization` header.               |
| `ALLOWED_HOSTS`  | No                 | Comma-separated list of allowed hostnames for DNS rebinding protection (e.g., `"norish-mcp.my.domain"`). Defaults to `['norish-mcp.my.domain']`. |
| `PORT`           | No (default: 3001) | Port the MCP server listens on                                                                                                                   |

### 3. Build and run

**Development mode:**

```bash
npm run dev
```

**Production build:**

```bash
npm run build
npm start
```

The server starts on `http://localhost:<PORT>` with the MCP endpoint at `POST /mcp`.

## Docker (Recommended)

The easiest way to run this server is with Docker Compose using the official image:

```yaml
# docker-compose.yml
services:
  norish-mcp:
    image: ghcr.io/kellojo/norish-mcp:latest
    container_name: norish-mcp
    ports:
      - "3001:3001"
    env_file: .env
```

Create a `.env` file in the same directory:

```bash
NORISH_API_URL=https://your-norish-instance.com:6002
NORISH_API_KEY=your-api-key-here
MCP_API_KEY=your-secret-mcp-key
PORT=3001
```

Then start it:

```bash
docker compose up -d
```

The server will be available at `http://localhost:3001` with the MCP endpoint at `POST /mcp`.

### Running Directly

Pull and run without Docker Compose:

```bash
docker pull ghcr.io/kellojo/norish-mcp:latest

docker run -d \
  --name norish-mcp \
  -p 3001:3001 \
  --env-file .env \
  ghcr.io/kellojo/norish-mcp:latest
```

### Building from Source

If you prefer to build locally:

```bash
docker compose build
docker compose up -d
```

## Authentication

By default, the server requires a Bearer token on every request:

```
Authorization: Bearer <MCP_API_KEY>
```

Requests without a valid token are rejected with a `401 Unauthorized` error before reaching the MCP handler. This prevents unauthenticated access when exposing the server publicly.

To disable authentication (e.g., for local-only development), set `MCP_AUTH_ENABLED=false` in your `.env`. When disabled, no API key is required and clients can connect without an `Authorization` header.

## Client Configuration

### Claude Desktop (via mcp.json)

Add this to your Claude Desktop configuration (`mcp.json`):

```json
{
  "mcpServers": {
    "norish": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "NORISH_API_URL": "https://your-norish-instance.com:6002",
        "NORISH_API_KEY": "<your-norish-api-key>",
        "MCP_API_KEY": "<your-mcp-api-key>"
      }
    }
  }
}
```

### Other MCP Clients

For HTTP-based clients, point them to the server's endpoint with the auth header:

- **URL:** `http://localhost:<PORT>/mcp`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <MCP_API_KEY>`, `Content-Type: application/json`

## License

MIT
