import Stripe from "stripe";
import { storage } from "./storage";
import { PLAN_CONFIG } from "@shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("[Stripe] STRIPE_SECRET_KEY not set - Stripe integration disabled");
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-09-30.clover",
    })
  : null;

export const isStripeTestMode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") || false;

export async function createCheckoutSession(
  userId: number,
  userEmail: string,
  planTier: string
) {
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  const plan = PLAN_CONFIG[planTier as keyof typeof PLAN_CONFIG];
  if (!plan || plan.price === 0) {
    throw new Error("Invalid plan");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `Council ${plan.name} Plan`,
            description: `${plan.queries} consensus queries per month`,
          },
          unit_amount: plan.price * 100,
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: userId.toString(),
      planTier,
    },
    success_url: `https://${process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost:5000"}/upgrade?success=true`,
    cancel_url: `https://${process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost:5000"}/upgrade?canceled=true`,
  });

  return session;
}

export async function handleWebhook(event: Stripe.Event) {
  console.log(`[Stripe] Webhook received: ${event.type}`);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = parseInt(session.metadata?.userId || "0");
      const planTier = session.metadata?.planTier as string;

      if (!userId || !planTier) {
        console.error("[Stripe] Missing metadata in checkout session");
        return;
      }

      const plan = PLAN_CONFIG[planTier as keyof typeof PLAN_CONFIG];
      if (!plan) {
        console.error(`[Stripe] Invalid plan tier: ${planTier}`);
        return;
      }

      console.log(`[Stripe] Activating ${planTier} plan for user ${userId}`);

      // Update user plan and quota
      const user = await storage.getUser(userId);
      if (!user) {
        console.error(`[Stripe] User ${userId} not found`);
        return;
      }

      // Create subscription record
      if (session.subscription) {
        await storage.createSubscription({
          userId,
          stripeSubscriptionId: session.subscription as string,
          stripePriceId: session.line_items?.data[0]?.price?.id || null,
          status: "active",
          planTier,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
        });
      }

      // Update user with Stripe customer ID and new plan
      await storage.updateUser(userId, {
        stripeCustomerId: session.customer as string,
        planTier,
        queriesUsed: 0,
        quotaRemaining: plan.queries,
        billingCycleStart: new Date(),
      });

      console.log(`[Stripe] Successfully upgraded user ${userId} to ${planTier}`);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as any; // Stripe subscription object
      const userId = parseInt(subscription.metadata?.userId || "0");

      if (!userId) {
        console.error("[Stripe] Missing userId in subscription metadata");
        return;
      }

      await storage.updateSubscription(userId, {
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : undefined,
        currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : undefined,
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      });

      console.log(`[Stripe] Updated subscription for user ${userId}`);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as any; // Stripe subscription object
      const userId = parseInt(subscription.metadata?.userId || "0");

      if (!userId) {
        console.error("[Stripe] Missing userId in subscription metadata");
        return;
      }

      // Downgrade to free plan
      const user = await storage.getUser(userId);
      if (user) {
        await storage.updateUser(userId, {
          planTier: "free",
          queriesUsed: 0,
          quotaRemaining: PLAN_CONFIG.free.queries,
          billingCycleStart: new Date(),
        });

        await storage.updateSubscription(userId, {
          status: "canceled",
        });

        console.log(`[Stripe] Downgraded user ${userId} to free plan`);
      }
      break;
    }

    default:
      console.log(`[Stripe] Unhandled webhook type: ${event.type}`);
  }
}
