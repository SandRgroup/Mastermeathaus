import React, { useState } from 'react';
import { Flame, Sparkles, Users } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

// Configuration constants
const CATEGORIES = [
  { id: 'steak', label: 'Steak', icon: '🥩' },
  { id: 'chicken', label: 'Chicken', icon: '🍗' },
  { id: 'lamb', label: 'Lamb', icon: '🍖' },
  { id: 'pork', label: 'Pork', icon: '🥓' },
  { id: 'sausage', label: 'Sausage', icon: '🌭' }
];

const CUTS_BY_CATEGORY = {
  steak: [
    { id: 'ribeye', label: 'Ribeye', price: 24 },
    { id: 'tomahawk', label: 'Tomahawk', price: 45 },
    { id: 'strip', label: 'NY Strip', price: 22 },
    { id: 'filet', label: 'Filet Mignon', price: 38 },
    { id: 'tbone', label: 'T-Bone', price: 26 }
  ],
  chicken: [
    { id: 'whole', label: 'Whole Chicken', price: 12 },
    { id: 'quarters', label: 'Leg Quarters', price: 8 },
    { id: 'breast', label: 'Chicken Breast', price: 10 },
    { id: 'wings', label: 'Wings', price: 9 }
  ],
  lamb: [
    { id: 'chops', label: 'Lamb Chops', price: 32 },
    { id: 'rack', label: 'Rack of Lamb', price: 55 },
    { id: 'leg', label: 'Leg of Lamb', price: 28 }
  ],
  pork: [
    { id: 'ribs', label: 'Spare Ribs', price: 16 },
    { id: 'shoulder', label: 'Pork Shoulder', price: 14 },
    { id: 'belly', label: 'Pork Belly', price: 18 },
    { id: 'chops', label: 'Pork Chops', price: 12 }
  ],
  sausage: [
    { id: 'bratwurst', label: 'Bratwurst', price: 11 },
    { id: 'italian', label: 'Italian Sausage', price: 10 },
    { id: 'chorizo', label: 'Chorizo', price: 12 }
  ]
};

const BEEF_UPGRADES = [
  { id: 'standard', label: 'Standard', tag: 'Standard', modifier: 0 },
  { id: 'grass_fed', label: 'Grass Fed', tag: '+$4/lb', modifier: 4 },
  { id: 'wagyu', label: 'Wagyu', tag: '+$15/lb', modifier: 15 }
];

const EXAMPLE_PROMPTS = [
  '20 people luxury tomahawk dinner',
  '15 people chicken BBQ',
  '10 people mixed casual BBQ',
  '8 people lamb chops family dinner',
  '40 people sausage tailgate'
];

