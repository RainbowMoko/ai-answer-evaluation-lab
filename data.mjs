/** Synthetic product/support material. These are examples, not a real business. */
export const cases = [
  {
    id: 'delivery',
    category: '01 / DELIVERY',
    title: 'Keep the delivery promise honest',
    shortTitle: 'Delivery expectations',
    question: 'I am ordering a Northstar desk lamp in the Netherlands. How soon will it be dispatched and delivered?',
    lesson: 'A plausible delivery promise is still unsupported when the evidence does not say it.',
    expectedBehavior: 'Answer with the stated dispatch and delivery windows. Do not invent guarantees or shipping prices.',
    documents: [{ id: 'SHIP-01', title: 'Delivery policy', text: 'Orders are dispatched within 1 business day. Delivery in the Netherlands takes 2–4 business days after dispatch. Delivery dates are estimates, not guarantees. This policy does not state a shipping price.' }],
    rules: [
      { id: 'dispatch', label: 'States dispatch within 1 business day', pattern: '\\b(?:dispatched|dispatch|ships?|sent)\\b[^.!?\\n]{0,45}\\b(?:within\\s+)?(?:1|one) business day\\b' },
      { id: 'delivery', label: 'States delivery in 2–4 business days after dispatch', pattern: '\\b2\\s*(?:-|to)\\s*4 business days?\\s+after (?:dispatch|shipping)\\b' }
    ],
    unsupportedRules: [
      { id: 'same-day', label: 'Promises same-day delivery', pattern: '\\b(?:we (?:offer|provide)|you (?:get|will get)|expect|includes?) same[ -]day delivery\\b' },
      { id: 'guarantee', label: 'Promises a guaranteed arrival', pattern: '\\b(?:delivery|arrival) is guaranteed\\b|\\bwe guarantee (?:delivery|arrival)\\b|\\bguaranteed (?:delivery|arrival)\\b' },
      { id: 'free-shipping', label: 'Invents free shipping', pattern: '\\b(?:shipping is free|free shipping is included|you get free shipping)\\b' }
    ],
    fixtures: {
      grounded: 'Your order is dispatched within 1 business day. Delivery in the Netherlands takes 2–4 business days after dispatch. These are estimates rather than guaranteed dates. The policy does not list a shipping price. [SHIP-01]',
      risky: 'Your order is dispatched within 1 business day. You get same-day delivery and shipping is free. Arrival is guaranteed. [SHIP-01]'
    }
  },
  {
    id: 'warranty',
    category: '02 / POLICY',
    title: 'Apply the policy, including its limits',
    shortTitle: 'Warranty boundaries',
    question: 'My Northstar lamp broke after I dropped it. Does the standard warranty cover that?',
    lesson: 'Correct facts about a warranty are not enough if the answer invents coverage.',
    expectedBehavior: 'Explain the 2-year warranty and the exclusion for accidental damage. Do not promise a refund.',
    documents: [{ id: 'WARRANTY-02', title: 'Limited warranty', text: 'The Northstar desk lamp has a 2-year warranty for manufacturing defects. Accidental damage, including damage caused by dropping the lamp, is not covered. Support can discuss repair options. No refund entitlement for accidental damage is stated.' }],
    rules: [
      { id: 'duration', label: 'States the 2-year warranty for manufacturing defects', pattern: '\\b(?:2|two)[ -]year warranty (?:for|covers) manufacturing defects\\b' },
      { id: 'exclusion', label: 'Says accidental damage is not covered', pattern: '\\baccidental damage(?:, including damage (?:caused )?by dropping the lamp,)? is not covered\\b|\\b(?:does not|doesn\'t) cover accidental damage\\b' }
    ],
    unsupportedRules: [
      { id: 'all-damage', label: 'Invents coverage for all damage', pattern: '\\b(?:covers? all (?:types of )?damage|all damage is covered)\\b' },
      { id: 'refund', label: 'Promises a full refund', pattern: '\\b(?:you (?:will|can) (?:get|receive)|we (?:will )?(?:give|offer)) (?:you )?a full refund\\b' },
      { id: 'lifetime', label: 'Invents a lifetime warranty', pattern: '\\b(?:has|includes|comes with|offers) (?:a )?lifetime warranty\\b' }
    ],
    fixtures: {
      grounded: 'The lamp has a 2-year warranty for manufacturing defects. It does not cover accidental damage, so damage from dropping it falls outside that warranty. You can contact support to discuss repair options. [WARRANTY-02]',
      risky: 'The lamp has a 2-year warranty for manufacturing defects, and it covers all damage. You will receive a full refund. [WARRANTY-02]'
    }
  },
  {
    id: 'missing-info',
    category: '03 / ABSTENTION',
    title: 'Recognise when the evidence runs out',
    shortTitle: 'Missing specifications',
    question: 'Can I plug the Northstar lamp into a 110 V outlet when I travel?',
    lesson: 'An honest answer can identify missing information and give a useful next step.',
    expectedBehavior: 'Say the supplied source does not establish voltage compatibility and direct the customer to support.',
    documents: [{ id: 'DEVICE-03', title: 'Product summary', text: 'The Northstar desk lamp has three brightness levels, a USB-C cable, and an adjustable arm. A power adapter is not included. This summary does not specify electrical input requirements or compatible mains voltages.' }],
    rules: [
      { id: 'uncertainty', label: 'Acknowledges that voltage compatibility cannot be confirmed', pattern: '\\b(?:cannot|can\'t) confirm (?:the )?(?:voltage compatibility|compatibility with 110 v(?: outlets?)?)\\b|\\b(?:source|summary|information) does not (?:specify|establish|confirm) (?:the )?(?:voltage compatibility|compatible (?:mains )?voltages|electrical input requirements)\\b' },
      { id: 'next-step', label: 'Directs the customer to support for confirmation', pattern: '\\b(?:contact|ask|check with) (?:customer )?support\\b' }
    ],
    unsupportedRules: [
      { id: 'voltage-claim', label: 'Asserts compatibility without specifications', pattern: '\\b(?:works? with|compatible with|supports?|safe (?:to use )?(?:with|on)|you can use it (?:with|on)) (?:a )?110\\s*v(?:olts?)?(?:\\b|\\s*outlet)' },
      { id: 'universal', label: 'Invents universal voltage support', pattern: '\\b(?:supports?|has|includes) universal voltage\\b|\\b(?:works? (?:in|with)|compatible with) (?:every|all) (?:countries|outlets|voltages)\\b' }
    ],
    fixtures: {
      grounded: 'I cannot confirm compatibility with 110 V outlets from this product summary. It lists a USB-C cable and says a power adapter is not included, but the source does not specify electrical input requirements. Please contact support for confirmation before using a travel adapter. [DEVICE-03]',
      risky: 'Yes, it is compatible with 110 V and supports universal voltage, so it works in all countries. [DEVICE-03]'
    }
  }
];

export const getCase = id => cases.find(item => item.id === id);
