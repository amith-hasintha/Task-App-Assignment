import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskStatus } from './enums/task-status.enum';

const mockTasksService = {
  findAll: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
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

describe('TasksController', () => {
  let controller: TasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: mockTasksService }],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated tasks list', async () => {
      const paginatedResult = {
        data: [mockTask],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockTasksService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll({});
      expect(result).toEqual(paginatedResult);
      expect(mockTasksService.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      mockTasksService.findOne.mockResolvedValue(mockTask);
      const result = await controller.findOne('test-uuid-1');
      expect(result).toEqual(mockTask);
      expect(mockTasksService.findOne).toHaveBeenCalledWith('test-uuid-1');
    });
  });

  describe('create', () => {
    it('should create a new task', async () => {
      mockTasksService.create.mockResolvedValue(mockTask);
      const dto = { title: 'Test Task' };
      const result = await controller.create(dto);
      expect(result).toEqual(mockTask);
      expect(mockTasksService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update an existing task', async () => {
      const updated = { ...mockTask, title: 'Updated' };
      mockTasksService.update.mockResolvedValue(updated);
      const result = await controller.update('test-uuid-1', { title: 'Updated' });
      expect(result).toEqual(updated);
      expect(mockTasksService.update).toHaveBeenCalledWith('test-uuid-1', { title: 'Updated' });
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      mockTasksService.remove.mockResolvedValue({ message: 'Task deleted successfully' });
      const result = await controller.remove('test-uuid-1');
      expect(result).toEqual({ message: 'Task deleted successfully' });
      expect(mockTasksService.remove).toHaveBeenCalledWith('test-uuid-1');
    });
  });
});
