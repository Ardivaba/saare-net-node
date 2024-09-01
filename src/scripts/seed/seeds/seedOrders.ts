import { Order } from "../../../entities/Order";
import { Recipe } from "../../../entities/Recipe";
import { NumOrders } from "../../seed";

export async function seedOrders() {
    const recipes = await Recipe.find();

    for (let i = 1; i <= NumOrders; i++) {
        const amount_ordered = Math.floor(Math.random() * 10) + 1;
        const amount_produced = Math.floor(Math.random() * (amount_ordered + 1));
        const is_finished = amount_produced >= amount_ordered;

        const order = new Order();
        order.info = `Tellimus nr ${i}`;
        order.amount_ordered = amount_ordered;
        order.amount_produced = amount_produced;
        order.is_finished = is_finished;
        order.created_at = new Date(Date.now() - Math.random() * 100 * 24 * 3600000);
        order.updated_at = new Date();

        // 75% chance to add recipe relation
        if (Math.random() < 0.75 && recipes.length > 0) {
            const recipe = recipes[Math.floor(Math.random() * recipes.length)];
            order.recipe = recipe; // Directly set the recipe_id
            order.info += ` - ${recipe.description}`;
        }

        await order.save();
    }

    console.log('Orders seeded');
}