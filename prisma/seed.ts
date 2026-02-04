import { PrismaClient } from '@prisma/client';
import { slugify } from '../src/lib/slugify';

/**
 * Database Seed Script
 *
 * Populates the database with sample automotive tuning content.
 * Run with: npm run db:seed
 */

const prisma = new PrismaClient();

// Helper to generate SEO description from content
function generateSeoDesc(content: string, maxLength: number = 160): string {
  const text = content
    .replace(/!\[.*?\]\([^)]+\)/g, '') // Remove images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/^#+\s+/gm, '') // Remove headers
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1') // Remove bold/italic
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length > maxLength) {
    return text.substring(0, maxLength - 3).trim() + '...';
  }
  return text;
}

// Helper to extract first image from content
function extractFirstImage(content: string): string | null {
  const match = content.match(/!\[.*?\]\((https?:\/\/[^)]+)\)/);
  return match ? match[1] : null;
}

async function main() {
  console.log('🌱 Seeding database with automotive tuning content...');

  // ============================================
  // INITIAL BLOG POST - Renault Sport Megane Stage 2
  // ============================================
  const initialPostTitle = 'Stage 2 ECU Tune for Renault Sport Megane – Full Performance Upgrade';
  const initialPostSlug = slugify(initialPostTitle);

  const initialPostContent = `# Stage 2 ECU Tune for Renault Sport Megane – Full Performance Upgrade

The **Renault Sport Megane RS** is already a formidable hot hatch straight from the factory, but with the right modifications, it can be transformed into an absolute track weapon. In this build showcase, we walk you through our comprehensive Stage 2 ECU tuning package that pushed this French performance icon to its limits.

![Renault Megane RS on the dyno](https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&h=800&fit=crop)

## The Starting Point

Our client brought in their 2019 Megane RS 280 with 45,000 miles on the clock. The turbocharged 1.8L engine was in excellent condition, making it the perfect candidate for our Stage 2 package. Before any tuning, we ran baseline dyno tests showing **276 bhp** and **288 lb-ft of torque** at the wheels – slightly below factory figures due to drivetrain losses.

### Pre-Tune Checklist

Before diving into the ECU remap, we performed a comprehensive health check:

- **Compression test** across all cylinders
- **Boost leak test** to ensure turbo system integrity
- **Spark plug inspection** and gap check
- **Fuel system pressure** verification
- **Oil analysis** for any signs of wear

![Engine bay with intake installed](https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=800&fit=crop)

## Stage 2 Modifications

Our Stage 2 package for the Megane RS includes the following hardware upgrades to support the increased power:

- **High-flow sports catalytic converter** – reduces backpressure by 40%
- **Upgraded intercooler** – 30% larger core for reduced intake temps
- **Cold air intake system** – improved airflow and induction sound
- **Performance spark plugs** – one step colder for detonation resistance

With the hardware in place, we moved on to the star of the show – the **custom ECU calibration**.

## ECU Remapping Results

Using our proprietary tuning software and in-house developed maps, we optimized the following parameters:

| Parameter | Stock | Stage 2 |
|-----------|-------|---------|
| Boost Pressure | 1.2 bar | 1.55 bar |
| Ignition Timing | Conservative | Optimized per cylinder |
| Fueling | Rich | Stoichiometric under boost |
| Rev Limit | 6,500 rpm | 6,800 rpm |
| Torque Limiters | Multiple | Reduced |

### Final Power Figures

After three rounds of dyno tuning and real-world testing, the Megane RS now produces:

- **342 bhp** (+66 bhp over stock)
- **368 lb-ft of torque** (+80 lb-ft over stock)
- **0-60 mph in 4.8 seconds** (down from 5.7s)

![Dyno graph showing before and after](https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&h=800&fit=crop)

## Safety First: Our Tuning Philosophy

At Toxic Tuning, we don't believe in pushing engines beyond safe limits. Every Stage 2 tune we deliver includes:

1. **Conservative boost targets** – staying well within turbo efficiency maps
2. **Knock detection calibration** – the ECU pulls timing instantly if knock is detected
3. **Thermal protection** – reduced power when intake temps exceed thresholds
4. **Fuel quality compensation** – maps optimized for both 95 and 99 RON fuel

## Customer Feedback

> "The difference is night and day. The Megane now pulls like a train from 3,000 rpm all the way to redline. It's transformed the car without losing any of the drivability I love for daily use." – Mark T., London

## FAQs

### Is Stage 2 safe for daily driving?

Yes, our Stage 2 tunes are designed for daily reliability. We use conservative safety margins and all our maps include thermal protection.

### Will this void my warranty?

Modified ECU software can affect manufacturer warranty claims related to the engine and drivetrain. We recommend discussing this with your dealer before proceeding.

### What's the difference between Stage 1 and Stage 2?

Stage 1 is a software-only tune working within stock hardware limits. Stage 2 requires supporting modifications (intake, exhaust, intercooler) to safely make more power.

### How long does the tuning process take?

A full Stage 2 installation and custom dyno tune typically takes 1-2 days depending on the vehicle and modifications required.

---

**Ready to unleash your Megane's potential?** Contact us today for a free consultation and discover what Stage 2 can do for your car.
`;

  // Check if post already exists
  const existingPost = await prisma.post.findUnique({
    where: { slug: initialPostSlug },
  });

  if (!existingPost) {
    const initialPost = await prisma.post.create({
      data: {
        title: initialPostTitle,
        slug: initialPostSlug,
        content: initialPostContent,
        excerpt: 'Complete breakdown of our Stage 2 ECU tune on a Renault Sport Megane RS, achieving 342 bhp with full safety margins. Includes dyno results, modifications list, and customer feedback.',
        published: true,
        // SEO fields with automatic generation
        thumbnail: extractFirstImage(initialPostContent),
        seoTitle: 'Stage 2 ECU Tune for Renault Megane RS | +66 BHP Performance Upgrade',
        seoDesc: generateSeoDesc(initialPostContent),
        seoImage: extractFirstImage(initialPostContent),
      },
    });

    // Track images used in the post
    await prisma.postImage.createMany({
      data: [
        {
          postId: initialPost.id,
          url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&h=800&fit=crop',
          altText: 'Renault Megane RS on the dyno at Toxic Tuning',
        },
        {
          postId: initialPost.id,
          url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=800&fit=crop',
          altText: 'Megane RS engine bay with Stage 2 intake installed',
        },
        {
          postId: initialPost.id,
          url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&h=800&fit=crop',
          altText: 'Dyno graph comparing stock vs Stage 2 power curves',
        },
      ],
    });

    console.log('✅ Created initial blog post:', initialPost.title);
  } else {
    console.log('ℹ️  Initial blog post already exists, skipping...');
  }

  // ============================================
  // ADDITIONAL SAMPLE POSTS
  // ============================================

  const additionalPosts = [
    {
      title: 'BMW 335i N54 Stage 1 Remap – The Ultimate Starter Tune',
      content: `# BMW 335i N54 Stage 1 Remap – The Ultimate Starter Tune

The BMW N54 twin-turbo engine is legendary in the tuning community. Here's why a Stage 1 remap is the perfect first modification for your 335i.

![BMW 335i front view](https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&h=800&fit=crop)

## Why the N54 is Perfect for Tuning

The N54 was BMW's first mass-produced twin-turbo petrol engine, and it came from the factory with significant headroom for additional power. The stock internals can safely handle **400+ bhp** with proper tuning.

## Stage 1 Results

Our Stage 1 tune delivers:
- **380 bhp** (up from 306)
- **400 lb-ft torque** (up from 295)
- Improved throttle response
- Smoother power delivery

No hardware modifications required – just pure software optimization.

## Is Stage 1 Worth It?

Absolutely. For the cost of a Stage 1 tune, you gain nearly 75 bhp and transform the driving experience completely.
`,
      excerpt: 'Discover why the BMW N54 engine is a tuner favorite and what gains you can expect from a Stage 1 ECU remap.',
      published: true,
    },
    {
      title: 'Understanding ECU Remapping: A Complete Beginner\'s Guide',
      content: `# Understanding ECU Remapping: A Complete Beginner's Guide

New to the world of ECU tuning? This guide explains everything you need to know about remapping your car's engine control unit.

![Car ECU unit](https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&h=800&fit=crop)

## What is ECU Remapping?

ECU (Engine Control Unit) remapping involves modifying the software that controls your engine's parameters. Manufacturers typically use conservative settings to account for various fuel qualities, climates, and driver habits.

## Key Parameters Modified

- **Boost pressure** (turbocharged engines)
- **Fuel injection timing**
- **Ignition timing**
- **Rev limiters**
- **Torque limiters**

## Benefits of Remapping

1. **Increased power and torque**
2. **Improved throttle response**
3. **Better fuel economy** (when driven normally)
4. **Smoother power delivery**

## Is Remapping Safe?

When done by professionals using quality equipment, remapping is completely safe. We always stay within the mechanical limits of your engine.
`,
      excerpt: 'Everything beginners need to know about ECU remapping – what it is, how it works, and whether it\'s right for your car.',
      published: true,
    },
  ];

  for (const postData of additionalPosts) {
    const slug = slugify(postData.title);
    const existing = await prisma.post.findUnique({ where: { slug } });

    if (!existing) {
      const post = await prisma.post.create({
        data: {
          title: postData.title,
          slug,
          content: postData.content,
          excerpt: postData.excerpt,
          published: postData.published,
          thumbnail: extractFirstImage(postData.content),
          seoDesc: generateSeoDesc(postData.content),
        },
      });
      console.log('✅ Created post:', post.title);
    }
  }

  // Print summary
  console.log('\n📊 Database Summary:');
  console.log(`   Posts: ${await prisma.post.count()}`);
  console.log(`   Published: ${await prisma.post.count({ where: { published: true } })}`);
  console.log(`   Images: ${await prisma.postImage.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
