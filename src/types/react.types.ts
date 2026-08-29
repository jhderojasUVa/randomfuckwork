/**
 * React-specific type definitions for event handlers and components
 */

import type React from 'react';

/**
 * React click event handler
 * @template T - The HTML element type (defaults to HTMLElement)
 */
export type ClickHandler<T = HTMLElement> = (e: React.MouseEvent<T>) => void;

/**
 * React change event handler for form elements
 * @template T - The HTML element type (defaults to HTMLInputElement)
 */
export type ChangeHandler<T = HTMLInputElement> = (e: React.ChangeEvent<T>) => void;

/**
 * React form submit event handler
 */
export type FormSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => void;

/**
 * React keyboard event handler
 * @template T - The HTML element type (defaults to HTMLElement)
 */
export type KeyboardHandler<T = HTMLElement> = (e: React.KeyboardEvent<T>) => void;

/**
 * React focus event handler
 * @template T - The HTML element type (defaults to HTMLElement)
 */
export type FocusHandler<T = HTMLElement> = (e: React.FocusEvent<T>) => void;

/**
 * Generic function component type alias
 * @template P - The component props type
 */
export type FunctionComponent<P = {}> = React.FC<P>;

/**
 * Extract props from a React component type
 * @template T - Props object type
 */
export type ComponentProps<T extends Record<string, unknown>> = T;

/**
 * React ref type for forwarded refs
 * @template T - The element or component type
 */
export type ForwardedRef<T> = React.ForwardedRef<T>;
