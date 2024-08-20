import { Router, Request, Response } from 'express';
import { Order } from '../entities/Order';
import { Recipe } from '../entities/Recipe';
import { WorkerLog } from '../entities/WorkerLog';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = 'id',
            direction = 'ASC',
            id,
            recipeCode,
            recipeDescription,
            info,
            amountOrderedMin,
            amountOrderedMax,
            amountProducedMin,
            amountProducedMax,
            isFinished,
            createdAtStart,
            createdAtEnd,
            updatedAtStart,
            updatedAtEnd
        } = req.query;

        const queryBuilder = Order.createQueryBuilder('order')
            .leftJoinAndSelect('order.recipe', 'recipe')
            .leftJoinAndSelect('order.currentWorker', 'currentWorker');

        // Apply filters
        if (id) queryBuilder.andWhere('order.id = :id', { id });
        if (recipeCode) queryBuilder.andWhere('recipe.code LIKE :recipeCode', { recipeCode: `${recipeCode}%` });
        if (recipeDescription) queryBuilder.andWhere('recipe.description LIKE :recipeDescription', { recipeDescription: `%${recipeDescription}%` });
        if (info) queryBuilder.andWhere('order.info LIKE :info', { info: `%${info}%` });
        if (amountOrderedMin) queryBuilder.andWhere('order.amountOrdered >= :amountOrderedMin', { amountOrderedMin });
        if (amountOrderedMax) queryBuilder.andWhere('order.amountOrdered <= :amountOrderedMax', { amountOrderedMax });
        if (amountProducedMin) queryBuilder.andWhere('order.amountProduced >= :amountProducedMin', { amountProducedMin });
        if (amountProducedMax) queryBuilder.andWhere('order.amountProduced <= :amountProducedMax', { amountProducedMax });
        if (isFinished) queryBuilder.andWhere('order.isFinished = :isFinished', { isFinished: isFinished === 'true' });
        if (createdAtStart) queryBuilder.andWhere('order.createdAt >= :createdAtStart', { createdAtStart });
        if (createdAtEnd) queryBuilder.andWhere('order.createdAt <= :createdAtEnd', { createdAtEnd });
        if (updatedAtStart) queryBuilder.andWhere('order.updatedAt >= :updatedAtStart', { updatedAtStart });
        if (updatedAtEnd) queryBuilder.andWhere('order.updatedAt <= :updatedAtEnd', { updatedAtEnd });

        // Apply sorting
        const sortDirection = direction.toString().toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        queryBuilder.orderBy(`order.${sort}`, sortDirection as 'ASC' | 'DESC');

        // Apply pagination
        const total = await queryBuilder.getCount();
        const orders = await queryBuilder
            .skip((+page - 1) * +limit)
            .take(+limit)
            .getMany();

        res.json({
            orders,
            totalPages: Math.ceil(total / +limit),
            currentPage: +page
        });
    } catch (error) {
        console.error('Error in GET /orders:', error);
        res.status(500).json({ error: 'Failed to retrieve orders' });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const order = await Order.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ['recipe', 'currentWorker']
        });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const workerLogs = await WorkerLog.find({
            where: { order: { id: order.id } },
            relations: ['worker']
        });

        res.json({ order, workerLogs });
    } catch (error) {
        console.error('Error in GET /orders/:id:', error);
        res.status(500).json({ error: 'Failed to retrieve order' });
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const { recipeId, ...orderData } = req.body;

        const recipe = await Recipe.findOne({ where: { id: recipeId } });
        if (!recipe) {
            return res.status(400).json({ error: 'Invalid recipe ID' });
        }

        const order = Order.create({
            ...orderData,
            recipe,
            amountProduced: 0,
            isFinished: false
        });

        await order.save();

        // Reload the order with the recipe data
        const savedOrder = await Order.findOne({
            where: { id: order.id },
            relations: ['recipe']
        });

        res.status(201).json(savedOrder);
    } catch (error) {
        console.error('Error in POST /orders:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    try {
        const order = await Order.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ['recipe']
        });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const { recipeId, ...orderData } = req.body;

        if (recipeId && recipeId !== order.recipe.id) {
            const recipe = await Recipe.findOne({ where: { id: recipeId } });
            if (!recipe) {
                return res.status(400).json({ error: 'Invalid recipe ID' });
            }
            order.recipe = recipe;
        }

        Order.merge(order, orderData);
        const result = await order.save();

        // Reload the order with the updated recipe data
        const updatedOrder = await Order.findOne({
            where: { id: result.id },
            relations: ['recipe']
        });

        res.json(updatedOrder);
    } catch (error) {
        console.error('Error in PUT /orders/:id:', error);
        res.status(500).json({ error: 'Failed to update order' });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const order = await Order.findOne({ where: { id: parseInt(req.params.id) } });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        await order.remove();
        res.status(204).send();
    } catch (error) {
        console.error('Error in DELETE /orders/:id:', error);
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

export default router;