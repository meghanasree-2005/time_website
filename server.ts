import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize express
const app = express();
const PORT = 3000;

// Increase request size limit for image uploads (base64)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Lazy initializer for Gemini API to prevent app crash if key is missing on start
let _ai: any = null;
function getGeminiClient() {
  if (!_ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.includes("MY_GEMINI_API_KEY")) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is missing or placeholder. Smart recommendations will run in premium simulation mode.");
      return null;
    }
    _ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return _ai;
}

// Global state in-memory database
const orders: any[] = [];
const contactInquiries: any[] = [];
const registeredUsers: any[] = [];

// API: Login Endpoint with Password Validation
app.post("/api/login", (req, res) => {
  const { emailOrPhone, password, isRegistering } = req.body;

  if (!emailOrPhone) {
    return res.status(400).json({ error: "Email or Phone Number is required" });
  }

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  // Mandatory password validation check
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasMinLength || !hasUppercase || !hasNumber) {
    return res.status(400).json({
      error: "Password must be at least 6 characters, contain an uppercase letter, and at least one number."
    });
  }

  const normalizedId = emailOrPhone.trim().toLowerCase();

  if (isRegistering) {
    const exists = registeredUsers.some(u => u.emailOrPhone === normalizedId);
    if (exists) {
      return res.status(400).json({ error: "User already exists" });
    }
    registeredUsers.push({ emailOrPhone: normalizedId, password });
  } else {
    // Logging in
    const existingUser = registeredUsers.find(u => u.emailOrPhone === normalizedId);
    if (existingUser) {
      if (existingUser.password !== password) {
        return res.status(400).json({ error: "Incorrect password for this registered user." });
      }
    } else {
      // If user doesn't exist yet, auto-register for seamless experience
      registeredUsers.push({ emailOrPhone: normalizedId, password });
    }
  }

  // Success login simulation
  let cleanName = emailOrPhone.split("@")[0] || "Luxury Connoisseur";
  // Remove numbers if phone context
  cleanName = cleanName.replace(/[0-9]/g, "").trim() || "Collector";
  cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

  return res.json({
    success: true,
    user: {
      emailOrPhone,
      name: cleanName,
      isAuthenticated: true
    }
  });
});

// API: Handle Order Placement with computed services and warranty
app.post("/api/order", (req, res) => {
  const { items, subtotal, shippingCost, fastShippingCharge, address, total, paymentMethod, paymentDetails } = req.body;

  if (!items || items.length === 0 || !address) {
    return res.status(400).json({ error: "Invalid order details" });
  }

  const warrantyCode = "WTY" + Math.floor(100000 + Math.random() * 900000);
  const newOrder = {
    id: "ORD" + Math.floor(100000 + Math.random() * 900000),
    items,
    subtotal,
    shippingCost,
    fastShippingCharge,
    address,
    total,
    warrantyCode,
    paymentMethod,
    paymentDetails,
    status: "Confirmed" as const,
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    createdAt: Date.now()
  };

  orders.push(newOrder);
  res.json({ success: true, order: newOrder });
});

// API: Handle Sync/Status Tracking update of placed orders over time
app.post("/api/orders/sync", (req, res) => {
  const { orderList } = req.body;

  if (!orderList || !Array.isArray(orderList)) {
    return res.status(400).json({ error: "Invalid or missing order list" });
  }

  const updated = orderList.map((order: any) => {
    // If the order doesn't have a createdAt timestamp, initialize it with a default (e.g., 60 seconds ago)
    const createdAt = order.createdAt || (Date.now() - 60000);
    const elapsedSeconds = (Date.now() - createdAt) / 1000;

    let updatedStatus: "Confirmed" | "In Calibration" | "Quality Assurance" | "Dispatched" = "Confirmed";

    if (elapsedSeconds < 12) {
      updatedStatus = "Confirmed";
    } else if (elapsedSeconds < 24) {
      updatedStatus = "In Calibration";
    } else if (elapsedSeconds < 36) {
      updatedStatus = "Quality Assurance";
    } else {
      updatedStatus = "Dispatched";
    }

    // Keep server memory record updated too if cached there
    const foundIdx = orders.findIndex(o => o.id === order.id);
    if (foundIdx !== -1) {
      orders[foundIdx].status = updatedStatus;
    }

    return {
      ...order,
      status: updatedStatus,
      createdAt
    };
  });

  res.json({ success: true, orders: updated });
});

