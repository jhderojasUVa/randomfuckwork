/**
 * Data types and interfaces used throughout the application
 */

/**
 * Supported data source types for the application
 */
export type DataType = 'array' | 'wikipedia';

/**
 * Represents a single data item (word definition)
 */
export interface ArrayItem {
  /** Unique identifier for the item */
  id?: string;
  /** The word or term */
  word?: string;
  /** Alternative naming convention: the string value */
  string?: string;
  /** Optional definition or description */
  definition?: string;
  /** Optional excerpt from Wikipedia or other source */
  excerpt?: string;
  /** Optional full title */
  title?: string;
}

/**
 * Error response structure from API calls
 */
export interface ApiError {
  /** Human-readable error message */
  message: string;
  /** Machine-readable error code */
  code?: string;
  /** HTTP status code */
  status?: number;
  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * Standard result wrapper for async operations
 * @template T - The data type on success
 */
export interface Result<T> {
  /** Whether the operation succeeded */
  success: boolean;
  /** The data if operation succeeded */
  data?: T;
  /** The error if operation failed */
  error?: ApiError;
}

/**
 * Async state management interface for async operations
 * @template T - The data type when loaded
 */
export interface AsyncState<T> {
  /** Current status of the async operation */
  status: 'idle' | 'loading' | 'success' | 'error';
  /** The loaded data (null if not loaded yet) */
  data: T | null;
  /** Any error that occurred during operation (null if no error) */
  error: ApiError | null;
}
