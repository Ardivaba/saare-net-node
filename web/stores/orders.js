import { defineStore } from 'pinia'
import axios from "axios";
import * as Sentry from "@sentry/vue";

export const useOrdersStore = defineStore('orders', {
    state: () => ({
        orders: [],
        order: {},
        workerLogs: [],
        currentPage: 1,
        totalPages: 1,
        sortColumn: 'id',
        sortDirection: 'asc',
        filters: {
            id: '',
            recipeCode: '',
            recipeDescription: '',
            info: '',
            amountOrderedMin: '',
            amountOrderedMax: '',
            amountProducedMin: '',
            amountProducedMax: '',
            isFinished: '',
            createdAtStart: '',
            createdAtEnd: '',
            updatedAtStart: '',
            updatedAtEnd: '',
        },
    }),
    actions: {
        async getOrders() {
            try {
                const response = await axios.get(`${window.baseURL}/api/orders`, {
                    params: {
                        page: this.currentPage,
                        sort: this.sortColumn,
                        direction: this.sortDirection,
                        ...this.filters,
                    }
                });
                this.orders = response.data.orders;
                this.totalPages = response.data.totalPages;
            } catch (error) {
                Sentry.captureException({msg: 'Viga tellimuste laadimisel', error});
            }
        },
        async getOrder(id) {
            try {
                const response = await axios.get(`${window.baseURL}/api/orders/${id}`);
                this.order = response.data.order;
                this.workerLogs = response.data.workerLogs;
            } catch (error) {
                Sentry.captureException({msg: 'Viga tellimuse laadimisel', error});
            }
        },
        async createOrder(orderData) {
            try {
                const response = await axios.post(`${window.baseURL}/api/orders`, orderData);
                this.orders.push(response.data);
                return response.data;
            } catch (error) {
                Sentry.captureException({msg: 'Viga tellimuse loomisel', error});
                throw error;
            }
        },
        async updateOrder(id, orderData) {
            try {
                const response = await axios.put(`${window.baseURL}/api/orders/${id}`, orderData);
                const index = this.orders.findIndex(o => o.id === id);
                if (index !== -1) {
                    this.orders[index] = response.data;
                }
                return response.data;
            } catch (error) {
                Sentry.captureException({msg: 'Viga tellimuse uuendamisel', error});
                throw error;
            }
        },
        async deleteOrder(id) {
            try {
                await axios.delete(`${window.baseURL}/api/orders/${id}`);
                this.orders = this.orders.filter(o => o.id !== id);
            } catch (error) {
                Sentry.captureException({msg: 'Viga tellimuse kustutamisel', error});
                throw error;
            }
        },
        setPage(page) {
            this.currentPage = page;
        },
        setSorting(column, direction) {
            this.sortColumn = column;
            this.sortDirection = direction;
        },
        setFilters(filters) {
            this.filters = { ...this.filters, ...filters };
        },
        resetFilters() {
            this.filters = {
                id: '',
                recipeCode: '',
                recipeDescription: '',
                info: '',
                amountOrderedMin: '',
                amountOrderedMax: '',
                amountProducedMin: '',
                amountProducedMax: '',
                isFinished: '',
                createdAtStart: '',
                createdAtEnd: '',
                updatedAtStart: '',
                updatedAtEnd: '',
            };
        },
    },
});