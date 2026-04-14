import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronRight, Sparkles, Award, Clock, Flame } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.2]);

  const masterCuts = [
    {
      category: "The Wagyu & Reserve Collection",
      cuts: [
        {
          name: "Wagyu Ribeye",
          grade: "A5 Japanese",
          image: "https://images.unsplash.com/photo-1547050605-2f268cd5daf0",
          description: "Unparalleled marbling perfection"
        },
        {
          name: "Wagyu NY Strip",
          grade: "Premium Grade",
          image: "https://images.unsplash.com/photo-1600180786732-6189f0ad253d",
          description: "The epitome of tenderness"
        },
        {
          name: "Dry-Aged Steak",
          grade: "45-Day Aged",
          image: "https://images.unsplash.com/photo-1558030077-82dd9347c407",
          description: "Concentrated flavor intensity"
        }
      ]
    },
    {
      category: "The Bone-In Apex",
      cuts: [
        {
          name: "Porterhouse",
          grade: "Master Cut",
          image: "https://images.unsplash.com/photo-1614277786110-1a64e457c4c3",
          description: "The ultimate dual experience"
        },
        {
          name: "T-Bone",
          grade: "Premium Select",
          image: "https://images.unsplash.com/photo-1606374894242-19110fdbd56c",
          description: "Classic steakhouse precision"
        },
        {
          name: "Tomahawk Steak",
          grade: "Seasonal Vault",
          image: "https://images.unsplash.com/photo-1579636858731-24857b3f4305",
          badge: true,
          description: "The crown jewel presentation"
        }
      ]
    },
    {
      category: "The Craftsman's Specialty",
      cuts: [
        {
          name: "Whole Picanha",
          grade: "Fat Cap On",
          image: "https://images.unsplash.com/photo-1579636859172-67ced5686109",
          description: "Brazilian masterpiece"
        },
        {
          name: "Cupim",
          grade: "Heritage Cut",
          image: "https://images.unsplash.com/photo-1547050605-2f268cd5daf0",
          description: "Rare delicacy reserve"
        },
        {
          name: "Filet Mignon",
          grade: "Center Cut",
          image: "https://images.unsplash.com/photo-1600180786732-6189f0ad253d",
          description: "Buttery perfection"
        },
        {
          name: "Beef Short Ribs",
          grade: "Prime Selection",
          image: "https://images.unsplash.com/photo-1558030077-82dd9347c407",
          description: "Braising excellence"
        },
        {
          name: "Flank Steak",
          grade: "Grain Perfect",
          image: "https://images.unsplash.com/photo-1614277786110-1a64e457c4c3",
          description: "Maximum flavor density"
        }
      ]
    }
  ];

  const boxBuilderSteps = [
    {
      step: "01",
      title: "THE FOUNDATION",
      description: "Select your primary protein from our master inventory",
      icon: Award
    },
    {
      step: "02",
      title: "THE PRECISION",
      description: "Specify your exact thickness and dry-aging duration",
      icon: Clock
    },
    {
      step: "03",
      title: "THE FINISH",
      description: "Add craftsman essentials—smoked sea salts and bone marrow compound butters",
      icon: Flame
    }
  ];

  return (
    <div className="landing-page">
      {/* SECTION 1: HERO */}
      <motion.section 
        className="hero-section"
        style={{ opacity: heroOpacity }}
      >
        <motion.div 
          className="hero-background"
          style={{ scale: heroScale }}
        >
          <img 
            src="https://images.pexels.com/photos/31406830/pexels-photo-31406830.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" 
            alt="Premium Wagyu"
            className="hero-image"
          />
          <div className="hero-overlay"></div>
        </motion.div>
        
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <h1 className="hero-headline">
              THE APEX OF BONE-IN.<br/>
              GASTRONOMY, BORN IN PRECISION.
            </h1>
            <p className="hero-subheadline">
              Mastermeatbox delivers unparalleled, master-crafted Wagyu and heritage cuts.<br/>
              Every millimeter, every grain, perfectly engineered.
            </p>
            <Button 
              className="hero-cta"
              onClick={() => window.location.href = 'https://mastermeatbox.com'}
            >
              <span>ENGINEER YOUR GASTRONOMY</span>
              <ChevronRight className="cta-icon" />
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* SECTION 2: MASTER'S INVENTORY */}
      <section className="inventory-section">
        <div className="section-container">
          <motion.h2 
            className="section-headline"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            THE MARBLING MASTERPIECE.
          </motion.h2>

          {masterCuts.map((group, groupIndex) => (
            <div key={groupIndex} className="cut-category">
              <h3 className="category-title">{group.category}</h3>
              <div className="cuts-grid">
                {group.cuts.map((cut, cutIndex) => (
                  <motion.div
                    key={cutIndex}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: cutIndex * 0.1 }}
                  >
                    <Card className="cut-card">
                      <div className="cut-image-wrapper">
                        <img src={cut.image} alt={cut.name} className="cut-image" />
                        {cut.badge && (
                          <div className="seasonal-badge">
                            <Sparkles size={16} />
                            <span>SEASONAL VAULT</span>
                          </div>
                        )}
                      </div>
                      <div className="cut-details">
                        <div className="cut-grade">{cut.grade}</div>
                        <h4 className="cut-name">{cut.name}</h4>
                        <p className="cut-description">{cut.description}</p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}

          <div className="section-cta-wrapper">
            <Button 
              className="section-cta"
              onClick={() => window.location.href = 'https://mastermeatbox.com'}
            >
              EXPLORE THE PORTFOLIO
              <ChevronRight className="cta-icon" />
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 3: FLAGSHIP EXPERIENCE */}
      <section className="flagship-section">
        <div className="flagship-container">
          <motion.div 
            className="flagship-visual"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="box-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1610245169249-c7fbf6768884?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzR8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBibGFjayUyMGJveHxlbnwwfHx8YmxhY2t8MTc3NjEyNjQ5OHww&ixlib=rb-4.1.0&q=85" 
                alt="Master's Box"
                className="flagship-box"
              />
              <div className="box-glow"></div>
            </div>
          </motion.div>

          <motion.div 
            className="flagship-content"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="flagship-headline">
              THE CROWN JEWEL:<br/>
              THE MASTER'S BUTCHER.
            </h2>
            <p className="flagship-body">
              Introducing our most elite curation. Hand-forged quality meets dry-aged perfection. 
              This isn't a subscription; it's a membership into the art of the cut.
            </p>
            <Button 
              className="flagship-cta"
              onClick={() => window.location.href = 'https://mastermeatbox.com'}
            >
              CURATE THE MASTER'S SELECTION
              <ChevronRight className="cta-icon" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* SECTION 4: BOX BUILDER */}
      <section className="builder-section">
        <div className="section-container">
          <motion.h2 
            className="section-headline"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            BEYOND THE BLOCK. BUILD YOURS.
          </motion.h2>

          <div className="builder-grid">
            {boxBuilderSteps.map((step, index) => (
              <motion.div
                key={index}
                className="builder-step"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="step-number">{step.step}</div>
                <step.icon className="step-icon" size={48} />
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
                {index < boxBuilderSteps.length - 1 && (
                  <div className="step-arrow">
                    <ChevronRight size={32} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="section-cta-wrapper">
            <Button 
              className="section-cta builder-cta"
              onClick={() => window.location.href = 'https://mastermeatbox.com'}
            >
              LAUNCH THE BOX BUILDER
              <ChevronRight className="cta-icon" />
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 5: FINAL CALL */}
      <section className="final-section">
        <div className="final-content">
          <motion.h2 
            className="final-headline"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            RESPECT THE CUT. MASTER THE MEAT.
          </motion.h2>
          <p className="final-body">
            The grocery store is for the masses. Mastermeatbox is for the masters.<br/>
            Are you ready to respect the cut?
          </p>
          <Button 
            className="final-cta"
            onClick={() => window.location.href = 'https://mastermeatbox.com'}
          >
            <span className="cta-text">ENTER THE VAULT</span>
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-links">
          <a href="https://mastermeatbox.com" className="footer-link">Copyright © 2025</a>
          <span className="footer-separator">•</span>
          <a href="https://mastermeatbox.com" className="footer-link">Privacy Protocol</a>
          <span className="footer-separator">•</span>
          <a href="https://mastermeatbox.com" className="footer-link">Shipping Standards</a>
        </div>
        <div className="footer-tagline">PRECISION IN EVERY CUT.</div>
      </footer>
    </div>
  );
};

export default LandingPage;
