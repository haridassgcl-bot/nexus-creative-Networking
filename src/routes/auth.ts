import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { UserRole } from '@prisma/client';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  password: z.string().min(4).optional(),
  role: z.enum(['CUSTOMER', 'ENGINEER', 'ADMIN']).default('CUSTOMER'),
});

const loginSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(1),
});

const otpVerifySchema = z.object({
  phone: z.string().min(10),
  otp: z.string().min(4),
  role: z.enum(['CUSTOMER', 'ENGINEER', 'ADMIN']).default('CUSTOMER'),
  name: z.string().optional(),
});

// Register
router.post('/register', async (req, res) => {
  try {
    const input = registerSchema.parse(req.body);
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: input.phone },
          ...(input.email ? [{ email: input.email }] : []),
        ],
      },
    });

    if (existing) {
      return res.status(200).json({
        ok: true,
        user: {
          id: existing.id,
          name: existing.name,
          phone: existing.phone,
          email: existing.email,
          role: existing.role,
        },
      });
    }

    const user = await prisma.user.create({
      data: {
        name: input.name,
        phone: input.phone,
        email: input.email,
        passwordHash: input.password || 'dev-pwd',
        role: input.role as UserRole,
        ...(input.role === 'CUSTOMER'
          ? {
              customer: {
                create: {
                  companyName: `${input.name}'s Enterprise`,
                  defaultAddress: 'Chennai, Tamil Nadu',
                  latitude: 13.0827,
                  longitude: 80.2707,
                },
              },
            }
          : input.role === 'ENGINEER'
          ? {
              engineer: {
                create: {
                  bio: 'Certified Network Specialist',
                  city: 'Chennai',
                  serviceRadiusKm: 20,
                  latitude: 13.085,
                  longitude: 80.21,
                  status: 'VERIFIED',
                  availability: 'ONLINE',
                  experienceYears: 5,
                  rating: 5.0,
                },
              },
            }
          : {}),
      },
    });

    res.status(201).json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'REGISTRATION_FAILED' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const input = loginSchema.parse(req.body);
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(input.email ? [{ email: input.email }] : []),
          ...(input.phone ? [{ phone: input.phone }] : []),
        ],
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'USER_NOT_FOUND' });
    }

    res.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'LOGIN_FAILED' });
  }
});

// Send OTP
router.post('/otp/send', async (req, res) => {
  const phone = req.body.phone;
  if (!phone) return res.status(400).json({ error: 'PHONE_REQUIRED' });
  res.json({
    ok: true,
    message: `OTP sent successfully to ${phone}`,
    devOtp: '123456',
  });
});

// Verify OTP
router.post('/otp/verify', async (req, res) => {
  try {
    const input = otpVerifySchema.parse(req.body);
    if (input.otp !== '123456' && input.otp !== '000000') {
      return res.status(400).json({ error: 'INVALID_OTP' });
    }

    let user = await prisma.user.findUnique({
      where: { phone: input.phone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: input.name || `User ${input.phone.slice(-4)}`,
          phone: input.phone,
          role: input.role as UserRole,
          ...(input.role === 'CUSTOMER'
            ? {
                customer: {
                  create: {
                    defaultAddress: 'Chennai, Tamil Nadu',
                    latitude: 13.0827,
                    longitude: 80.2707,
                  },
                },
              }
            : {
                engineer: {
                  create: {
                    city: 'Chennai',
                    serviceRadiusKm: 20,
                    status: 'VERIFIED',
                    availability: 'ONLINE',
                  },
                },
              }),
        },
      });
    }

    res.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'OTP_VERIFICATION_FAILED' });
  }
});

export default router;
