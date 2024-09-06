import { defineStore } from 'pinia';
import axios from 'axios';
import * as Sentry from "@sentry/vue";

export const useProductionWorkLogStore = defineStore('productionWorkLog', {
    state: () => ({
        workLogs: [],
        currentPage: 1,
        totalPages: 1,
        filters: {
            startDate: null,
            endDate: null,
            workerName: null,
            recipeCode: null,
            minProducedQuantity: null,
            maxProducedQuantity: null,
        },
        sortColumn: 'id',
        sortDirection: 'desc',
    }),
    actions: {
        async getProductionWorkLogs() {
            try {
                const response = await axios.get(`${window.baseURL}/api/production-work-logs`, {
                    params: {
                        page: this.currentPage,
                        ...this.filters,
                        sort: this.sortColumn,
                        direction: this.sortDirection,
                    },
                });
                this.workLogs = response.data.workLogs;
                this.totalPages = response.data.totalPages;
                this.currentPage = response.data.currentPage;
            } catch (error) {
                console.error('Error fetching production work logs:', error);
                Sentry.captureException({msg: 'Error fetching production work logs', error});
            }
        },
        setPage(page) {
            this.currentPage = page;
        },
        setFilters(filters) {
            this.filters = { ...this.filters, ...filters };
            this.currentPage = 1;
        },
        setSorting(column, direction) {
            this.sortColumn = column;
            this.sortDirection = direction;
        },
        resetFilters() {
            this.filters = {
                startDate: null,
                endDate: null,
                workerName: null,
                recipeCode: null,
                minProducedQuantity: null,
                maxProducedQuantity: null,
            };
            this.currentPage = 1;
        },
    },
});