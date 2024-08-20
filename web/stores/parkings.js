import {defineStore} from 'pinia';
import axios from 'axios';
import * as Sentry from "@sentry/vue";

export const useParkingsStore = defineStore('parkings', {
    state: () => ({
        parkings: [],
        currentPage: 1,
        totalPages: 1,
        filters: {
            startDate: null,
            endDate: null,
            spaceId: null,
        },
        sortColumn: 'id',
        sortDirection: 'asc',
    }),
    actions: {
        async getParkings() {
            try {
                const response = await axios.get(`${window.baseURL}/api/parkings`, {
                    params: {
                        page: this.currentPage,
                        ...this.filters,
                        sort: this.sortColumn,
                        direction: this.sortDirection,
                    },
                });
                this.parkings = response.data.parkings;
                this.totalPages = response.data.totalPages;
            } catch (error) {
                Sentry.captureException({msg: 'Error fetching parkings', error});
                throw error;
            }
        },
        setPage(page) {
            this.currentPage = page;
        },
        setFilters(filters) {
            this.filters = filters;
            this.currentPage = 1; // Reset to first page when applying new filters
        },
        setSorting(column, direction) {
            this.sortColumn = column;
            this.sortDirection = direction;
        },
    },
});