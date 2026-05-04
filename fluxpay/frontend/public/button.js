// Define <fluxpay-button> custom element
class FluxPayButton extends HTMLElement {
  connectedCallback() {
    const apiKey = this.getAttribute('api-key') || this.getAttribute('merchant-id');
    const amount = this.getAttribute('amount');
    const token = this.getAttribute('token');
    const orderId = this.getAttribute('order-id');
    const successUrl = this.getAttribute('success-url');
    const cancelUrl = this.getAttribute('cancel-url');
    
    // Support either local dev or production URL based on script src
    const scriptSrc = document.currentScript ? document.currentScript.src : '';
    const isLocal = scriptSrc.includes('localhost') || window.location.hostname === 'localhost';
    const baseUrl = isLocal ? 'http://localhost:5000' : 'https://api.fluxpay.com';

    const button = document.createElement('button');
    button.textContent = 'Pay with FluxPay';
    button.style.cssText = `background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color:white; border:none; border-radius:8px; padding:12px 24px; font-size:16px; font-weight:600; cursor:pointer; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2); transition: all 0.2s ease;`;
    
    button.onmouseover = () => {
      button.style.transform = 'translateY(-1px)';
      button.style.boxShadow = '0 6px 8px rgba(79, 70, 229, 0.3)';
    };
    
    button.onmouseout = () => {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 4px 6px rgba(79, 70, 229, 0.2)';
    };

    button.onclick = async () => {
      button.textContent = 'Processing...';
      button.disabled = true;
      button.style.opacity = '0.8';

      try {
        const response = await fetch(`${baseUrl}/api/checkout/sessions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`, // API key passed as bearer
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ amount: parseFloat(amount), token, orderId, successUrl, cancelUrl })
        });
        
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to create checkout session');
        }
        
        const { checkoutUrl } = await response.json();
        window.location.href = checkoutUrl;
      } catch (error) {
        console.error('FluxPay Error:', error);
        button.textContent = 'Error - Try Again';
        button.disabled = false;
        button.style.opacity = '1';
        alert('Failed to initialize FluxPay Checkout: ' + error.message);
      }
    };
    
    this.appendChild(button);
  }
}
customElements.define('fluxpay-button', FluxPayButton);
