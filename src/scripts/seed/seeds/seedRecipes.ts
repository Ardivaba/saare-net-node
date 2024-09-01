import { Recipe } from "../../../entities/Recipe";

function randFloat(min: number, max: number): number {
    return Math.floor(min + Math.random() * (max - min));
}

export async function seedRecipes() {
    const recipes = [
        { code: 211080, description: "Ujukinöör 2 g/m 1m toornimesse (plast kast)", rope_length: 1 },
        { code: 211449, description: "Ujukinöör 2 g/m 550m lattu (kast)", rope_length: 550 },
        { code: 211468, description: "Ujukinöör 2 g/m 275m lattu (kast)", rope_length: 275 },
        { code: 211031, description: "Ujukinöör 2 g/m 100m lattu (kott)", rope_length: 100 },
        { code: 211441, description: "Ujukinöör 2.5 g/m 550m lattu (kast)", rope_length: 550 },
        { code: 211440, description: "Ujukinöör 2.5 g/m 275m lattu (kast)", rope_length: 275 },
        { code: 211103, description: "Ujukinöör 3 g/m 1m toornimesse (plast kast)", rope_length: 1 },
        { code: 211442, description: "Ujukinöör 3 g/m 550m lattu (kast)", rope_length: 550 },
        { code: 211035, description: "Ujukinöör 3.5 g/m 1m toornimesse (plast kast)", rope_length: 1 },
        { code: 211443, description: "Ujukinöör 3.5 g/m 550m lattu (kast)", rope_length: 550 },
        { code: 211471, description: "Ujukinöör 3.5 g/m 275m lattu (kast)", rope_length: 275 },
        { code: 211040, description: "Ujukinöör 3.5 g/m 100m lattu (kott)", rope_length: 100 },
        { code: 211444, description: "Ujukinöör 4 g/m 550m lattu (kast)", rope_length: 550 },
        { code: 211460, description: "Ujukinöör 4 g/m 275m lattu (kast)", rope_length: 275 },
        { code: 211045, description: "Ujukinöör 4.5 g/m toornimesse (plast kast)", rope_length: 1 },
        { code: 211445, description: "Ujukinöör 4.5 g/m 550m lattu (kast)", rope_length: 550 },
        { code: 211461, description: "Ujukinöör 4.5 g/m 275m lattu (kast)", rope_length: 275 },
        { code: 211050, description: "Ujukinöör 5 g/m 1m toornimesse (plast kast)", rope_length: 1 },
        { code: 211450, description: "Ujukinöör 5 g/m 550m lattu (kast)", rope_length: 550 },
        { code: 211462, description: "Ujukinöör 5 g/m 275m lattu (kast)", rope_length: 275 },
        { code: 211055, description: "Ujukinöör 5.5 g/m 1m toornimesse (plast kast)", rope_length: 1 },
        { code: 211446, description: "Ujukinöör 5.5 g/m 550m lattu (kast)", rope_length: 550 },
        { code: 211056, description: "Ujukinöör 5.5 g/m 275m lattu (kast)", rope_length: 275 },
        { code: 211065, description: "Ujukinöör 6.5 g/m 1m toornimesse (plast kast)", rope_length: 1 },
        { code: 211447, description: "Ujukinöör 6.5 g/m 550m lattu (kast)", rope_length: 550 },
    ];

    for (const recipeData of recipes) {
        const recipe = new Recipe();
        recipe.code = recipeData.code;
        recipe.description = recipeData.description;
        recipe.rope_length = recipeData.rope_length;
        recipe.float_gap = randFloat(30, 900);
        recipe.float_length = randFloat(10, 100);
        recipe.created_at = new Date(Date.now() - Math.random() * 100 * 24 * 3600000);
        recipe.updated_at = new Date();

        await recipe.save();
    }
    console.log('Recipes seeded');
}
