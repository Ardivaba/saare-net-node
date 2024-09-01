import { Router, Request, Response } from 'express';
import { Machine, MachineState } from '../entities/Machine';
import { Recipe } from '../entities/Recipe';

const router = Router();

// Get all machines
router.get('/', async (req: Request, res: Response) => {
    try {
        const machines = await Machine.find({ relations: ['worker'] });
        res.json(machines);
    } catch (error) {
        console.error('Error in GET /machines:', error);
        res.status(500).json({ error: 'Failed to retrieve machines' });
    }
});

// Get a specific machine
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const machine = await Machine.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ['worker']
        });
        if (!machine) {
            return res.status(404).json({ error: 'Machine not found' });
        }
        res.json(machine);
    } catch (error) {
        console.error('Error in GET /machines/:id:', error);
        res.status(500).json({ error: 'Failed to retrieve machine' });
    }
});

// Create a new machine
router.post('/', async (req: Request, res: Response) => {
    try {
        const machine = Machine.create(req.body as Partial<Machine>);
        await machine.save();
        res.status(201).json(machine);
    } catch (error) {
        console.error('Error in POST /machines:', error);
        res.status(500).json({ error: 'Failed to create machine' });
    }
});

// Update a machine
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const machine = await Machine.findOne({ where: { id: parseInt(req.params.id) } });
        if (!machine) {
            return res.status(404).json({ error: 'Machine not found' });
        }
        Machine.merge(machine, req.body as Partial<Machine>);
        const result = await machine.save();
        res.json(result);
    } catch (error) {
        console.error('Error in PUT /machines/:id:', error);
        res.status(500).json({ error: 'Failed to update machine' });
    }
});

// Delete a machine
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const machine = await Machine.findOne({ where: { id: parseInt(req.params.id) } });
        if (!machine) {
            return res.status(404).json({ error: 'Machine not found' });
        }
        await machine.remove();
        res.status(204).send();
    } catch (error) {
        console.error('Error in DELETE /machines/:id:', error);
        res.status(500).json({ error: 'Failed to delete machine' });
    }
});

// Load a recipe to a machine
router.post('/:id/load-recipe', async (req: Request, res: Response) => {
    try {
        const machine = await Machine.findOne({ where: { id: parseInt(req.params.id) } });
        if (!machine) {
            return res.status(404).json({ error: 'Machine not found' });
        }
        const { recipeCode, floatLength, floatGap, ropeLength } = req.body;
        const recipe = await Recipe.findOne({ where: { code: recipeCode } });
        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        machine.pending_code = recipeCode;
        machine.pending_float_length = floatLength;
        machine.pending_float_gap = floatGap;
        machine.pending_rope_length = ropeLength;
        machine.recipe_loaded = false;
        const result = await machine.save();
        res.json(result);
    } catch (error) {
        console.error('Error in POST /machines/:id/load-recipe:', error);
        res.status(500).json({ error: 'Failed to load recipe to machine' });
    }
});

export default router;