// API: Handle Contact Form
app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const inquiry = {
    id: "INQ" + Math.floor(100000 + Math.random() * 900000),
    name,
    email,
    message,
    date: new Date().toISOString()
  };

  contactInquiries.push(inquiry);
  res.json({ success: true, message: "Thank you! Our horology experts will contact you within 2 hours." });
});

// API: Chatbot assistant
app.post("/api/chatbot", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const aiClient = getGeminiClient();

  const chatbotSystemPrompt = `You are "Aurelius", the master horologist and digital concierge at "TIME" luxury boutique.
Your duty is to assist users in selecting, designing, and customizing their dream watch.
Be sophisticated, polite, and exceptionally knowledgeable about mechanical calibration, automatic movements, dials, case selections, and luxury aesthetics.

Our premium catalogue includes:
1. Onyx Tourbillon ($1999) - Skeleton mechanical tourbillon art piece, Obsidian PVD cover. Specs: Symphony Caliber 18 Tourbillon, double-domed sapphire crystal.
2. Champagne Monarch ($680) - Elegant gold-plated mesh dress timepiece. Specs: Swiss Ronda Quartz, Sapphire crystal.
3. Ascent Chronograph ($440) - Rugged sporty titanium active timepiece. Specs: Automatic column-wheel chrono caliber 400, hardlex glass, 100m waterproof.
4. Ivory Minimalist ($299) - Sleek unblemished black-and-white minimalist office timepiece. Specs: Citizen Miyota Quartz, mineral glass, brown calfskin leather.
5. Aero Stealth Carbon ($1050) - Tactical high-end carbon military watch. Specs: Miyota automatic winding, sapphire crystal, cordura strap.
6. Vanguard Heritage ($950) - Swiss retro elegance highlighting an open-heart skeleton balance wheel at 9 o'clock. Specs: Seiko NH38 Automatic, curved mineral glass.

We offer bespoke customization materials:
- Cases: Champagne Gold, Obsidian Black, Metallic Gold, Chrome Silver
- Dials: Obsidian Black, Sunburst Royal Blue, Emerald Sunburst, Champagne Satin, Ivory White
- Strap: Alligator Leather (Chestnut/Black), Milanese Loop Gold Mesh, Silver Link Oyster Steel, Matte Sport Rubber
- Calibrations: 3 to 5 years brand guarantee.
- Optional prioritization delivery surcharges apply based on locational zones (Metropolitan Hub, Suburban Regional, Remote districts).

We have just introduced a new season color palette option:
- **Sapphire**: A deep, gemstone-grade navy blue, perfect for premium ocean dials.
- **Royal Blue**: A classic star-burst blue, highly vibrant and reflective under light.
- **Quick Sand**: A beautiful desert champagne gold/beige tone for mesh and bands.
- **Swan Wing**: A pristine, luxurious feather-colored white face.
- **Shell Stone**: A solid sandstone-grey limestone accent for base custom plates.

If the user expresses interest in ordering or customizing, guide them to use our Catalog, customized modal builder, or AI smart recommend tab. Keep replies highly polite, professional, elegant, and reasonably concise.`;

  if (!aiClient) {
    // Elegant fallback simulator
    const q = message.toLowerCase();
    let reply = "I am Aurelius, your TIME digital concierge. How can I assist you with fine-tuning or calibrating your next lifetime companion today?";
    
    if (q.includes("hi") || q.includes("hello") || q.includes("hey")) {
      reply = "Welcome to TIME, connoisseur. I am Aurelius. Are you seeking a mechanical skeleton piece like the Onyx Tourbillon, or perhaps a bespoke minimalist look?";
    } else if (q.includes("price") || q.includes("cost") || q.includes("how much")) {
      reply = "Our hand-assembled catalog ranges from the sleek Ivory Minimalist ($299) to our masterwork Onyx Tourbillon ($1999). Each purchase includes our lifetime alignment insurance and delivery warranty.";
    } else if (q.includes("custom") || q.includes("design") || q.includes("change")) {
      reply = "You can customize any watch by tapping 'Customize Diamond Base' on their catalog card! This allows you to choose dial colors (such as Sunburst Royal Blue or Champagne Satin), custom cases, straps, and laser-engrave a custom timestamp on the back case.";
    } else if (q.includes("sapphire") || q.includes("royal blue") || q.includes("quick sand") || q.includes("swan wing") || q.includes("shell stone")) {
      reply = `Ah! You are exploring our exquisite new seasonal palette:
- **Sapphire**: A deep, royal gemstone coat that shines under physical light.
- **Royal Blue**: Our sunburst deep marine dial color that is highly prized by collectors.
- **Quick Sand**: A luxurious desert champagne sand-beige theme for straps and cases.
- **Swan Wing**: Soft, pristine feather-white dial face plating.
- **Shell Stone**: Our customized limestone beige-stone finish for classic backings.`;
    } else if (q.includes("shipping") || q.includes("delivery") || q.includes("delay")) {
      reply = "We shipping internationally with custom location zone surcharges (Metropolitan, Suburban, or Remote). Upgrade to Priority Express to receive your luxury shipment with priority transport!";
    } else if (q.includes("recommend") || q.includes("what is best") || q.includes("suggest")) {
      reply = "If you appreciate mechanical skeletonized artistry, I highly recommend our Onyx Tourbillon with a sapphire crystal. For sporting endurance, the Aero Stealth Carbon is supreme.";
    }
    
    return res.json({ response: reply });
  }

  try {
    const formattedHistory = Array.isArray(history) 
      ? history.map((h: any) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        }))
      : [];

    const chat = aiClient.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: chatbotSystemPrompt,
      },
      history: formattedHistory
    });

    const response = await chat.sendMessage({ message: message });
    return res.json({ response: response.text });
  } catch (error: any) {
    console.error("Gemini API error during chatbot:", error);
    return res.json({ 
      error: true, 
      response: "Aurelius is currently fine-tuning a mainspring and cannot assist directly, but says: 'Your appreciation for high-end horology keeps us calibrated. Please let me know how I can serve you!'" 
    });
  }
});

