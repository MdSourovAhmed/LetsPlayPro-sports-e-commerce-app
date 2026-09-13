import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

export const adminRegisterSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[0-9]/, 'Include at least one number'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
    role: z.enum(['staff', 'admin'], { errorMap: () => ({ message: 'Choose a role' }) }),
    inviteCode: z.string().min(1, 'Invite code is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[0-9]/, 'Include at least one number'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  sku: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().max(200, 'Keep it under 200 characters').optional(),
  price: z.coerce.number().positive('Price must be greater than 0'),
  discountPrice: z.union([z.coerce.number().positive(), z.literal('')]).optional().nullable(),
  stock: z.coerce.number().int().min(0, "Stock can't be negative"),
  sport: z.string().min(1, 'Sport is required'),
  type: z.string().min(1, 'Type is required'),
  brand: z.string().min(1, 'Brand is required'),
  status: z.enum(['active', 'draft', 'out_of_stock', 'archived']),
  featured: z.boolean().optional(),
  bestSell: z.boolean().optional(),
  tags: z.string().optional(), // comma-separated in the form, split before submit
  specifications: z.object({
    size: z.string().optional(), // comma-separated in the form, split before submit
    color: z.string().optional(),
    material: z.string().optional(),
    weight: z.string().optional(),
    pack: z.string().optional(),
    capacity: z.string().optional(),
  }),
}).refine(
  (data) => !data.discountPrice || data.discountPrice === '' || Number(data.discountPrice) < data.price,
  { message: 'Discount price must be lower than the regular price', path: ['discountPrice'] }
);

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[0-9]/, 'Include at least one number'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  phone: z.string().optional(),
});
