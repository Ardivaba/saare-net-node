import { Machine } from "../../../entities/Machine";
import { Production } from "../../../entities/Production";
import { Recipe } from "../../../entities/Recipe";
import { Order } from "../../../entities/Order";
import { NumProductions } from "../../seed";

export async function seedProductions() {
    const recipes = await Recipe.find();
    const machines = await Machine.find();
    const orders = await Order.find({ relations: ['recipe'] });

    if (machines.length === 0) {
        console.error('No machines found, cannot create productions');
        return;
    }
    if (orders.length === 0) {
        console.error('No orders found, cannot create productions with order relations');
        return;
    }
    if (recipes.length === 0) {
        console.error('No recipes found, cannot create productions');
        return;
    }

    for (let i = 0; i < NumProductions; i++) {
        const startDate = new Date(Date.now() - Math.random() * 30 * 24 * 3600000);
        const endDate = new Date(startDate.getTime() + Math.random() * 24 * 3600000);
        const production = new Production();
        production.start_date = startDate;
        production.end_date = endDate;
        production.start_quantity = 0;
        production.produced_quantity = Math.random() * 1000;
        production.created_at = startDate;
        production.updated_at = endDate;

        // 75% chance to create machine relation
        if (Math.random() < 0.75) {
            const machine = machines[Math.floor(Math.random() * machines.length)];
            production.machine = machine;
            production.machine_id = machine.id;
        }

        // 75% chance to create order relation
        if (Math.random() < 0.75) {
            let order: Order | null = null;
            let attempts = 0;
            const maxAttempts = 10;

            // Try to find an order with a recipe
            while (!order && attempts < maxAttempts) {
                const randomOrder = orders[Math.floor(Math.random() * orders.length)];
                if (randomOrder.recipe) {
                    order = randomOrder;
                }
                attempts++;
            }

            if (order && order.recipe) {
                production.order = order;
                production.order_id = order.id;
                production.recipe_code = order.recipe.code;
            } else {
                // If no suitable order found, use a random recipe
                const recipe = recipes[Math.floor(Math.random() * recipes.length)];
                production.recipe_code = recipe.code;
            }
        } else {
            // If no order is assigned, use a random recipe
            const recipe = recipes[Math.floor(Math.random() * recipes.length)];
            production.recipe_code = recipe.code;
        }

        await production.save();
    }

    console.log('Productions seeded');
}