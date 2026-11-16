import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { TaskStatus } from './enums/task-status.enum';

const mockPrismaService = {
  task: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  $transaction: vi.fn(),
};

const mockTask = {
  id: 'test-uuid-1',
  title: 'Test Task',
  description: 'Test Description',
  status: TaskStatus.TODO,
  dueDate: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a task with default status and no optional fields', async () => {
      mockPrismaService.task.create.mockResolvedValue(mockTask);
      const result = await service.create({ title: 'Test Task' });
      expect(result).toEqual(mockTask);
      expect(mockPrismaService.task.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Task',
          description: undefined,
          status: undefined,
          dueDate: undefined,
        },
      });
    });

    it('should create a task with all fields populated', async () => {
      const taskWithDate = {
        ...mockTask,
        dueDate: new Date('2024-12-31'),
        status: TaskStatus.IN_PROGRESS,
      };
      mockPrismaService.task.create.mockResolvedValue(taskWithDate);
      const result = await service.create({
        title: 'Test Task',
        description: 'Description',
        status: TaskStatus.IN_PROGRESS,
        dueDate: '2024-12-31',
      });
      expect(result).toEqual(taskWithDate);
      expect(mockPrismaService.task.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Task',
          description: 'Description',
          status: TaskStatus.IN_PROGRESS,
          dueDate: new Date('2024-12-31'),
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks with default pagination', async () => {
      mockPrismaService.$transaction.mockResolvedValue([[mockTask], 1]);
      const result = await service.findAll({});
      expect(result.data).toEqual([mockTask]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should filter tasks by status', async () => {
      mockPrismaService.$transaction.mockResolvedValue([[mockTask], 1]);
      await service.findAll({ status: TaskStatus.TODO });
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      const transactionCalls = mockPrismaService.task.findMany.mock.calls;
      expect(transactionCalls[0][0].where.status).toBe(TaskStatus.TODO);
    });

    it('should search tasks by title and description', async () => {
      mockPrismaService.$transaction.mockResolvedValue([[mockTask], 1]);
      await service.findAll({ search: 'urgent' });
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      const transactionCalls = mockPrismaService.task.findMany.mock.calls;
      expect(transactionCalls[0][0].where.OR).toEqual([
        { title: { contains: 'urgent' } },
        { description: { contains: 'urgent' } },
      ]);
    });

    it('should sort tasks by dueDate asc and desc', async () => {
      mockPrismaService.$transaction.mockResolvedValue([[mockTask], 1]);
      await service.findAll({ sortDueDate: 'asc' });
      const callsAsc = mockPrismaService.task.findMany.mock.calls;
      expect(callsAsc[0][0].orderBy).toEqual([
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ]);

      mockPrismaService.task.findMany.mockClear();
      await service.findAll({ sortDueDate: 'desc' });
      const callsDesc = mockPrismaService.task.findMany.mock.calls;
      expect(callsDesc[0][0].orderBy).toEqual([
        { dueDate: 'desc' },
        { createdAt: 'desc' },
      ]);
    });

    it('should respect custom page and limit', async () => {
      mockPrismaService.$transaction.mockResolvedValue([[], 25]);
      const result = await service.findAll({ page: 3, limit: 5 });
      expect(result.page).toBe(3);
      expect(result.limit).toBe(5);
      expect(result.totalPages).toBe(5);
      const calls = mockPrismaService.task.findMany.mock.calls;
      expect(calls[0][0].skip).toBe(10);
      expect(calls[0][0].take).toBe(5);
    });
  });

  describe('findOne', () => {
    it('should return a task by id when found', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      const result = await service.findOne('test-uuid-1');
      expect(result).toEqual(mockTask);
      expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-uuid-1' },
      });
    });

    it('should throw NotFoundException for non-existent task', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);
      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update task title and description', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      const updated = { ...mockTask, title: 'Updated Title' };
      mockPrismaService.task.update.mockResolvedValue(updated);

      const result = await service.update('test-uuid-1', { title: 'Updated Title' });
      expect(result.title).toBe('Updated Title');
      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: 'test-uuid-1' },
        data: { title: 'Updated Title' },
      });
    });

    it('should update task status', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      const updated = { ...mockTask, status: TaskStatus.DONE };
      mockPrismaService.task.update.mockResolvedValue(updated);

      const result = await service.update('test-uuid-1', { status: TaskStatus.DONE });
      expect(result.status).toBe(TaskStatus.DONE);
    });

    it('should throw NotFoundException when updating non-existent task', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);
      await expect(
        service.update('non-existent-id', { title: 'New' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a task and return success message', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.task.delete.mockResolvedValue(mockTask);

      const result = await service.remove('test-uuid-1');
      expect(result).toEqual({ message: 'Task deleted successfully' });
      expect(mockPrismaService.task.delete).toHaveBeenCalledWith({
        where: { id: 'test-uuid-1' },
      });
    });

    it('should throw NotFoundException when deleting non-existent task', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);
      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
