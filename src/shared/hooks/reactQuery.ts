import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type DefaultError,
  type QueryClient,
  type QueryKey,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';

export type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';

export interface AppMutationOptions<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
> extends UseMutationOptions<TData, TError, TVariables, TContext> {
  invalidateQueryKeys?: readonly QueryKey[];
}

export const useAppQuery = <
  TQueryFnData,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseQueryResult<TData, TError> => useQuery(options);

export const useAppMutation = <
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  options: AppMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> => {
  const queryClient = useQueryClient();
  const { invalidateQueryKeys: keysToInvalidate, onSuccess, ...rest } = options;

  return useMutation({
    ...rest,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await onSuccess?.(data, variables, onMutateResult, context);

      if (keysToInvalidate?.length) {
        await invalidateQueryKeys(queryClient, keysToInvalidate);
      }
    },
  });
};

export const useAppQueryClient = (): QueryClient => useQueryClient();

export const createAppQueryOptions = queryOptions;

export const createAppMutationOptions = <
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  options: AppMutationOptions<TData, TError, TVariables, TContext>
) => mutationOptions(options);

export const invalidateQueryKeys = async (
  queryClient: QueryClient,
  queryKeys: readonly QueryKey[]
) =>
  Promise.all(
    queryKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
  );
