import { mongoStorage } from './mongodb-storage';

// Initialize default subscription plans
async function initializeSubscriptionPlans() {
  try {
    await mongoStorage.initialize();
    
    const defaultPlans = [
      {
        id: 'basic-monthly',
        name: 'Basic Plan',
        description: 'Perfect for occasional postcard senders',
        stripePriceId: 'price_basic_monthly', // This should be replaced with actual Stripe price ID
        monthlyPrice: 9.99,
        features: [
          'Unlimited digital postcards',
          '10 physical postcards per month',
          'Free worldwide shipping',
          'Standard templates'
        ]
      },
      {
        id: 'premium-monthly',
        name: 'Premium Plan',
        description: 'Best for frequent travelers and postcard enthusiasts',
        stripePriceId: 'price_premium_monthly', // This should be replaced with actual Stripe price ID
        monthlyPrice: 19.99,
        features: [
          'Unlimited digital postcards',
          'Unlimited physical postcards',
          'Free worldwide shipping',
          'Premium templates',
          'Priority customer support',
          'Custom postcard designs'
        ]
      },
      {
        id: 'family-monthly',
        name: 'Family Plan',
        description: 'Share the joy with your whole family',
        stripePriceId: 'price_family_monthly', // This should be replaced with actual Stripe price ID
        monthlyPrice: 29.99,
        features: [
          'Up to 5 family accounts',
          'Unlimited digital postcards',
          'Unlimited physical postcards',
          'Free worldwide shipping',
          'Premium templates',
          'Priority customer support',
          'Custom postcard designs',
          'Family photo albums'
        ]
      }
    ];

    for (const plan of defaultPlans) {
      try {
        const existingPlan = await mongoStorage.getSubscriptionPlan(plan.id);
        if (!existingPlan) {
          await mongoStorage.createSubscriptionPlan(plan);
          console.log(`Created subscription plan: ${plan.name}`);
        } else {
          console.log(`Subscription plan already exists: ${plan.name}`);
        }
      } catch (error) {
        console.error(`Error creating plan ${plan.name}:`, error);
      }
    }

    console.log('Subscription plans initialization completed');
  } catch (error) {
    console.error('Error initializing subscription plans:', error);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeSubscriptionPlans();
}

export { initializeSubscriptionPlans };