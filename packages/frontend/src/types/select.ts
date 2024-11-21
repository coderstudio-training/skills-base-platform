// @/types/select.ts
import { ComponentPropsWithoutRef } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';

export type SelectTriggerProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>;
export type SelectContentProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Content>;
export type SelectLabelProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Label>;
export type SelectItemProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Item>;
export type SelectSeparatorProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>;
