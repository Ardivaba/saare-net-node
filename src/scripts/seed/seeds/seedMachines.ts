import { Machine, MachineState } from "../../../entities/Machine";
import { Worker } from "../../../entities/Worker";
import { Recipe } from "../../../entities/Recipe";
import { NumMachines } from "../../seed";

function randomMachineState(): MachineState {
    const states: MachineState[] = [
        MachineState.Producing,
        MachineState.Waiting,
        MachineState.Off,
    ];
    return states[Math.floor(Math.random() * states.length)];
}

export async function seedMachines() {
    const workers = await Worker.find();
    const recipes = await Recipe.find();

    for (let i = 1; i <= NumMachines; i++) {
        const machine = new Machine();
        machine.ip = "192.168.1.147";
        machine.recipe_code = i;
        machine.name = `MASIN-${i}`;
        machine.produced_rope_length = Math.random() * 1000;
        machine.off_time = Math.floor(Math.random() * 24 * 3600000);
        machine.idle_time = Math.floor(Math.random() * 60 * 60000);
        machine.producing_time = Math.floor(Math.random() * 24 * 3600000);
        machine.state = randomMachineState();
        machine.recipe_loaded = true;

        if (Math.random() < 0.7) {
            const recipe = recipes[Math.floor(Math.random() * recipes.length)];
            machine.float_length = recipe.float_length;
            machine.float_gap = recipe.float_gap;
            machine.rope_length = recipe.rope_length;
        }

        if (Math.random() < 0.5) {
            const worker = workers[Math.floor(Math.random() * workers.length)];
            machine.worker = worker;
        }

        await machine.save();
    }
    console.log('Machines seeded');
}
