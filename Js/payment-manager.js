// Example Stripe integration
class PaymentManager {
    constructor() {
        this.stripe = null;
        this.init();
    }
    
    async init() {
        // Load Stripe.js
        if (!window.Stripe) {
            await this.loadStripeJS();
        }
        
        // Initialize Stripe with your publishable key
        this.stripe = Stripe('pk_test_your_publishable_key');
    }
    
    async loadStripeJS() {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }
    
    async createCheckoutSession(priceId, successUrl, cancelUrl) {
        try {
            // Call your backend to create checkout session
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId,
                    successUrl,
                    cancelUrl,
                    customerEmail: window.userManager?.user?.email
                })
            });
            
            const session = await response.json();
            
            // Redirect to Stripe Checkout
            const result = await this.stripe.redirectToCheckout({
                sessionId: session.id
            });
            
            if (result.error) {
                showToast('Payment failed: ' + result.error.message, 'error');
            }
        } catch (error) {
            console.error('Payment error:', error);
            showToast('Payment processing failed', 'error');
        }
    }
}