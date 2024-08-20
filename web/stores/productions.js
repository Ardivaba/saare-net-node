import { defineStore } from 'pinia';
import axios from 'axios';
import * as Sentry from "@sentry/vue";

export const useProductionsStore = defineStore('productions', {
    state: () => ({
        productions: [],
        currentPage: 1,
        totalPages: 1,
        filters: {
            startDate: null,
            endDate: null,
            recipeCode: '',
            minQuantity: null,
            maxQuantity: null,
            machineName: '',
        },
        sortColumn: 'id',
        sortDirection: 'desc',
    }),
    actions: {
        async getProductions() {
            try {
                const response = await axios.get(`${window.baseURL}/api/productions`, {
                    params: {
                        page: this.currentPage,
                        ...this.filters,
                        sort: this.sortColumn,
                        direction: this.sortDirection,
                    },
                });
                this.productions = response.data.productions;
                this.totalPages = response.data.totalPages;
                this.currentPage = response.data.currentPage;
            } catch (error) {
                console.error('Error fetching productions:', error);
                Sentry.captureException({msg: 'Error fetching productions', error});
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
        async exportCSV(type) {
            try {
                const response = await axios.get(`${window.baseURL}/api/productions/export`, {
                    params: {
                        ...this.filters,
                        export: type,
                    },
                    responseType: 'blob',
                });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'productions.csv');
                document.body.appendChild(link);
                link.click();
            } catch (error) {
                console.error('Error exporting productions:', error);
                Sentry.captureException({msg: 'Error exporting productions', error});
            }
        },
        resetFilters() {
            this.filters = {
                startDate: null,
                endDate: null,
                recipeCode: '',
                minQuantity: null,
                maxQuantity: null,
                machineName: '',
            };
            this.currentPage = 1;
        },
    },
});