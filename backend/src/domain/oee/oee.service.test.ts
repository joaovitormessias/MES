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
        const mockDate = new Date(2026, 0, 15, 12);
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
                startTs: new Date(2026, 0, 15, 9),
                endTs: new Date(2026, 0, 15, 9, 30),
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

describe('OEE shift boundaries', () => {
    const service = new OEEService();
    const localDate = new Date(2026, 0, 15, 12);
    function shift(startTime: string, endTime: string) {
        prismaMock.shiftSchedule.findUnique.mockResolvedValue({startTime, endTime, isActive: true} as any);
        prismaMock.processExecution.findMany.mockResolvedValue([]);
        prismaMock.downtimeEvent.findMany.mockResolvedValue([]);
    }
    it('handles an overnight shift', async () => {
        shift('22:00', '06:00');
        const result = await service.calculateOEE({workcenterId:'WC01', date:localDate, shiftNumber:1});
        expect(result.details.plannedTime).toBe(480);
        expect(result.availability).toBe(1);
    });
    it('clips and merges overlapping downtime', async () => {
        shift('08:00', '16:00');
        prismaMock.downtimeEvent.findMany.mockResolvedValue([
            {startTs:new Date(2026,0,15,7),endTs:new Date(2026,0,15,9)},
            {startTs:new Date(2026,0,15,8,30),endTs:new Date(2026,0,15,10)},
            {startTs:new Date(2026,0,15,15),endTs:new Date(2026,0,15,17)},
        ] as any);
        const result = await service.calculateOEE({workcenterId:'WC01', date:localDate, shiftNumber:1});
        expect(result.details.downtime).toBe(180);
        expect(result.availability).toBe(300/480);
        expect(prismaMock.downtimeEvent.findMany).toHaveBeenCalledWith(expect.objectContaining({where:expect.objectContaining({OR:expect.any(Array)})}));
    });
    it('rejects an ambiguous zero-length shift', async () => {
        shift('08:00','08:00');
        await expect(service.calculateOEE({workcenterId:'WC01', date:localDate, shiftNumber:1})).rejects.toThrow('positive duration');
    });
});