// API: Suggest suitable watch based on photo, voice or text
app.post("/api/recommend", async (req, res) => {
  const { textQuery, speechQuery, imageBase64, imageMime } = req.body;

  const aiClient = getGeminiClient();

  // Primary prompt builder
  const watchCatalogDescription = `
    The store is called "TIME". We offer these premium base watches:
    1. "time-01" (Onyx Tourbillon): Skeleton marvel, real tourbillon, premium black, $1999 (discounted from $2499). High-end, mechanical.
    2. "time-02" (Champagne Monarch): Classic gold mesh look, Swiss quartz, $680 (discounted from $850). Classy, elegant, vintage.
    3. "time-03" (Ascent Chronograph): Rugged sporty titanium, mechanical column-wheel, tachymeter, $440 (discounted from $550). Athletic, sporty.
    4. "time-04" (Ivory Minimalist): Clean minimal white face, calfskin leather, thin, $299 (discounted from $350). Simple, sleek, office.
    5. "time-05" (Aero Stealth Carbon): Forged carbon tactical luxury, Cordura military dial, $1050 (discounted from $1250). Rugged military chic, extreme luxury.
    6. "time-06" (Vanguard Heritage): Automatic open heart, brown suede, $950. Timeless vintage luxury.

    We offer these customizable options:
    - Case Colors: Champagne Gold, Obsidian Black, Metallic Gold, Chrome Silver
    - Dial Colors: Obsidian Black, Sunburst Royal Blue, Emerald Sunburst, Champagne Satin, Ivory White
    - Straps: Alligator Leather (Black or Chestnut), Milanese Loop Mesh (Gold), Solid Oyster Link Steel (Silver), Tactical Rubber Strap (Matte)
    - Glasses: Sapphire Crystal, Mineral Toughened Glass, Hardlex Tempered Classic
  `;

  const systemPrompt = `You are the master horologist and watch recommendation engine at "TIME" luxury watch boutique. 
  Your job is to analyze the user's query (which can be their description, voice transcription, or an uploaded photo/vibe check) and recommend exactly ONE base watch from our primary catalog that fits their description perfectly. Also suggest specific custom parts to match their requested aesthetic.
  
  Provide your output strictly in JSON format as specified:
  {
    "explanation": "Expert explanation of why this watch matches their personality, uploaded image, or voice request.",
    "watchId": "the watch id matching one of options from list: time-01, time-02, time-03, time-04, time-05, time-06",
    "suggestedCustom": {
      "caseColor": "Case color selection",
      "dialColor": "Dial color selection",
      "strapType": "Strap selection",
      "glassType": "Glass selection",
      "engraving": "A suggested custom back engraving text (e.g. 'Carpe Diem' or 'To Infinity')"
    }
  }`;

  if (!aiClient) {
    // Elegant simulated response matching requested queries if key is empty
    let matchedId = "time-04";
    let explanation = "Based on your unique style prompt, our master watchmakers recommend our minimalist aesthetic matching clean geometries and balanced dials.";

    const query = (textQuery || speechQuery || "").toLowerCase();
    if (query.includes("gold") || query.includes("rich") || query.includes("wedding") || query.includes("elegant")) {
      matchedId = "time-02";
      explanation = "To reflect your affinity for classic grandeur and gold elegance, the Champagne Monarch sits as our premier choice with its vintage mesh finish.";
    } else if (query.includes("sport") || query.includes("carbon") || query.includes("rugged") || query.includes("dive") || query.includes("tough")) {
      matchedId = "time-05";
      explanation = "The Aero Stealth Carbon embodies extreme tactical toughness. Forged from composite carbon fiber, it perfectly matches your active lifestyle.";
    } else if (query.includes("skeleton") || query.includes("tourbillon") || query.includes("premium") || query.includes("expensive") || query.includes("mechanical")) {
      matchedId = "time-01";
      explanation = "For true high-end mechanical appreciation, the Onyx Tourbillon represents state-of-the-art skeletonized artistry.";
    } else if (imageBase64) {
      matchedId = "time-01";
      explanation = "We analyzed your uploaded image check! The intricate lines and dark contrasting aesthetic match perfectly with our Onyx Tourbillon luxury series.";
    }

    const mockResult = {
      explanation,
      watchId: matchedId,
      suggestedCustom: {
        caseColor: matchedId === "time-02" ? "Champagne Gold" : "Obsidian Black",
        dialColor: matchedId === "time-01" ? "Obsidian Black" : "Champagne Satin",
        strapType: "Alligator Leather (Black)",
        glassType: "Sapphire Crystal",
        engraving: "TIME 2026"
      }
    };
    return res.json({ result: mockResult });
  }

  try {
    let contents: any[] = [];
    
    // Build user request parts
    let promptText = "Review the user query and recommend the perfect customized watch. User request: ";
    if (textQuery) {
      promptText += `\nUser search prompt: "${textQuery}"`;
    }
    if (speechQuery) {
      promptText += `\nUser voice transcription prompt: "${speechQuery}"`;
    }
    if (imageBase64) {
      promptText += `\nUser uploaded a visual file representing their desired style, watch model, or outfit look. Analyze this imagery and match it to our catalog.`;
      
      const imagePart = {
        inlineData: {
          mimeType: imageMime || "image/jpeg",
          data: imageBase64
        }
      };
      contents.push(imagePart);
    }
    
    promptText += `\n\nCatalog options reference:\n${watchCatalogDescription}`;
    contents.push({ text: promptText });

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: contents },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            watchId: { type: Type.STRING },
            suggestedCustom: {
              type: Type.OBJECT,
              properties: {
                caseColor: { type: Type.STRING },
                dialColor: { type: Type.STRING },
                strapType: { type: Type.STRING },
                glassType: { type: Type.STRING },
                engraving: { type: Type.STRING }
              },
              required: ["caseColor", "dialColor", "strapType", "glassType"]
            }
          },
          required: ["explanation", "watchId", "suggestedCustom"]
        }
      }
    });

    const textOutput = response.text || "{}";
    const resultJson = JSON.parse(textOutput.trim());
    return res.json({ result: resultJson });

  } catch (error: any) {
    console.error("Gemini API error during recommendation:", error);
    return res.json({ 
      error: true, 
      message: "Horologer is busy fine-tuning, falling back gracefully.",
      result: {
        explanation: "Our automatic sensor recommends the Vanguard Heritage automatic watch matching timeless retro mechanics.",
        watchId: "time-06",
        suggestedCustom: {
          caseColor: "Chrome Silver",
          dialColor: "Royal Blue",
          strapType: "Solid Oyster Link Steel (Silver)",
          glassType: "Sapphire Crystal",
          engraving: "Heritage 2026"
        }
      } 
    });
  }
});

// Serve assets and launch dev server with Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Dynamically require Vite inside Dev mode to handle client bundles
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TIME platform running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
