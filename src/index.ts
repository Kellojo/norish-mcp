import "dotenv/config";
import type { Request, Response, NextFunction } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import http from "node:http";
import { z } from "zod/v4";
import { norishFetch } from "./api.js";

const MCP_API_KEY = process.env.MCP_API_KEY;
const AUTH_ENABLED = process.env.MCP_AUTH_ENABLED !== "false";

if (AUTH_ENABLED && !MCP_API_KEY) {
  console.error("MCP_API_KEY environment variable is required for authentication");
  process.exit(1);
}

function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!AUTH_ENABLED) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.writeHead(401).end(JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Unauthorized: missing or invalid Authorization header. Use 'Bearer <MCP_API_KEY>'.",
      },
      id: null,
    }));
    return;
  }

  const providedKey = authHeader.slice(7);
  if (providedKey !== MCP_API_KEY) {
    res.writeHead(401).end(JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Unauthorized: invalid API key.",
      },
      id: null,
    }));
    return;
  }

  next();
}
import { getRecipeById } from "./tools/getRecipe.js";
import { listRecipes } from "./tools/listRecipes.js";
import {
  getTodayPlannedRecipes,
  getWeekPlannedRecipes,
  getMonthPlannedRecipes,
  addToPlan,
  removeFromPlan,
} from "./tools/plannedRecipes.js";
import { createRecipe } from "./tools/createRecipe.js";
import { importRecipeByUrl, importRecipeByPaste } from "./tools/importRecipe.js";
import {
  listGroceries,
  createGrocery,
  markGroceryAsDone,
  markGroceryAsUndone,
  deleteGrocery,
  assignGroceryToStore,
} from "./tools/grocery.js";
import { listStores, createStore } from "./tools/stores.js";

const server = new McpServer({
  name: "norish-mcp",
  version: "1.0.0",
});

