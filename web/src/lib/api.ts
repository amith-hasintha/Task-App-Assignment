import { Task, PaginatedTasks, TaskStatus } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface FetchTasksParams {
  status?: string;
  search?: string;
  sortDueDate?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string | null;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(", ");
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // JSON parse failed, keep default message
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export const api = {
  async getTasks(params: FetchTasksParams = {}): Promise<PaginatedTasks> {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.set("status", params.status);
    if (params.search) searchParams.set("search", params.search);
    if (params.sortDueDate) searchParams.set("sortDueDate", params.sortDueDate);
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.limit) searchParams.set("limit", params.limit.toString());

    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/tasks${queryString ? `?${queryString}` : ""}`;
    const response = await fetch(url, { cache: "no-store" });
    return handleResponse<PaginatedTasks>(response);
  },

  async getTask(id: string): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, { cache: "no-store" });
    return handleResponse<Task>(response);
  },

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<Task>(response);
  },

  async updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<Task>(response);
  },

  async deleteTask(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "DELETE",
    });
    return handleResponse<{ message: string }>(response);
  },

  async getHealth(): Promise<{ status: string; database: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/health`, {
      cache: "no-store",
    });
    return handleResponse<{ status: string; database: string; timestamp: string }>(response);
  },
};
