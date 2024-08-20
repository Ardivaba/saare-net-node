import { Router, Request, Response } from 'express';
import { Worker, WorkerStatus } from '../entities/Worker';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const {
            page = 1,
            per_page = 10,
            sort = 'id',
            direction = 'ASC'
        } = req.query;

        const queryBuilder = Worker.createQueryBuilder('worker');

        // Apply sorting
        const sortDirection = direction.toString().toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        queryBuilder.orderBy(`worker.${sort}`, sortDirection as 'ASC' | 'DESC');

        const total = await queryBuilder.getCount();
        const workers = await queryBuilder
            .skip((+page - 1) * +per_page)
            .take(+per_page)
            .getMany();

        res.json({
            workers,
            totalPages: Math.ceil(total / +per_page),
            currentPage: +page
        });
    } catch (error) {
        console.error('Error in GET /workers:', error);
        res.status(500).json({ error: 'Failed to retrieve workers' });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const worker = await Worker.findOne({ where: { id: parseInt(req.params.id) } });
        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        res.json(worker);
    } catch (error) {
        console.error('Error in GET /workers/:id:', error);
        res.status(500).json({ error: 'Failed to retrieve worker' });
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const worker = Worker.create(req.body);
        await worker.save();
        res.status(201).json(worker);
    } catch (error) {
        console.error('Error in POST /workers:', error);
        res.status(500).json({ error: 'Failed to create worker' });
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    try {
        const worker = await Worker.findOne({ where: { id: parseInt(req.params.id) } });
        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        Worker.merge(worker, req.body);
        const result = await worker.save();
        res.json(result);
    } catch (error) {
        console.error('Error in PUT /workers/:id:', error);
        res.status(500).json({ error: 'Failed to update worker' });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const worker = await Worker.findOne({ where: { id: parseInt(req.params.id) } });
        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        await worker.remove();
        res.status(204).send();
    } catch (error) {
        console.error('Error in DELETE /workers/:id:', error);
        res.status(500).json({ error: 'Failed to delete worker' });
    }
});

export default router;