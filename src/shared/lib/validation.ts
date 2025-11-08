import { z } from 'zod';

// Phone validation for Morocco
export const phoneSchema = z
  .string()
  .regex(/^0[67]\d{8}$/, 'Numéro de téléphone invalide (doit commencer par 06 ou 07)')
  .length(10, 'Le numéro doit contenir 10 chiffres');

// Name validation
export const nameSchema = z
  .string()
  .min(2, 'Le nom doit contenir au moins 2 caractères')
  .max(100, 'Le nom ne peut pas dépasser 100 caractères')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom contient des caractères invalides');

// Address validation
export const addressSchema = z
  .string()
  .min(10, 'L\'adresse doit contenir au moins 10 caractères')
  .max(500, 'L\'adresse ne peut pas dépasser 500 caractères');

// Email validation
export const emailSchema = z
  .string()
  .email('Adresse email invalide')
  .max(255, 'L\'email ne peut pas dépasser 255 caractères')
  .toLowerCase()
  .trim();

// Price validation
export const priceSchema = z
  .number()
  .positive('Le prix doit être positif')
  .max(100000, 'Le prix ne peut pas dépasser 100 000 MAD');

// Stock validation
export const stockSchema = z
  .number()
  .int('La quantité doit être un nombre entier')
  .min(0, 'La quantité ne peut pas être négative')
  .max(100000, 'La quantité ne peut pas dépasser 100 000');

// Sanitize string input (remove dangerous characters)
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}


