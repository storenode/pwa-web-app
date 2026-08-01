// src/lib/valibot.ts
// ⚠️ This is the ONLY file in the app allowed to import 'valibot' or
// '@hookform/resolvers/valibot' directly. Schemas and components must
// import from here, never from the library itself.

import * as v from "valibot";
import { valibotResolver } from "@hookform/resolvers/valibot";

// Re-export the schema builder namespace under a neutral name
export const schema = v;

// Re-export the RHF resolver factory under a neutral name
export const createResolver = valibotResolver;

// Type helper so schema files never need to import valibot's own types
export type Infer<T extends v.GenericSchema> = v.InferOutput<T>;

// Generic schema type, useful if you ever need to type a function
// argument as "any valibot schema" without leaking the library import
export type Schema<T = unknown> = v.GenericSchema<unknown, T>;
