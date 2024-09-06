import { Router, Request, Response } from 'express';
import { Between, In } from 'typeorm';
import { Production } from '../entities/Production';
import { ProductionWorkLog } from '../entities/ProductionWorkLog';
import { startOfDay, endOfDay, parseISO, format } from 'date-fns';

const router = Router();

router.get('/total-production', async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') {
            return res.status(400).json({ error: 'Valid start date and end date are required' });
        }

        const start = startOfDay(parseISO(startDate));
        const end = endOfDay(parseISO(endDate));

        const productions = await Production.find({
            where: {
                start_date: Between(start, end)
            },
            select: ['start_date', 'produced_quantity']
        });

        const dailyProduction = productions.reduce((acc, prod) => {
            const date = format(prod.start_date, 'yyyy-MM-dd');
            acc[date] = (acc[date] || 0) + prod.produced_quantity;
            return acc;
        }, {} as Record<string, number>);

        const result = Object.entries(dailyProduction).map(([date, total]) => ({
            date,
            total,
        }));

        res.json(result);
    } catch (error) {
        console.error('Error fetching total production:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/production-by-code', async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') {
            return res.status(400).json({ error: 'Valid start date and end date are required' });
        }

        const start = startOfDay(parseISO(startDate));
        const end = endOfDay(parseISO(endDate));

        const productions = await Production.find({
            where: {
                start_date: Between(start, end)
            },
            select: ['recipe_code', 'produced_quantity']
        });

        const productionByCode = productions.reduce((acc, prod) => {
            acc[prod.recipe_code] = (acc[prod.recipe_code] || 0) + prod.produced_quantity;
            return acc;
        }, {} as Record<string, number>);

        const result = Object.entries(productionByCode).map(([code, total]) => ({
            code,
            total,
        }));

        res.json(result);
    } catch (error) {
        console.error('Error fetching production by code:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/worker-production', async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, workerIds } = req.query;

        if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string' || !workerIds) {
            return res.status(400).json({ error: 'Valid start date, end date, and worker IDs are required' });
        }

        const start = startOfDay(parseISO(startDate));
        const end = endOfDay(parseISO(endDate));
        const workerIdsArray = (workerIds as string).split(',').map(Number);

        const workLogs = await ProductionWorkLog.find({
            where: {
                created_at: Between(start, end),
                worker_id: In(workerIdsArray)
            },
            relations: ['worker'],
            select: ['created_at', 'produced_quantity', 'worker']
        });

        const workerProduction = workLogs.reduce((acc, log) => {
            const date = format(log.created_at, 'yyyy-MM-dd');
            if (!acc[log.worker.id]) {
                acc[log.worker.id] = { name: log.worker.name, data: {} };
            }
            acc[log.worker.id].data[date] = (acc[log.worker.id].data[date] || 0) + log.produced_quantity;
            return acc;
        }, {} as Record<number, { name: string, data: Record<string, number> }>);

        const result = Object.values(workerProduction).map(({ name, data }) => ({
            name,
            data: Object.entries(data).map(([date, total]) => ({ date, total }))
        }));

        res.json(result);
    } catch (error) {
        console.error('Error fetching worker production:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;