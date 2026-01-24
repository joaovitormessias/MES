import { OEEService } from './oee.service';
import { prismaMock } from '../../__tests__/setup';

jest.mock('../../utils/metrics', () => ({
    oeeGauge: { set: jest.fn() },
    availabilityGauge: { set: jest.fn() },
    performanceGauge: { set: jest.fn() },
    qualityGauge: { set: jest.fn() },
}));

describe('OEEService', () => {
    const oeeService = new OEEService();

    it('should calculate OEE correctly for a standard shift', async () => {
        const mockDate = new Date('2026-01-15T12:00:00Z');
        const workcenterId = 'WC01';
        const shiftNumber = 1;

        // Mock Shift Schedule: 08:00 to 16:00 (480 minutes)
        prismaMock.shiftSchedule.findUnique.mockResolvedValue({
            id: 'sh1',
            workcenterId,
            dayOfWeek: 4, // Thursday
            shiftNumber,
            startTime: '08:00',
            endTime: '16:00',
            isActive: true,
        } as any);

        // Mock Downtime: 30 minutes
        prismaMock.downtimeEvent.findMany.mockResolvedValue([
            {
                id: 'd1',
                workcenterId,
                startTs: new Date('2026-01-15T09:00:00Z'),
                endTs: new Date('2026-01-15T09:30:00Z'),
                isMicroStop: false,
                reasonCode: 'BREAKDOWN',
            },
        ] as any);

        // Mock Process Executions: 100 total, 95 good, 5 scrap
        // Ideal Cycle Time: 4 mins/piece
        // Total Ideal Time = 400 mins
        // Operating Time = 480 - 30 = 450 mins
        prismaMock.processExecution.findMany.mockResolvedValue([
            {
                id: 'e1',
                executedQty: 100,
                goodQty: 95,
                scrapQty: 5,
                productionOrder: {
                    item: {
                        standardCycleTime: 4,
                    },
                },
            },
        ] as any);

        const result = await oeeService.calculateOEE({
            workcenterId,
            date: mockDate,
            shiftNumber,
        });

        // Expected Calculations:
        // Availability: (480 - 30) / 480 = 0.9375
        // Performance: (100 * 4) / 450 = 0.8889
        // Quality: 95 / 100 = 0.95
        // OEE: 0.9375 * 0.8889 * 0.95 = 0.7917

        expect(result.availability).toBeCloseTo(0.9375, 4);
        expect(result.performance).toBeCloseTo(0.8889, 4);
        expect(result.quality).toBe(0.95);
        expect(result.oee).toBeCloseTo(0.7917, 4);

        expect(result.details.totalPieces).toBe(100);
        expect(result.details.goodPieces).toBe(95);
    });

    it('should throw error if no shift schedule found', async () => {
        prismaMock.shiftSchedule.findUnique.mockResolvedValue(null);

        await expect(oeeService.calculateOEE({
            workcenterId: 'WC01',
            date: new Date(),
            shiftNumber: 1,
        })).rejects.toThrow('No active shift schedule found');
    });
});
