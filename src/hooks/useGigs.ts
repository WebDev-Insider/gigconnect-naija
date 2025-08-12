import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

// Gig types
export interface Gig {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  deliveryTime: number; // in days
  revisions: number;
  features: string[];
  requirements: string[];
  portfolio: string[]; // image URLs
  tags: string[];
  status: 'active' | 'inactive' | 'draft';
  freelancerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGigData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  deliveryTime: number;
  revisions: number;
  features: string[];
  requirements: string[];
  portfolio: string[];
  tags: string[];
}

export interface UpdateGigData extends Partial<CreateGigData> {
  status?: 'active' | 'inactive' | 'draft';
}

export interface GigFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  deliveryTime?: number;
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

// Query keys
const gigKeys = {
  all: ['gigs'] as const,
  lists: () => [...gigKeys.all, 'list'] as const,
  list: (filters: GigFilters) => [...gigKeys.lists(), filters] as const,
  details: () => [...gigKeys.all, 'detail'] as const,
  detail: (id: string) => [...gigKeys.details(), id] as const,
  user: (userId: string) => [...gigKeys.all, 'user', userId] as const,
};

// Custom hook for managing gigs
export const useGigs = (filters: GigFilters = {}) => {
  const queryClient = useQueryClient();

  // Fetch gigs with filters
  const {
    data: gigs = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: gigKeys.list(filters),
    queryFn: async () => {
      const response = await apiClient.getGigs(filters);
      if (response.success) {
        return response.data || [];
      }
      throw new Error(response.message || 'Failed to fetch gigs');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create gig mutation
  const createGigMutation = useMutation({
    mutationFn: async (gigData: CreateGigData) => {
      const response = await apiClient.createGig(gigData);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to create gig');
    },
    onSuccess: (newGig) => {
      toast.success('Gig created successfully!');
      // Invalidate and refetch gigs list
      queryClient.invalidateQueries({ queryKey: gigKeys.lists() });
      // Add the new gig to the cache
      queryClient.setQueryData(gigKeys.detail(newGig.id), newGig);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create gig');
    },
  });

  // Update gig mutation
  const updateGigMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateGigData }) => {
      const response = await apiClient.updateGig(id, data);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update gig');
    },
    onSuccess: (updatedGig) => {
      toast.success('Gig updated successfully!');
      // Update the gig in the cache
      queryClient.setQueryData(gigKeys.detail(updatedGig.id), updatedGig);
      // Invalidate and refetch gigs list
      queryClient.invalidateQueries({ queryKey: gigKeys.lists() });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update gig');
    },
  });

  // Delete gig mutation
  const deleteGigMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.deleteGig(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to delete gig');
    },
    onSuccess: () => {
      toast.success('Gig deleted successfully!');
      // Remove the gig from the cache
      queryClient.removeQueries({ queryKey: gigKeys.detail(id) });
      // Invalidate and refetch gigs list
      queryClient.invalidateQueries({ queryKey: gigKeys.lists() });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete gig');
    },
  });

  // Create gig function
  const createGig = (gigData: CreateGigData) => {
    return createGigMutation.mutateAsync(gigData);
  };

  // Update gig function
  const updateGig = (id: string, data: UpdateGigData) => {
    return updateGigMutation.mutateAsync({ id, data });
  };

  // Delete gig function
  const deleteGig = (id: string) => {
    return deleteGigMutation.mutateAsync(id);
  };

  return {
    gigs,
    isLoading,
    error,
    refetch,
    createGig,
    updateGig,
    deleteGig,
    isCreating: createGigMutation.isPending,
    isUpdating: updateGigMutation.isPending,
    isDeleting: deleteGigMutation.isPending,
  };
};

// Custom hook for fetching a single gig
export const useGig = (id: string) => {
  const {
    data: gig,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: gigKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.getGig(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch gig');
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    gig,
    isLoading,
    error,
    refetch,
  };
};

// Custom hook for fetching user's gigs
export const useUserGigs = (userId: string) => {
  const {
    data: gigs = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: gigKeys.user(userId),
    queryFn: async () => {
      const response = await apiClient.getGigs({ freelancerId: userId });
      if (response.success) {
        return response.data || [];
      }
      throw new Error(response.message || 'Failed to fetch user gigs');
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    gigs,
    isLoading,
    error,
    refetch,
  };
};