const AIBBQPlanner = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  
  // State
  const [prompt, setPrompt] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedCuts, setSelectedCuts] = useState({});
  const [beefQuality, setBeefQuality] = useState('standard');
  const [addons, setAddons] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  
  // Lead form state
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Parse prompt using simple regex
  const parsePrompt = (text) => {
    const peopleMatch = text.match(/(\d+)\s*people/i);
    const people = peopleMatch ? parseInt(peopleMatch[1]) : 10;
    
    // Detect event type
    let eventType = 'casual';
    if (/luxury|premium|high.?end/i.test(text)) eventType = 'luxury';
    else if (/family|dinner/i.test(text)) eventType = 'family';
    else if (/tailgate|party/i.test(text)) eventType = 'party';
    
    // Calculate portion size based on event type
    const portionMap = { luxury: 1.3, family: 1.1, party: 1.0, casual: 1.2 };
    const portionPerPerson = portionMap[eventType] || 1.2;
    
    return {
      people,
      eventType: eventType.charAt(0).toUpperCase() + eventType.slice(1) + ' experience',
      portionPerPerson
    };
  };

  const handlePromptChange = (text) => {
    setPrompt(text);
    if (text.length > 5) {
      const parsed = parsePrompt(text);
      setParsedData(parsed);
    }
  };

  const toggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
      // Remove all cuts from this category
      const newSelectedCuts = { ...selectedCuts };
      delete newSelectedCuts[categoryId];
      setSelectedCuts(newSelectedCuts);
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const toggleCut = (categoryId, cutId) => {
    setSelectedCuts(prev => {
      const categoryCuts = prev[categoryId] || [];
      if (categoryCuts.includes(cutId)) {
        return {
          ...prev,
          [categoryId]: categoryCuts.filter(id => id !== cutId)
        };
      } else {
        return {
          ...prev,
          [categoryId]: [...categoryCuts, cutId]
        };
      }
    });
  };

  const calculateTotalCuts = () => {
    return Object.values(selectedCuts).reduce((sum, cuts) => sum + cuts.length, 0);
  };

  const calculateEstimate = () => {
    if (!parsedData) return { totalLbs: 0, totalPrice: 0 };
    
    const { people, portionPerPerson } = parsedData;
    const totalMeat = people * portionPerPerson;
    
    let totalPrice = 0;
    let hasSteak = false;
    
    selectedCategories.forEach(catId => {
      const cuts = selectedCuts[catId] || [];
      if (cuts.length === 0) return;
      
      const availableCuts = CUTS_BY_CATEGORY[catId];
      const meatPerCut = totalMeat / selectedCategories.length / cuts.length;
      
      cuts.forEach(cutId => {
        const cut = availableCuts.find(c => c.id === cutId);
        if (cut) {
          let pricePerLb = cut.price;
          
          // Apply beef upgrade only to steak category
          if (catId === 'steak') {
            hasSteak = true;
            const upgrade = BEEF_UPGRADES.find(u => u.id === beefQuality);
            if (upgrade) pricePerLb += upgrade.modifier;
          }
          
          totalPrice += meatPerCut * pricePerLb;
        }
      });
    });
    
    return {
      totalLbs: totalMeat.toFixed(1),
      totalPrice: totalPrice.toFixed(2),
      hasSteak
    };
  };

  const handleGenerate = () => {
    if (!prompt || selectedCategories.length === 0 || calculateTotalCuts() === 0) {
      toast.error('Please enter a prompt and select at least one cut');
      return;
    }
    
    setShowLeadForm(true);
    toast.success('Plan generated! Enter your details to receive it.');
  };

  const handleSubmitLead = async (e) => {
    e.preventDefault();
    
    if (!firstName || !email || !zipCode) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setGenerating(true);
    
    try {
      const estimate = calculateEstimate();
      const cutsBreakdown = {};
      
      selectedCategories.forEach(catId => {
        const cuts = selectedCuts[catId] || [];
        cutsBreakdown[catId] = cuts.map(cutId => {
          const cut = CUTS_BY_CATEGORY[catId].find(c => c.id === cutId);
          return cut ? cut.label : cutId;
        });
      });
      
      const payload = {
        prompt,
        people: parsedData?.people || 10,
        event_type: parsedData?.eventType || 'Casual',
        portion_per_person: parsedData?.portionPerPerson || 1.2,
        selected_categories: selectedCategories,
        selected_cuts: cutsBreakdown,
        beef_quality: beefQuality,
        addons,
        total_lbs: parseFloat(estimate.totalLbs),
        total_price: parseFloat(estimate.totalPrice),
        lead: {
          first_name: firstName,
          email,
          zip_code: zipCode
        }
      };
      
      await axios.post(`${backendUrl}/api/bbq-plans`, payload);
      
      toast.success('🎉 BBQ Plan saved! We\'ll be in touch soon.');
      
      // Reset form
      setPrompt('');
      setSelectedCategories([]);
      setSelectedCuts({});
      setBeefQuality('standard');
      setAddons('');
      setFirstName('');
      setEmail('');
      setZipCode('');
      setShowLeadForm(false);
      setParsedData(null);
      
    } catch (error) {
      console.error('Failed to save BBQ plan:', error);
      toast.error('Failed to save plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const estimate = calculateEstimate();

  return (
    <section id="bbq-planner" className="relative py-24 md:py-32 px-6 md:px-12" style={{ 
      background: 'linear-gradient(to bottom, #0a0a0a, #1a1a1a)',
      borderTop: '1px solid rgba(200, 169, 106, 0.15)',
      borderBottom: '1px solid rgba(200, 169, 106, 0.15)'
    }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#C8A96A] mb-6">
            <Flame size={12} />
            AI BBQ Planner
          </div>
          <h2 className="font-serif font-light text-4xl md:text-5xl lg:text-6xl text-[#F5F1E8] leading-tight mb-6">
            Tell us about your event.
            <span className="block italic text-[#C8A96A]">Then pick every cut.</span>
          </h2>
          <p className="text-[#A89F8F] leading-relaxed max-w-2xl">
            Our AI reads your party in plain English. You pick the proteins, the exact cuts, 
            the beef quality tier, and any add-ons — we portion it per person and price it instantly.
          </p>
        </div>

        <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(200, 169, 106, 0.3), transparent)', margin: '3rem 0' }}></div>

        {/* Prompt Input */}
        <div className="bg-[#1a1a1a] border border-[#C8A96A]/25 p-6 md:p-8 rounded-sm mb-8">
          <div className="grid md:grid-cols-[auto_1fr] gap-4 items-stretch">
            <div className="hidden md:grid place-items-center w-14 border border-[#C8A96A]/25 text-[#C8A96A]">
              <Sparkles size={20} />
            </div>
            <input
              placeholder="e.g. 20 people luxury tomahawk dinner"
              className="w-full bg-[#0a0a0a] border border-[#C8A96A]/25 text-[#F5F1E8] px-5 py-4 text-base md:text-lg focus:outline-none focus:border-[#C8A96A] transition-colors"
              type="text"
              value={prompt}
              onChange={(e) => handlePromptChange(e.target.value)}
            />
          </div>

          {/* Example Chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-[0.65rem] uppercase tracking-[0.28em] text-[#A89F8F] mr-1">Try</span>
            {EXAMPLE_PROMPTS.map((example, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptChange(example)}
                className="text-xs text-[#A89F8F] hover:text-[#F5F1E8] border border-[#C8A96A]/20 hover:border-[#C8A96A] px-3 py-1.5 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>

          {/* Parsed Data Tags */}
          {parsedData && (
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-[#A89F8F]">
              <div className="inline-flex items-center gap-2 border border-[#C8A96A]/25 px-3 py-1.5">
                <span className="text-[0.6rem] uppercase tracking-[0.28em] text-[#A89F8F]">Guests</span>
                <span className="text-[#F5F1E8]">{parsedData.people}</span>
              </div>
              <div className="inline-flex items-center gap-2 border border-[#C8A96A]/25 px-3 py-1.5">
                <span className="text-[0.6rem] uppercase tracking-[0.28em] text-[#A89F8F]">Event</span>
                <span className="text-[#C8A96A] font-medium">{parsedData.eventType}</span>
              </div>
              <div className="inline-flex items-center gap-2 border border-[#C8A96A]/25 px-3 py-1.5">
                <span className="text-[0.6rem] uppercase tracking-[0.28em] text-[#A89F8F]">Portion</span>
                <span className="text-[#F5F1E8]">{parsedData.portionPerPerson.toFixed(2)} lbs / person</span>
              </div>
            </div>
          )}
        </div>

        {/* Step 1: Choose Proteins */}
        <div className="mt-12">
          <div className="flex items-center gap-4 mb-8">
            <span className="font-serif text-[#C8A96A] text-3xl">01.</span>
            <h3 className="font-serif text-2xl md:text-3xl text-[#F5F1E8]">Choose your proteins</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`border p-5 transition-colors text-left ${
                    isSelected 
                      ? 'border-[#C8A96A] bg-[#2a2a2a]' 
                      : 'border-[#C8A96A]/20 hover:border-[#C8A96A]/60 bg-[#1a1a1a]'
                  }`}
                >
                  <div className="text-3xl mb-2 leading-none">{cat.icon}</div>
                  <div className="font-serif text-xl text-[#F5F1E8]">{cat.label}</div>
                  <div className={`text-[0.65rem] uppercase tracking-[0.24em] mt-1 ${
                    isSelected ? 'text-[#C8A96A]' : 'text-[#A89F8F]'
                  }`}>
                    {isSelected ? 'Selected' : 'Tap to add'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select Individual Cuts */}
        {selectedCategories.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-4 mb-8">
              <span className="font-serif text-[#C8A96A] text-3xl">02.</span>
              <h3 className="font-serif text-2xl md:text-3xl text-[#F5F1E8]">Select your cuts</h3>
            </div>
            
            {selectedCategories.map(catId => {
              const category = CATEGORIES.find(c => c.id === catId);
              const cuts = CUTS_BY_CATEGORY[catId];
              const selectedInCategory = selectedCuts[catId] || [];
              
              return (
                <div key={catId} className="mb-8">
                  <h4 className="font-serif text-xl text-[#C8A96A] mb-4 flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {cuts.map(cut => {
                      const isSelected = selectedInCategory.includes(cut.id);
                      return (
                        <button
                          key={cut.id}
                          onClick={() => toggleCut(catId, cut.id)}
                          className={`border px-4 py-3 text-left transition-colors ${
                            isSelected
                              ? 'border-[#C8A96A] bg-[#2a2a2a]'
                              : 'border-[#C8A96A]/20 hover:border-[#C8A96A]/60 bg-[#1a1a1a]'
                          }`}
                        >
                          <div className="font-serif text-lg text-[#F5F1E8] mb-1">{cut.label}</div>
                          <div className="text-xs text-[#C8A96A] uppercase tracking-[0.22em]">
                            ${cut.price}/lb {isSelected && '✓'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Beef Quality Tier (only if steak is selected) */}
            {selectedCategories.includes('steak') && (
              <div className="mt-8 bg-[#1a1a1a] border border-[#C8A96A]/25 p-6">
                <h4 className="font-serif text-xl text-[#F5F1E8] mb-4">
                  Beef Quality Tier <span className="text-sm text-[#A89F8F]">(applies to all steak cuts)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {BEEF_UPGRADES.map(upgrade => (
                    <button
                      key={upgrade.id}
                      onClick={() => setBeefQuality(upgrade.id)}
                      className={`border px-4 py-3 text-left transition-colors ${
                        beefQuality === upgrade.id
                          ? 'border-[#C8A96A] bg-[#2a2a2a]'
                          : 'border-[#C8A96A]/20 hover:border-[#C8A96A]/60 bg-[#0a0a0a]'
                      }`}
                    >
                      <div className="font-serif text-lg text-[#F5F1E8]">{upgrade.label}</div>
                      <div className="text-xs text-[#C8A96A] uppercase tracking-[0.22em]">{upgrade.tag}</div>
                    </button>
                  ))}
                </div>
                <div className="text-xs text-[#A89F8F]/70 mt-3">
                  Tier modifier applies to all selected steak cuts.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Add-ons */}
        <div className="mt-12">
          <div className="flex items-center gap-4 mb-8">
            <span className="font-serif text-[#C8A96A] text-3xl">03.</span>
            <h3 className="font-serif text-2xl md:text-3xl text-[#F5F1E8]">Add-ons (optional)</h3>
          </div>
          <textarea
            rows="3"
            placeholder="Rubs, butcher paper, charcoal, marinades, bones for stock, sides… anything you'd like."
            className="w-full bg-[#1a1a1a] border border-[#C8A96A]/25 text-[#F5F1E8] px-4 py-3 focus:outline-none focus:border-[#C8A96A] transition-colors resize-none"
            value={addons}
            onChange={(e) => setAddons(e.target.value)}
          />
        </div>

        {/* Generate Button & Summary */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <button
            onClick={handleGenerate}
            disabled={!prompt || selectedCategories.length === 0 || calculateTotalCuts() === 0}
            className="px-8 py-4 text-base font-semibold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #8B0000, #C8A96A)',
              color: '#F5F1E8',
              border: 'none'
            }}
          >
            Generate BBQ Plan
          </button>
          <span className="text-xs text-[#A89F8F]">
            {calculateTotalCuts()} cut(s) chosen · {selectedCategories.length} protein(s)
            {parsedData && estimate.totalLbs > 0 && (
              <> · ~{estimate.totalLbs} lbs · ~${estimate.totalPrice}</>
            )}
          </span>
        </div>

        {/* Lead Capture Form */}
        {showLeadForm && (
          <div className="mt-12 bg-[#1a1a1a] border border-[#C8A96A] p-8">
            <h3 className="font-serif text-2xl text-[#C8A96A] mb-6">Get Your Custom BBQ Plan</h3>
            <form onSubmit={handleSubmitLead} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.24em] text-[#A89F8F] mb-2">First Name *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#C8A96A]/25 text-[#F5F1E8] px-4 py-3 focus:outline-none focus:border-[#C8A96A]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.24em] text-[#A89F8F] mb-2">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#C8A96A]/25 text-[#F5F1E8] px-4 py-3 focus:outline-none focus:border-[#C8A96A]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.24em] text-[#A89F8F] mb-2">Zip Code *</label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#C8A96A]/25 text-[#F5F1E8] px-4 py-3 focus:outline-none focus:border-[#C8A96A]"
                  required
                  maxLength={10}
                />
              </div>
              <button
                type="submit"
                disabled={generating}
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #C8A96A, #8B0000)',
                  color: '#0a0a0a',
                  border: 'none'
                }}
              >
                {generating ? 'Saving...' : 'Get My BBQ Plan →'}
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

export default AIBBQPlanner;
