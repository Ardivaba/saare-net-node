import { defineStore } from 'pinia';
import axios from 'axios';
import * as Sentry from "@sentry/vue";

export const useEventsStore = defineStore('events', {
    state: () => ({
        events: [],
        currentPage: 1,
        totalPages: 1,
        filters: {
            startDate: null,
            endDate: null,
            type: null,
        },
        sortColumn: 'created_at',
        sortDirection: 'desc',
    }),
    actions: {
        async getEvents({ limit = null } = {}) {
            try {
                const response = await axios.get(`${window.baseURL}/api/events`, {
                    params: {
                        page: this.currentPage,
                        ...this.filters,
                        sort: this.sortColumn,
                        direction: this.sortDirection,
                        limit: limit
                    },
                });
                this.events = response.data.events;
                this.totalPages = response.data.totalPages;
            } catch (error) {
                Sentry.captureException({msg: 'Error fetching events', error});
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