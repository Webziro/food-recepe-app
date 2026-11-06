import express from "express";
import cors from "cors";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { favoritesTable } from "./db/schema.js";
import { and, eq } from "drizzle-orm";
import job from "./config/cron.js";
import { requireAuth } from "./middleware/require-auth.js";

const app = express();
const PORT = ENV.PORT || 5001;

if (ENV.NODE_ENV === "production") job.start();

app.use(express.json());
app.use(cors());

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true });
});

app.post("/api/favorites", requireAuth, async (req, res) => {
  try {
    const { recipeId, title, image, cookTime, servings } = req.body;
    const parsedRecipeId = Number(recipeId);

    if (
      !Number.isInteger(parsedRecipeId) ||
      parsedRecipeId <= 0 ||
      typeof title !== "string" ||
      !title.trim()
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newFavorite = await db
      .insert(favoritesTable)
      .values({
        userId: req.authUser.id,
        recipeId: parsedRecipeId,
        title: title.trim(),
        image,
        cookTime,
        servings,
      })
      .returning();

    res.status(201).json(newFavorite[0]);
  } catch (error) {
    console.log("Error adding favorite", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/favorites", requireAuth, async (req, res) => {
  try {
    const userFavorites = await db
      .select()
      .from(favoritesTable)
      .where(eq(favoritesTable.userId, req.authUser.id));

    res.status(200).json(userFavorites);
  } catch (error) {
    console.log("Error fetching the favorites", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.delete("/api/favorites/:recipeId", requireAuth, async (req, res) => {
  try {
    const recipeId = Number(req.params.recipeId);
    if (!Number.isInteger(recipeId) || recipeId <= 0) {
      return res.status(400).json({ error: "Invalid recipe ID" });
    }

    await db
      .delete(favoritesTable)
      .where(
        and(eq(favoritesTable.userId, req.authUser.id), eq(favoritesTable.recipeId, recipeId))
      );

    res.status(200).json({ message: "Favorite removed successfully" });
  } catch (error) {
    console.log("Error removing a favorite", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log("Server is running on PORT:", PORT);
});
