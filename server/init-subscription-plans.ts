import { mongoStorage } from './mongodb-storage';

// Initialize default subscription plans
async function initializeSubscriptionPlans() {
  try {
    await mongoStorage.initialize();
    
    const defaultPlans = [
      {
        id: 'digital-free',
        name: 'Digital Free',
        description: 'Perfect for digital postcard enthusiasts',
        stripePriceId: null, // Free plan
        monthlyPrice: 0,
        features: [
          'Free digital postcards',
          '5 AI stories per month',
          'Basic templates',
          'Standard quality exports'
        ]
      },
      {
        id: 'print-ship',
        name: 'Print & Ship',
        description: 'Digital plus physical postcards with AI stories',
        stripePriceId: 'price_print_ship_monthly', // This should be replaced with actual Stripe price ID
        monthlyPrice: 4.99,
        features: [
          'Unlimited digital postcards',
          '1 free physical postcard per month',
          '20 AI stories per month',
          'No watermarks',
          'Standard templates',
          'Shipping costs apply separately'
        ]
      },
      {
        id: 'premium-access',
        name: 'Premium Access',
        description: 'Full access with premium features and unlimited AI',
        stripePriceId: 'price_premium_access_monthly', // This should be replaced with actual Stripe price ID
        monthlyPrice: 9.99,
        features: [
          'Unlimited digital postcards',
          'Premium templates included',
          '200 AI stories per month',
          'No watermarks',
          'Priority customer support',
          'Advanced customization options',
          'High-resolution exports'
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