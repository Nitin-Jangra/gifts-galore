import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Gifts Galore database seed for Supabase...');

  // 1. Create Platform Admin
  const adminPasswordHash = await argon2.hash('Admin@GiftsGalore2026!');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@giftsgalore.in' },
    update: {},
    create: {
      email: 'admin@giftsgalore.in',
      fullName: 'Gifts Galore Administrator',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Admin account ready:', admin.email);

  // 2. Create Initial Seller: Gifts Galore, Loharu
  const sellerPasswordHash = await argon2.hash('Artisan@Loharu2026!');
  const sellerUser = await prisma.user.upsert({
    where: { email: 'loharu@giftsgalore.in' },
    update: {},
    create: {
      email: 'loharu@giftsgalore.in',
      fullName: 'Ramswaroop Sharma (Master Artisan)',
      passwordHash: sellerPasswordHash,
      role: 'SELLER',
      status: 'ACTIVE',
      sellerProfile: {
        create: {
          storeName: 'Gifts Galore, Loharu',
          slug: 'gifts-galore-loharu',
          description: 'Heritage artisan workshop crafting bell-metal brassware and solid Sheesham wood keepsakes in Loharu, Haryana.',
          city: 'Loharu',
          state: 'Haryana',
          country: 'India',
          contactPhone: '+91 98123 45678',
          contactEmail: 'contact@giftsgalore.in',
          status: 'ACTIVE',
        },
      },
    },
    include: { sellerProfile: true },
  });
  console.log('✅ Seller store ready:', sellerUser.sellerProfile.storeName);

  // 3. Create Sample Customer
  const customerPasswordHash = await argon2.hash('Customer@123!');
  const customer = await prisma.user.upsert({
    where: { email: 'priya.sharma@example.com' },
    update: {},
    create: {
      email: 'priya.sharma@example.com',
      fullName: 'Priya Sharma',
      phone: '+91 98765 43210',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Sample customer ready:', customer.email);

  // 4. Create Category
  const category = await prisma.category.upsert({
    where: { slug: 'handcrafted-keepsakes' },
    update: {},
    create: {
      name: 'Handcrafted Keepsakes',
      slug: 'handcrafted-keepsakes',
      description: 'Hand-carved wood and bell metal treasures made in Haryana.',
    },
  });

  // 5. Create Ready-Made Product
  await prisma.product.upsert({
    where: { slug: 'loharu-brass-diya-scented-candle-hamper' },
    update: {},
    create: {
      sellerId: sellerUser.sellerProfile.id,
      categoryId: category.id,
      name: 'Loharu Brass Bell-Metal Diya & Scented Candle Hamper',
      slug: 'loharu-brass-diya-scented-candle-hamper',
      description: 'Handcrafted bell metal diya made by traditional metalsmiths in Loharu, paired with organic soy wax lavender candles.',
      productType: 'READY_MADE',
      status: 'ACTIVE',
      availability: 'IN_STOCK',
      price: 1299.0,
      discountPrice: 1099.0,
      stockQuantity: 18,
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
            isPrimary: true,
          },
        ],
      },
    },
  });

  // 6. Create Customizable Product with Customization Fields
  await prisma.product.upsert({
    where: { slug: 'custom-engraved-wooden-keepsake-box' },
    update: {},
    create: {
      sellerId: sellerUser.sellerProfile.id,
      categoryId: category.id,
      name: 'Custom Engraved Sheesham Keepsake Memory Box',
      slug: 'custom-engraved-wooden-keepsake-box',
      description: 'Solid sheesham wood treasure chest personalized with custom recipient name, celebration date, and carved greeting.',
      productType: 'CUSTOMIZABLE',
      status: 'ACTIVE',
      availability: 'IN_STOCK',
      price: 1499.0,
      discountPrice: 1350.0,
      stockQuantity: 12,
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
            isPrimary: true,
          },
        ],
      },
      customFields: {
        create: [
          {
            label: 'Recipient Name to Engrave',
            instructions: 'Enter name or couple names for top lid engraving (up to 40 characters)',
            fieldType: 'TEXT',
            isRequired: true,
            maxLength: 40,
            displayOrder: 1,
          },
          {
            label: 'Occasion or Date',
            instructions: 'e.g., 25th Anniversary • 14 Feb 2026',
            fieldType: 'TEXT',
            isRequired: false,
            maxLength: 30,
            displayOrder: 2,
          },
        ],
      },
    },
  });

  // 7. Create On-Demand Bespoke Product
  await prisma.product.upsert({
    where: { slug: 'commissioned-portrait-custom-calligraphy-scroll' },
    update: {},
    create: {
      sellerId: sellerUser.sellerProfile.id,
      categoryId: category.id,
      name: 'Commissioned Portrait & Custom Calligraphy Scroll',
      slug: 'commissioned-portrait-custom-calligraphy-scroll',
      description: 'Bespoke hand-inked traditional scroll commissioned to your specifications with custom poetry or wedding vows.',
      productType: 'ON_DEMAND',
      status: 'ACTIVE',
      availability: 'MADE_TO_ORDER',
      price: 3499.0,
      discountPrice: null,
      stockQuantity: 0,
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
            isPrimary: true,
          },
        ],
      },
    },
  });

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
