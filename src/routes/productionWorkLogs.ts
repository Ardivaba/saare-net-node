import { Router, Request, Response } from 'express';
import { ProductionWorkLog } from '../entities/ProductionWorkLog';
import { Like } from 'typeorm';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const {
            page = 1,
            per_page = 10,
            sort = 'id',
            direction = 'ASC',
            startDate,
            endDate,
            workerName,
            recipeCode,
            minProducedQuantity,
            maxProducedQuantity,
            productionId
        } = req.query;

        const queryBuilder = ProductionWorkLog.createQueryBuilder('productionWorkLog')
            .leftJoinAndSelect('productionWorkLog.production', 'production')
            .leftJoinAndSelect('productionWorkLog.worker', 'worker');

        if (startDate) {
            queryBuilder.andWhere('productionWorkLog.created_at >= :startDate', { startDate: new Date(startDate as string) });
        }
        if (endDate) {
            queryBuilder.andWhere('productionWorkLog.created_at <= :endDate', { endDate: new Date(endDate as string) });
        }
        if (workerName) {
            queryBuilder.andWhere('worker.name LIKE :workerName', { workerName: `%${workerName}%` });
        }
        if (recipeCode) {
            queryBuilder.andWhere('production.recipe_code LIKE :recipeCode', { recipeCode: `%${recipeCode}%` });
        }
        if (minProducedQuantity) {
            queryBuilder.andWhere('productionWorkLog.produced_quantity >= :minProducedQuantity', { minProducedQuantity });
        }
        if (maxProducedQuantity) {
            queryBuilder.andWhere('productionWorkLog.produced_quantity <= :maxProducedQuantity', { maxProducedQuantity });
        }
        if (productionId) {
            queryBuilder.andWhere('productionWorkLog.production_id = :productionId', { productionId });
        }

        // Apply sorting
        const sortDirection = direction.toString().toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        queryBuilder.orderBy(`productionWorkLog.${sort}`, sortDirection as 'ASC' | 'DESC');

        const total = await queryBuilder.getCount();
        const workLogs = await queryBuilder
            .skip((+page - 1) * +per_page)
            .take(+per_page)
            .getMany();

        res.json({
            workLogs,
            totalPages: Math.ceil(total / +per_page),
            currentPage: +page
        });
    } catch (error) {
        console.error('Error in GET /production-work-logs:', error);
        res.status(500).json({ error: 'Failed to retrieve production work logs' });
    }
});

export default router;