server.registerTool(
  "health_check",
  {
    description: "Check the Norish API health, including database and parser service status.",
    inputSchema: {},
  },
  async () => {
    try {
      const result = await norishFetch("/health");
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error checking health: ${message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "get_recipe",
  {
    description: "Get a recipe by its ID, including ingredients and cooking steps.",
    inputSchema: { id: z.string() },
  },
  async ({ id }) => {
    try {
      const recipe = await getRecipeById(id);
      if (!recipe) {
        return {
          content: [{ type: "text", text: `Recipe with ID "${id}" not found.` }],
        };
      }
      return {
        content: [{ type: "text", text: JSON.stringify(recipe, null, 2) }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error fetching recipe: ${message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "list_recipes",
  {
    description: "List all recipes from Norish with optional search and pagination.",
    inputSchema: {
      limit: z.number().optional(),
      cursor: z.number().optional(),
      search: z.string().optional(),
    },
  },
  async ({ limit, cursor, search }) => {
    try {
      const result = await listRecipes({ limit, cursor, search });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error listing recipes: ${message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "get_today_planned_recipes",
  {
    description: "Get planned recipes for today.",
    inputSchema: {},
  },
  async () => {
    try {
      const result = await getTodayPlannedRecipes();
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error fetching today's planned recipes: ${message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "get_week_planned_recipes",
  {
    description: "Get planned recipes for the current week.",
    inputSchema: {},
  },
  async () => {
    try {
      const result = await getWeekPlannedRecipes();
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error fetching week's planned recipes: ${message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "get_month_planned_recipes",
  {
    description: "Get planned recipes for the current month.",
    inputSchema: {},
  },
  async () => {
    try {
      const result = await getMonthPlannedRecipes();
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error fetching month's planned recipes: ${message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "add_to_plan",
  {
    description: "Add a recipe to your meal plan for a specific date and slot.",
    inputSchema: {
      date: z.string().describe("Date in YYYY-MM-DD format"),
      slot: z.enum(["Breakfast", "Lunch", "Dinner", "Snack"]).describe("Meal slot"),
      recipeId: z.string().describe("Recipe ID to add to plan"),
    },
  },
  async ({ date, slot, recipeId }) => {
    try {
      const result = await addToPlan({ date, slot, recipeId });
      return {
        content: [{ type: "text", text: `Successfully added to plan. Item ID: ${result.id}` }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error adding to plan: ${message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "remove_from_plan",
  {
    description: "Remove a planned recipe item from your meal plan.",
    inputSchema: {
      itemId: z.string().describe("ID of the planned item to remove"),
      version: z.number().describe("Version number for optimistic concurrency control"),
    },
  },
  async ({ itemId, version }) => {
    try {
      const result = await removeFromPlan({ itemId, version });
      if (result.stale) {
        return {
          content: [{ type: "text", text: `Item removed but a newer version exists. Please refresh and try again.` }],
        };
      }
      return {
        content: [{ type: "text", text: `Successfully removed item ${itemId} from plan.` }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error removing from plan: ${message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "create_recipe",
  {
    description: "Create a new recipe directly with structured data.",
    inputSchema: {
      name: z.string().describe("Recipe name"),
      description: z.string().optional(),
      servings: z.number().int().positive().describe("Number of servings"),
      prepMinutes: z.number().int().nonnegative().optional(),
      cookMinutes: z.number().int().nonnegative().optional(),
      totalMinutes: z.number().int().nonnegative().optional(),
      notes: z.string().optional(),
      systemUsed: z.enum(["metric", "us"]).describe("Unit system for measurements"),
      calories: z.number().int().positive().optional(),
      fat: z.string().optional(),
      carbs: z.string().optional(),
      protein: z.string().optional(),
      categories: z.array(z.enum(["Breakfast", "Lunch", "Dinner", "Snack"])).describe("Meal categories"),
    },
  },
  async (input) => {
    try {
      const result = await createRecipe(input);
      return {
        content: [{ type: "text", text: `Successfully created recipe with ID: ${result.id}` }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error creating recipe: ${message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "import_recipe_url",
  {
    description: "Import a recipe from a URL. The server will parse the webpage and create a recipe.",
    inputSchema: {
      url: z.string().url().describe("URL of the recipe page to import"),
      forceAI: z.boolean().optional(),
    },
  },
  async ({ url, forceAI }) => {
    try {
      const result = await importRecipeByUrl({ url, forceAI });
      return {
        content: [{ type: "text", text: `Successfully queued recipe import. Recipe ID: ${result}` }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error importing recipe from URL: ${message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "import_recipe_text",
  {
    description: "Import a recipe from pasted text (plain text, JSON-LD, or YAML).",
    inputSchema: {
      text: z.string().describe("Recipe text in plain text, JSON-LD format, or YAML"),
      forceAI: z.boolean().optional(),
    },
  },
  async ({ text, forceAI }) => {
    try {
      const result = await importRecipeByPaste({ text, forceAI });
      return {
        content: [{ type: "text", text: `Successfully imported recipe(s). IDs: ${result.recipeIds.join(", ")}` }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error importing recipe from text: ${message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "grocery_list",
  {
    description: "List all groceries in the shopping list.",
    inputSchema: {},
  },
  async () => {
    try {
      const result = await listGroceries();
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error listing groceries: ${message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "grocery_create",
  {
    description: "Create a new grocery item for the shopping list.",
    inputSchema: {
      name: z.string().describe("Name of the grocery item"),
      unit: z.string().describe("Unit of measurement (e.g., 'pcs', 'kg', 'g')"),
      amount: z.number().positive().describe("Amount needed"),
      isDone: z.boolean().optional(),
    },
  },
  async ({ name, unit, amount, isDone }) => {
    try {
      const result = await createGrocery({ name, unit, amount, isDone });
      return {
        content: [{ type: "text", text: `Successfully created grocery item. ID: ${result.id}` }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error creating grocery item: ${message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "grocery_mark_done",
  {
    description: "Mark a grocery item as done (checked off).",
    inputSchema: {
      id: z.string().describe("Grocery item ID"),
      version: z.number().int().positive().describe("Version number for optimistic concurrency control"),
    },
  },
  async ({ id, version }) => {
    try {
      const result = await markGroceryAsDone(id, version);
      if (result.stale) {
        return {
          content: [{ type: "text", text: `Item marked as done but a newer version exists. Please refresh and try again.` }],
        };
      }
      return {
        content: [{ type: "text", text: `Successfully marked grocery item ${id} as done.` }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error marking grocery item as done: ${message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "grocery_mark_undone",
  {
    description: "Mark a grocery item as not done (unchecked).",
    inputSchema: {
      id: z.string().describe("Grocery item ID"),
      version: z.number().int().positive().describe("Version number for optimistic concurrency control"),
    },
  },
  async ({ id, version }) => {
    try {
      const result = await markGroceryAsUndone(id, version);
      if (result.stale) {
        return {
          content: [{ type: "text", text: `Item marked as undone but a newer version exists. Please refresh and try again.` }],
        };
      }
      return {
        content: [{ type: "text", text: `Successfully marked grocery item ${id} as undone.` }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error marking grocery item as undone: ${message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "grocery_delete",
  {
    description: "Delete a grocery item from the shopping list.",
    inputSchema: {
      id: z.string().describe("Grocery item ID"),
      version: z.number().int().positive().describe("Version number for optimistic concurrency control"),
    },
  },
  async ({ id, version }) => {
    try {
      const result = await deleteGrocery(id, version);
      if (result.stale) {
        return {
          content: [{ type: "text", text: `Item deleted but a newer version exists. Please refresh and try again.` }],
        };
      }
      return {
        content: [{ type: "text", text: `Successfully deleted grocery item ${id}.` }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error deleting grocery item: ${message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "grocery_assign_store",
  {
    description: "Assign a grocery item to a specific store.",
    inputSchema: {
      id: z.string().describe("Grocery item ID"),
      storeId: z.string().optional(),
      version: z.number().int().positive().describe("Version number for optimistic concurrency control"),
    },
  },
  async ({ id, storeId, version }) => {
    try {
      const result = await assignGroceryToStore(id, { storeId: storeId ?? null, version });
      if (result.stale) {
        return {
          content: [{ type: "text", text: `Item assigned to store but a newer version exists. Please refresh and try again.` }],
        };
      }
      return {
        content: [{ type: "text", text: `Successfully assigned grocery item ${id} to store ${storeId ?? "unassigned"}.` }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error assigning grocery item to store: ${message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "list_stores",
  {
    description: "List all stores.",
    inputSchema: {},
  },
  async () => {
    try {
      const result = await listStores();
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error listing stores: ${message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "create_store",
  {
    description: "Create a new store.",
    inputSchema: {
      name: z.string().describe("Store name"),
      color: z.enum(["primary", "secondary", "success", "warning", "danger", "slate", "sky", "violet"]).optional(),
      icon: z.string().optional(),
    },
  },
  async ({ name, color, icon }) => {
    try {
      const result = await createStore({ name, color, icon });
      return {
        content: [{ type: "text", text: `Successfully created store with ID: ${result.id}` }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error creating store: ${message}` }],
        isError: true,
      };
    }
  }
);

const ALLOWED_HOSTS = process.env.ALLOWED_HOSTS?.split(',') || ['meals.mcp.nashor.cloud'];

const app = createMcpExpressApp({ allowedHosts: ALLOWED_HOSTS });
app.use(authMiddleware);

app.post("/mcp", async (req, res) => {
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on("close", () => {
      console.log("Request closed");
      transport.close();
      server.close();
    });
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

app.get("/mcp", async (req, res) => {
  console.log("Received GET MCP request");
  res.writeHead(405).end(JSON.stringify({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "Method not allowed.",
    },
    id: null,
  }));
});

app.delete("/mcp", async (req, res) => {
  console.log("Received DELETE MCP request");
  res.writeHead(405).end(JSON.stringify({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "Method not allowed.",
    },
    id: null,
  }));
});

const PORT = parseInt(process.env.PORT || "3001");
http.createServer(app).listen(PORT, () => {
  console.log(`Norish MCP Server running on http://localhost:${PORT}`);
  console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(AUTH_ENABLED ? `Authentication is enabled.` : `Authentication is disabled - no API key required.`);
});

process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  process.exit(0);
});
