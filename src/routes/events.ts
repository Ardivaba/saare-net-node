import { Router, Request, Response } from 'express';
import { Event } from '../entities/Event';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = 'createdAt',
            direction = 'DESC',
            startDate,
            endDate,
            type
        } = req.query;

        const queryBuilder = Event.createQueryBuilder('event');

        if (startDate) {
            queryBuilder.andWhere('event.createdAt >= :startDate', { startDate });
        }
        if (endDate) {
            queryBuilder.andWhere('event.createdAt <= :endDate', { endDate });
        }
        if (type) {
            queryBuilder.andWhere('event.type = :type', { type });
        }

        // Apply sorting
        const sortDirection = direction.toString().toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        queryBuilder.orderBy(`event.${sort}`, sortDirection as 'ASC' | 'DESC');

        const total = await queryBuilder.getCount();
        const events = await queryBuilder
            .skip((+page - 1) * +limit)
            .take(+limit)
            .getMany();

        res.json({
            events,
            totalPages: Math.ceil(total / +limit),
            currentPage: +page
        });
    } catch (error) {
        console.error('Error in GET /events:', error);
        res.status(500).json({ error: 'Failed to retrieve events' });
    }
});

export default router;