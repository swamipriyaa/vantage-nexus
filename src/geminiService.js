/**
 * Vantage Registry Database Service
 * Connects client-side queries to the market index using gemini-2.5-flash
 */

export async function analyzeStartupWithGemini({ concept, name, websiteUrl, industry, apiKey }) {
  if (!apiKey) {
    throw new Error("An active Data Feed License Key is required to run live database searches.");
  }

  const cleanName = name || "Strategic Product";
  const cleanIndustry = industry || "Target Sector";
  const cleanUrl = websiteUrl || "Not specified";

  const systemInstructions = `
You are a Senior Venture Research Director and Enterprise Market Data Analyst.
Analyze the target business model/concept:
- Name Reference: "${cleanName}"
- Concept Description: "${concept}"
- Target Sector: "${cleanIndustry}"
- URL Reference: "${cleanUrl}"

Perform a thorough competitor mapping and B2B pipeline discovery.
Generate exact coordinates for pricing models, feature comparison matrices, and direct qualified target accounts.

CRITICAL RULE: 
Do NOT output any emoji characters (like ⚡, 🌐, 📈, 🔧, 💡, 👥, 📍, 🏢) anywhere in your text. Keep the copywriting highly professional, data-centric, technical, and direct—like an institutional brief from CB Insights or PitchBook.

You MUST respond ONLY with a valid, clean JSON object matching the JSON schema below. 
Do NOT include markdown syntax (like \`\`\`json) or extra text outside the JSON block.

REQUIRED SCHEMA FORMAT:
{
  "id": "custom-analysis",
  "name": "A refined professional brand name for the proposed company/product",
  "concept": "A polished, investor-ready executive summary of the concept (concise, analytical tone)",
  "industry": "The precise specific industry sector",
  "ourProductPricing": { "basic": 0, "pro": 19, "enterprise": 99 },
  "featuresList": [
    "Exactly 6 highly relevant, technical product specifications or operational requirements (e.g. 'End-to-End Encryption', 'Adaptive Rate-Limiting')"
  ],
  "ourProductFeatures": {
    "Every key from 'featuresList' mapped as key with value 'true'"
  },
  "marketLandscape": {
    "size": "Estimated market size in dollars (e.g. $45 Billion) with a professional notation",
    "growthRate": "Market compound annual growth rate (e.g. 15.2% CAGR)",
    "segments": [
      "Exactly 4 key client demographics or market divisions (do NOT use emojis)"
    ]
  },
  "competitors": [
    {
      "name": "Competitor Company Name (Identify exactly 5 real or highly plausible competitors in their specific space)",
      "url": "https://competitorwebsite.com",
      "pricing": {
        "basic": 15,
        "pro": 39,
        "enterprise": 199
      },
      "features": {
        "Every single feature from featuresList must be mapped here as a key with a boolean (true or false) indicating if this competitor offers it."
      },
      "positioning": {
        "innovation": 7, 
        "affordability": 6
      },
      "strengths": [
        "Identified strength 1 (concise, professional wording, no emojis)",
        "Identified strength 2",
        "Identified strength 3"
      ],
      "weaknesses": [
        "Identified weakness 1 (concise, professional wording, no emojis)",
        "Identified weakness 2",
        "Identified weakness 3"
      ],
      "audience": "Core target demographic they focus on",
      "valueProp": "Primary pitch/value proposition of this competitor"
    }
  ],
  "recommendations": [
    {
      "type": "priority",
      "title": "High-priority product execution",
      "reason": "Specific strategic rationale explaining why this yields a competitive advantage."
    },
    {
      "type": "improvement",
      "title": "Specific system optimization",
      "reason": "Strategic reasoning tied to core developer/user friction points."
    },
    {
      "type": "market-gap",
      "title": "Uncontested market segment or positioning space to capture",
      "reason": "Analytical reasoning based on competitor vulnerabilities."
    }
  ],
  "leads": [
    {
      "company": "Qualified Target Company Name (a highly relevant B2B buyer, enterprise, or agency that needs this product)",
      "website": "https://companyurl.com",
      "industry": "Lead company industry classification",
      "size": "Employee size range (e.g., 50-100)",
      "location": "HQ Location (City, State/Country)",
      "contact": "Full Name of a highly plausible relevant decision maker (e.g. VP Engineering, CPO, Founder)",
      "title": "Specific job title",
      "linkedin": "https://linkedin.com/in/leads-custom-profile",
      "email": "professional-email@companyurl.com",
      "confidence": 95,
      "relevance": "A detailed, custom reason explaining why this specific company and contact person needs the product, how it solves their pain points, and how to pitch them (no emojis)."
    }
  ]
}

CRITICAL RULES:
1. 'competitors' array MUST have exactly 5 real or highly plausible competitors.
2. 'leads' array MUST have exactly 5 highly customized B2B target leads.
3. Every single competitor feature dictionary MUST match the exact 6 keys defined in 'featuresList'.
4. 'positioning.innovation' and 'positioning.affordability' must be numbers between 1 and 10. (10 is extremely high/premium innovation or extremely high affordability/cheap; 1 is low innovation or very expensive).
5. Output must be raw JSON, strictly matching this schema. No trailing commas, no invalid chars. Do NOT write emoji characters anywhere in the response.
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: systemInstructions
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || `HTTP error! Status: ${response.status}`;
      throw new Error(errorMsg);
    }

    const result = await response.json();
    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error("Empty response returned from the data feed index. Please try again.");
    }

    const parsedData = JSON.parse(responseText.trim());
    return parsedData;
  } catch (error) {
    console.error("Vantage query execution failed:", error);
    throw error;
  }
}
