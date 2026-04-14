import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import '../styles/FAQ.css';

const FAQ = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: 'Shipping & Delivery',
      questions: [
        {
          q: 'How long does shipping take?',
          a: 'Orders are processed within 1-3 business days and typically arrive within 2-5 business days via expedited shipping. Most orders arrive within 48 hours of shipment.'
        },
        {
          q: 'How is my order packaged?',
          a: 'All orders are packed in insulated boxes with dry ice and gel packs to maintain safe temperatures during transit. Products may arrive fully frozen, partially thawed but cold, or refrigerated—all are safe conditions.'
        },
        {
          q: 'What if I\'m not home for delivery?',
          a: 'We recommend refrigerating or freezing your order as soon as possible. If you won\'t be home, consider using a cooler or requesting signature confirmation for added security.'
        },
        {
          q: 'Do you ship nationwide?',
          a: 'We currently serve select areas across the United States. Enter your zip code at checkout to confirm availability in your region.'
        }
      ]
    },
    {
      category: 'Freshness & Quality',
      questions: [
        {
          q: 'How fresh is the meat?',
          a: 'All products are vacuum-sealed immediately after cutting and frozen or chilled to preserve peak freshness. From butcher to your door in days, not weeks.'
        },
        {
          q: 'What if my order arrives thawed?',
          a: 'It\'s normal for products to arrive partially thawed but still cold. As long as the meat is cold to the touch and there are no signs of spoilage, it is safe. Refrigerate or freeze immediately upon arrival.'
        },
        {
          q: 'Can I refreeze thawed meat?',
          a: 'Yes, as long as the meat was kept cold during transit and has not been at room temperature for more than 2 hours. Refreezing may slightly affect texture but is safe.'
        },
        {
          q: 'How long does the meat last?',
          a: 'Frozen: Up to 12 months. Refrigerated: 3-5 days. Vacuum-sealed products have extended shelf life. Always follow USDA food safety guidelines.'
        }
      ]
    },
    {
      category: 'Orders & Returns',
      questions: [
        {
          q: 'Can I cancel or modify my order?',
          a: 'Orders cannot be modified or canceled once processed or shipped. Contact us immediately if you need to make changes—we\'ll do our best to help.'
        },
        {
          q: 'What is your return policy?',
          a: 'Due to the perishable nature of our products, we do not accept returns. If your order arrives damaged, incorrect, or unsafe, contact us within 24 hours with photos for a replacement or refund.'
        },
        {
          q: 'What if something is wrong with my order?',
          a: 'Contact us within 24 hours of delivery with photos of the product and packaging. If approved, we\'ll offer a replacement, store credit, or full refund on a case-by-case basis.'
        }
      ]
    },
    {
      category: 'Membership & Pricing',
      questions: [
        {
          q: 'How do memberships work?',
          a: 'Memberships provide ongoing discounts and perks. Choose monthly or yearly billing. Cancel anytime—benefits remain active until the end of your current billing period.'
        },
        {
          q: 'Can I switch membership tiers?',
          a: 'Yes, you can upgrade or downgrade at any time. Changes take effect at your next billing cycle.'
        },
        {
          q: 'Are membership fees refundable?',
          a: 'No, all membership fees are non-refundable once charged. However, you retain full benefits until the end of your billing period even after cancellation.'
        }
      ]
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="faq-container">
        <Button onClick={() => navigate('/')} className="back-btn" variant="ghost">
          <ArrowLeft size={18} />
          Back to Home
        </Button>

        <div className="faq-hero">
          <h1>Frequently Asked Questions</h1>
          <p>Everything you need to know about shipping, freshness, and delivery</p>
        </div>

        <div className="faq-content">
          {faqs.map((category, catIndex) => (
            <div key={catIndex} className="faq-category">
              <h2>{category.category}</h2>
              <div className="faq-list">
                {category.questions.map((faq, qIndex) => {
                  const globalIndex = catIndex * 100 + qIndex;
                  return (
                    <Card 
                      key={qIndex} 
                      className={`faq-item ${openIndex === globalIndex ? 'open' : ''}`}
                      onClick={() => toggleFAQ(globalIndex)}
                    >
                      <div className="faq-question">
                        <h4>{faq.q}</h4>
                        <ChevronDown size={20} className={`chevron ${openIndex === globalIndex ? 'rotate' : ''}`} />
                      </div>
                      {openIndex === globalIndex && (
                        <div className="faq-answer">
                          <p>{faq.a}</p>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="faq-cta">
          <h3>Still have questions?</h3>
          <p>Our team is here to help</p>
          <div className="cta-buttons">
            <Button onClick={() => navigate('/contact')} className="contact-btn">
              Contact Support
            </Button>
            <Button onClick={() => navigate('/delivery')} variant="outline">
              How Delivery Works
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;