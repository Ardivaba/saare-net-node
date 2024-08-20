import { Router, Request, Response } from 'express';
import { Recipe } from '../entities/Recipe';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const {
            page = 1,
            per_page = 10,
            sort = 'id',
            direction = 'ASC',
            all = 'false'
        } = req.query;

        const queryBuilder = Recipe.createQueryBuilder('recipe');

        // Apply sorting
        const sortDirection = direction.toString().toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        queryBuilder.orderBy(`recipe.${sort}`, sortDirection as 'ASC' | 'DESC');

        if (all === 'true') {
            const recipes = await queryBuilder.getMany();
            return res.json({
                recipes,
                totalPages: 1,
                currentPage: 1
            });
        }

        const total = await queryBuilder.getCount();
        const recipes = await queryBuilder
            .skip((+page - 1) * +per_page)
            .take(+per_page)
            .getMany();

        res.json({
            recipes,
            totalPages: Math.ceil(total / +per_page),
            currentPage: +page
        });
    } catch (error) {
        console.error('Error in GET /recipes:', error);
        res.status(500).json({ error: 'Failed to retrieve recipes' });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const recipe = await Recipe.findOne({
            where: { id: parseInt(req.params.id) },
            withDeleted: true
        });
        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        res.json(recipe);
    } catch (error) {
        console.error('Error in GET /recipes/:id:', error);
        res.status(500).json({ error: 'Failed to retrieve recipe' });
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const recipe = Recipe.create(req.body);
        await recipe.save();
        res.status(201).json(recipe);
    } catch (error) {
        console.error('Error in POST /recipes:', error);
        res.status(500).json({ error: 'Failed to create recipe' });
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    try {
        const recipe = await Recipe.findOne({ where: { id: parseInt(req.params.id) } });
        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        Recipe.merge(recipe, req.body);
        const result = await recipe.save();
        res.json(result);
    } catch (error) {
        console.error('Error in PUT /recipes/:id:', error);
        res.status(500).json({ error: 'Failed to update recipe' });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const recipe = await Recipe.findOne({ where: { id: parseInt(req.params.id) } });
        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        await Recipe.softRemove(recipe);
        res.status(204).send();
    } catch (error) {
        console.error('Error in DELETE /recipes/:id:', error);
        res.status(500).json({ error: 'Failed to delete recipe' });
    }
});

export default router;