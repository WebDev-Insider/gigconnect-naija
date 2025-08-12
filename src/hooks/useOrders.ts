import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

// Order types
export interface Order {
  id: string;
  gigId: string;
  clientId: string;
  freelancerId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  amount: number;
  deliveryDate: string;
  requirements: string;
  attachments: string[]; // file URLs
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
}

export interface CreateOrderData {
  gigId: string;
  requirements: string;
  attachments?: string[];
  deliveryDate: string;
}

export interface UpdateOrderData {
  status?: Order['status'];
  requirements?: string;
  attachments?: string[];
  deliveryDate?: string;
}

export interface OrderFilters {
  status?: Order['status'];
  clientId?: string;
  freelancerId?: string;
  page?: number;
  limit?: number;
}

// Query keys
const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrderFilters) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  user: (userId: string, role: 'client' | 'freelancer') => [...orderKeys.all, 'user', userId, role] as const,
};

// Custom hook for managing orders
export const useOrders = (filters: OrderFilters = {}) => {
  const queryClient = useQueryClient();

  // Fetch orders with filters
  const {
    data: orders = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: async () => {
      const response = await apiClient.getOrders(filters);
      if (response.success) {
        return response.data || [];
      }
      throw new Error(response.message || 'Failed to fetch orders');
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (orders change frequently)
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      const response = await apiClient.createOrder(orderData);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to create order');
    },
    onSuccess: (newOrder) => {
      toast.success('Order created successfully!');
      // Invalidate and refetch orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      // Add the new order to the cache
      queryClient.setQueryData(orderKeys.detail(newOrder.id), newOrder);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create order');
    },
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Order['status'] }) => {
      const response = await apiClient.updateOrderStatus(id, status);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update order status');
    },
    onSuccess: (updatedOrder) => {
      toast.success('Order status updated successfully!');
      // Update the order in the cache
      queryClient.setQueryData(orderKeys.detail(updatedOrder.id), updatedOrder);
      // Invalidate and refetch orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update order status');
    },
  });

  // Update order details mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOrderData }) => {
      const response = await apiClient.updateOrderStatus(id, data.status || 'pending');
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update order');
    },
    onSuccess: (updatedOrder) => {
      toast.success('Order updated successfully!');
      // Update the order in the cache
      queryClient.setQueryData(orderKeys.detail(updatedOrder.id), updatedOrder);
      // Invalidate and refetch orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update order');
    },
  });

  // Create order function
  const createOrder = (orderData: CreateOrderData) => {
    return createOrderMutation.mutateAsync(orderData);
  };

  // Update order status function
  const updateOrderStatus = (id: string, status: Order['status']) => {
    return updateOrderStatusMutation.mutateAsync({ id, status });
  };

  // Update order function
  const updateOrder = (id: string, data: UpdateOrderData) => {
    return updateOrderMutation.mutateAsync({ id, data });
  };

  return {
    orders,
    isLoading,
    error,
    refetch,
    createOrder,
    updateOrderStatus,
    updateOrder,
    isCreating: createOrderMutation.isPending,
    isUpdatingStatus: updateOrderStatusMutation.isPending,
    isUpdating: updateOrderMutation.isPending,
  };
};

// Custom hook for fetching a single order
export const useOrder = (id: string) => {
  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.getOrder(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch order');
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    order,
    isLoading,
    error,
    refetch,
  };
};

// Custom hook for fetching user's orders
export const useUserOrders = (userId: string, role: 'client' | 'freelancer') => {
  const filters = role === 'client' 
    ? { clientId: userId }
    : { freelancerId: userId };

  const {
    data: orders = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: orderKeys.user(userId, role),
    queryFn: async () => {
      const response = await apiClient.getOrders(filters);
      if (response.success) {
        return response.data || [];
      }
      throw new Error(response.message || 'Failed to fetch user orders');
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    orders,
    isLoading,
    error,
    refetch,
  };
};
