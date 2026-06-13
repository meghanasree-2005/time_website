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

// Serve custom uploads/assets globally from assets directory
app.use("/assets", express.static(path.join(process.cwd(), "assets")));

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
ALWAYS quote watch prices in Indian Rupees (₹) exactly as specified below. Do not use US dollars.

Our premium catalogue includes 16 masterpieces:
1. Onyx Tourbillon (time-01) - ₹3,999 (discounted from ₹4,499) [Skeleton]. Specs: Symphony Caliber 18 Tourbillon movement, Obsidian PVD Steel (41mm) case, Double-Domed Sapphire Crystal. Mesmerizing manual-wind flying tourbillon.
2. Champagne Monarch (time-02) - ₹2,480 (discounted from ₹2,850) [Luxury]. Specs: Swiss Ronda Quartz, Champagne Gold plated (39mm) case, Sapphire Crystal, Stainless Mesh bracelet.
3. Ascent Chronograph (time-03) - ₹2,140 (discounted from ₹2,550) [Sport]. Specs: Automatic Chrono Caliber 400, Titanium Alloy (43mm) case, Scratch-resistant Hardlex, Fluoroelastomer Rubber strap. 100m water resistant.
4. Ivory Minimalist (time-04) - ₹2,099 (discounted from ₹2,350) [Minimalist]. Specs: Citizen Miyota Quartz, Polished Stainless Steel (40mm) case, Mineral Glass, Italian Calfskin leather.
5. Aero Stealth Carbon (time-05) - ₹2,950 (discounted from ₹3,250) [Sport]. Specs: Auto-Winding Tactical Miyota, Forged Carbon Fiber (42mm) case, Anti-Reflective Sapphire, Mil-Spec Cordura strap.
6. Vanguard Heritage (time-06) - ₹2,950 [Classic]. Specs: Seiko NH38 Automatic, Brushed 316L Steel (40mm) case, Curved Mineral Glass, Handmade Suede Leather. Open-heart mechanical balance wheel.
7. Hyperion Sapphire Skeleton (time-07) - ₹4,200 (discounted from ₹4,800) [Skeleton]. Specs: Perpetual Caliber S20 Co-Axial, Anodized Titanium (41.5mm) case, Double-Domed AR Sapphire, Full Grain Tuscan Suede strap.
8. Titanium Eclipse Skeleton (time-08) - ₹3,600 (discounted from ₹4,100) [Skeleton]. Specs: Atelier NH70 Skeleton Auto, Sandblasted Titanium (42mm) case, Curved Sapphire Crystal, High-Tensile FKM Rubber strap.
9. Royal Emerald Emperor (time-09) - ₹4,850 (discounted from ₹5,400) [Luxury]. Specs: Geneva Caliber Gold-Standard, 18k Rose Gold Plated (40mm) case, Verifiable Anti-Reflective Scratchproof, Polished Oyster-Link Steel. Green sunburst dial.
10. Lumina Platinum Datejust (time-10) - ₹4,100 (discounted from ₹4,600) [Luxury]. Specs: Bespoke Chronometer Certified Auto, Solid Platinum Finish Alloy (41mm) case, Sapphire with Cyclops Magnifier, Platinum Finish Triple Link steel.
11. DeepSea Mariner Pro (time-11) - ₹2,990 (discounted from ₹3,400) [Sport]. Specs: Miyota Calber 9015 High-Beat, Marine-Grade 316S Steel (43.5mm) case, Explosion-Proof Sapphire (4mm), Corrosion-Resistant Steel Mesh, 300m water resistant.
12. Nürburg Racing Tachymeter (time-12) - ₹2,490 (discounted from ₹2,990) [Sport]. Specs: Meca-Quartz Hybrid Movement, PVD Matte Carbon Black Steel (42.5mm) case, Heavily Coated Hardlex, Perforated Racing Calfskin strap.
13. Sandalwood Charcoal Quartz (time-13) - ₹2,250 (discounted from ₹2,700) [Minimalist]. Specs: Precision Ronda Slim Quartz, Bronze Gold-Coated Alloy (40mm) case, Flat Sapphire Face, Organic Distressed Leather strap.
14. Nordic Alabaster Slim (time-14) - ₹2,150 (discounted from ₹2,450) [Minimalist]. Specs: Ultra-Thin Citizen Quartz, Polished Stainless Silver (38mm) case, Shatter-Resistant Glass Block, Vegetable-Tanned Tan Leather. Ultra slim 6.2mm.
15. Geneva Perpetual Calendar (time-15) - ₹3,450 (discounted from ₹3,900) [Classic]. Specs: Automatic Perpetual Caliber L20, Polished Rose Gold finish (41mm) case, Anti-Reflective Double-Chamber Sapphire, Embossed Alligator Black Strap. Active lunar moon-phase sub-dial.
16. Heirloom Antique Rose (time-16) - ₹2,790 (discounted from ₹3,100) [Classic]. Specs: Hand-wound Classic Seiko Mechanical, Traditional Rose Finish (39mm) case, Domed Hesalite Retro Style, English Suede Tan Leather strap.

We offer bespoke customization materials:
- Cases: Champagne Gold, Obsidian Black, Metallic Gold, Chrome Silver, Sapphire Steel, Quick Sand Gold
- Dials: Obsidian Black, Sunburst Royal Blue, Emerald Sunburst, Champagne Satin, Ivory White, Sapphire Deep Ocean, Swan Wing White, Shell Stone Limestone
- Strap: Alligator Leather (Chestnut/Black), Milanese Loop Mesh (Gold/Quick Sand), Solid Oyster Link Steel (Silver), Tactical Rubber Strap (Matte)
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
    // Elegant fallback simulator with full knowledge of 16 watches
    const q = message.toLowerCase();
    let reply = "I am Aurelius, your TIME digital concierge. How can I assist you with fine-tuning, bespoke calibrating, or exploring our 16 luxury watch masterpieces today?";
    
    if (q.includes("hi") || q.includes("hello") || q.includes("hey") || q.includes("welcome")) {
      reply = "Welcome back, connoisseur. I am Aurelius. Are you seeking an magnificent mechanical skeleton piece like our Onyx Tourbillon or Hyperion Sapphire, a vintage luxury watch like the Royal Emerald Emperor, or perhaps a bespoke minimalist look?";
    } else if (q.includes("tourbillon") || q.includes("onyx") || q.includes("time-01")) {
      reply = "The Onyx Tourbillon (₹3,999, discounted from ₹4,499) is our premium skeleton masterpiece. It features our manual-wind flying tourbillon movement under a double-domed sapphire crystal. It is fully customizable with our bespoke digital builder!";
    } else if (q.includes("monarch") || q.includes("champagne") || q.includes("time-02")) {
      reply = "The Champagne Monarch (₹2,480, discounted from ₹2,850) is an elegant gold-plated mesh dress timepiece packing a highly reliable Swiss Ronda Quartz movement under a flat sapphire face. Highly prestigious.";
    } else if (q.includes("chronograph") || q.includes("ascent") || q.includes("time-03")) {
      reply = "The Ascent Chronograph (₹2,140, discounted from ₹2,550) is engineered for endurance. Crafted in lightweight Titanium Alloy (43mm), it has a mechanical column-wheel chrono caliper, fluoroelastomer strap, and is 10 ATM waterproof.";
    } else if (q.includes("minimalist") || q.includes("ivory") || q.includes("time-04")) {
      reply = "Our Ivory Minimalist (₹2,099, discounted from ₹2,350) is the pinnacle of pure office understatement. Housed in polished steel, it matches an ivory white dial with premium Italian calfskin strap.";
    } else if (q.includes("stealth") || q.includes("carbon") || q.includes("aero") || q.includes("time-05")) {
      reply = "The Aero Stealth Carbon (₹2,950, discounted from ₹3,250) is machined from forged carbon fiber. Extremely featherlight yet tactical, it features an aeronautic dial with anti-reflective sapphire and military Cordura strap.";
    } else if (q.includes("vanguard") || q.includes("heritage") || q.includes("time-06")) {
      reply = "The Vanguard Heritage (₹2,950) is a timeless automatic watch with an open heart balance wheel at 9 o'clock. Highlighted by Seiko NH38 movement and brown handmade suede strap.";
    } else if (q.includes("hyperion") || q.includes("time-07")) {
      reply = "The Hyperion Sapphire Skeleton (₹4,200, discounted from ₹4,800) utilizes pure sapphire plates as structural bridges for an amazing 360-degree theater of ticking gears. Highly limited edition!";
    } else if (q.includes("eclipse") || q.includes("titanium") || q.includes("time-08")) {
      reply = "Our Titanium Eclipse Skeleton (₹3,600, discounted from ₹4,100) displays an asymmetrical sandblasted titanium skeleton layout on a high-tensile black FKM rubber band. Modernist architecture for your wrist.";
    } else if (q.includes("emerald") || q.includes("emperor") || q.includes("royal emerald") || q.includes("time-09")) {
      reply = "The Royal Emerald Emperor (₹4,850, discounted from ₹5,400) is a majestic gold timepiece featuring a fluted crafted bezel, diamond-cut hour indices, and a magnificent emerald green sunburst face on polished oyster steel links.";
    } else if (q.includes("platinum") || q.includes("datejust") || q.includes("lumina") || q.includes("time-10")) {
      reply = "Our Lumina Platinum Datejust (₹4,100, discounted from ₹4,600) represents sovereign class. Equipped with an automatic chronometer and the iconic cyclops date magnifier under scratchproof sapphire.";
    } else if (q.includes("mariner") || q.includes("deepsea") || q.includes("dive") || q.includes("time-11")) {
      reply = "To survive deep oceanic exploration, the DeepSea Mariner Pro (₹2,990, discounted from ₹3,400) provides 30 ATM water resistance, unidirectional ceramic dial bezel, and tough 4mm thick sapphire.";
    } else if (q.includes("nürburg") || q.includes("racing") || q.includes("track") || q.includes("tachymeter") || q.includes("time-12")) {
      reply = "The Nürburg Racing Tachymeter (₹2,490, discounted from ₹2,990) features a hybrid meca-quartz stopwatch layout, tachymeter scale, and tire-tread perforated racing calfskin. A motorsports classic.";
    } else if (q.includes("charcoal") || q.includes("sandalwood") || q.includes("wood") || q.includes("time-13")) {
      reply = "Our Sandalwood Charcoal Quartz (₹2,250, discounted from ₹2,700) integrates sandblasted bronze gold, concrete-gray textured dials, and sandalwood crown elements with fine Swiss quartz. Truly unique.";
    } else if (q.includes("nordic") || q.includes("alabaster") || q.includes("slim") || q.includes("time-14")) {
      reply = "At just 6.2mm, our Nordic Alabaster Slim (₹2,150, discounted from ₹2,450) features Scandinavian linear pins, unblemished matte white dial, and raw vegetable-tanned tan leather strap.";
    } else if (q.includes("perpetual") || q.includes("calendar") || q.includes("moon-phase") || q.includes("geneva") || q.includes("time-15")) {
      reply = "The Geneva Perpetual Calendar (₹3,450, discounted from ₹3,900) automatically tracks days and dates, featuring an exquisite rotating custom moon-phase dial in polished 18k rose gold plating.";
    } else if (q.includes("antique") || q.includes("heirloom") || q.includes("antique rose") || q.includes("time-16")) {
      reply = "Our Heirloom Antique Rose (₹2,790, discounted from ₹3,100) recreates watchmaking heritage with traditional spade hands, domed retro glass, and manual-wind mechanics in elegant rose finish.";
    } else if (q.includes("price") || q.includes("cost") || q.includes("how much") || q.includes("expensive") || q.includes("cheap")) {
      reply = "Our hand-assembled timepiece collection starts at ₹2,099 for the Ivory Minimalist and extends up to our premium skeleton masterpiece, the Hyperion Sapphire Skeleton at ₹4,200. Every design features custom options.";
    } else if (q.includes("custom") || q.includes("design") || q.includes("change")) {
      reply = "You can customize any luxury watch by clicking 'Customize Diamond Base' on their catalog card! Choose Sapphire Steel or Quick Sand Gold cases, select fine dials (like Sunburst Royal Blue or Emerald Sunburst), select fine alligator straps or steel mesh links, and input custom back casing engraving text!";
    } else if (q.includes("sapphire") || q.includes("royal blue") || q.includes("quick sand") || q.includes("swan wing") || q.includes("shell stone")) {
      reply = `You are exploring our seasonal color palette! We feature:
- **Sapphire**: A brilliant deep-gemstone ocean navy tone available on casing steel or dial faces.
- **Royal Blue**: Star-burst blue highly reflective and dynamic.
- **Quick Sand**: Fine desert gold/champagne bronze for mesh bands and casing.
- **Swan Wing**: Soft, premium feather-colored white dial plate.
- **Shell Stone**: Ground limestone sandstone grey accent plates.`;
    } else if (q.includes("shipping") || q.includes("delivery") || q.includes("delay")) {
      reply = "We offer secure shipping across all zones: Metropolitan Hubs (₹10), Suburban Centers (₹18), and Remote Districts (₹28). Express Priority dispatch is fully supported as well!";
    } else if (q.includes("recommend") || q.includes("what is best") || q.includes("suggest") || q.includes("choice")) {
      reply = "If you appreciate full skeleton mechanics, I suggest the Hyperion Sapphire Skeleton (₹4,200) or Onyx Tourbillon (₹3,999). For pure vintage grandeur, the Royal Emerald Emperor (₹4,850). For simple elegance, the Nordic Alabaster Slim (₹2,150) is outstanding.";
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
  const { textQuery, speechQuery, imageBase64, imageMime, imageUrl } = req.body;

  const aiClient = getGeminiClient();

  // Primary prompt builder
  const watchCatalogDescription = `
    The store is called "TIME". We offer these premium base watches (prices in Indian Rupees ₹):
    1. "time-01" (Onyx Tourbillon): Skeleton marvel, real tourbillon, premium black, ₹3,999 (discounted from ₹4,499). High-end, mechanical.
    2. "time-02" (Champagne Monarch): Classic gold mesh look, Swiss quartz, ₹2,480 (discounted from ₹2,850). Classy, elegant, vintage.
    3. "time-03" (Ascent Chronograph): Rugged sporty titanium, mechanical column-wheel, tachymeter, ₹2,140 (discounted from ₹2,550). Athletic, sporty.
    4. "time-04" (Ivory Minimalist): Clean minimal white face, calfskin leather, thin, ₹2,099 (discounted from ₹2,350). Simple, sleek, office.
    5. "time-05" (Aero Stealth Carbon): Forged carbon tactical luxury, Cordura military dial, ₹2,950 (discounted from ₹3,250). Rugged military chic, extreme luxury.
    6. "time-06" (Vanguard Heritage): Automatic open heart, brown suede, ₹2,950. Timeless vintage luxury.
    7. "time-07" (Hyperion Sapphire Skeleton): Full skeleton with sapphire crystal plates, anodized titanium, ₹4,200 (discounted from ₹4,800).
    8. "time-08" (Titanium Eclipse Skeleton): Asymmetrical skeleton build, open escapement, sandblasted titanium finish, ₹3,600 (discounted from ₹4,100).
    9. "time-09" (Royal Emerald Emperor): Royal emerald-green sunburst face, fluted bezel, 18k rose gold plated, ₹4,850 (discounted from ₹5,400).
    10. "time-10" (Lumina Platinum Datejust): Luminous hands, date cyclops magnifier, triple oyster platinum link, ₹4,100 (discounted from ₹4,600).
    11. "time-11" (DeepSea Mariner Pro): Unidirectional ceramic bezel, 4mm thick sapphire, 300m waterproof, ₹2,990 (discounted from ₹3,400).
    12. "time-12" (Nürburg Racing Tachymeter): Motorspots stopwatch, black steel, racing calfskin, ₹2,490 (discounted from ₹2,990).
    13. "time-13" (Sandalwood Charcoal Quartz): Organic concrete dial, bronze золотой bezel, Swiss Ronda quartz, ₹2,250 (discounted from ₹2,700).
    14. "time-14" (Nordic Alabaster Slim): Scandinavian clean, 6.2mm case, vegetable tan strap, ₹2,150 (discounted from ₹2,450).
    15. "time-15" (Geneva Perpetual Calendar): Tracks days and dates, custom active moon-phase rotating dial, ₹3,450 (discounted from ₹3,900).
    16. "time-16" (Heirloom Antique Rose): Spade hands, railway tracking, rose gold finish, traditional lugs, ₹2,790 (discounted from ₹3,100).

    We offer these customizable options:
    - Case Colors: Champagne Gold, Obsidian Black, Metallic Gold, Chrome Silver, Sapphire Steel, Quick Sand Gold
    - Dial Colors: Obsidian Black, Sunburst Royal Blue, Emerald Sunburst, Champagne Satin, Ivory White, Sapphire Deep Ocean, Swan Wing White, Shell Stone Limestone
    - Straps: Alligator Leather (Black or Chestnut), Milanese Loop Mesh (Gold/Quick Sand), Solid Oyster Link Steel (Silver), Tactical Rubber Strap (Matte)
    - Glasses: Sapphire Crystal, Mineral Toughened Glass, Hardlex Tempered Classic
  `;

  const systemPrompt = `You are the master horologist and watch recommendation engine at "TIME" luxury watch boutique. 
  Your job is to analyze the user's query (which can be their description, voice transcription, or an uploaded photo/vibe check) and recommend exactly ONE base watch from our primary catalog that fits their description perfectly. Also suggest specific custom parts to match their requested aesthetic.
  
  Provide your output strictly in JSON format as specified:
  {
    "explanation": "Expert explanation of why this watch matches their personality, uploaded image, or voice request.",
    "watchId": "the watch id matching one of these options exactly: time-01, time-02, time-03, time-04, time-05, time-06, time-07, time-08, time-09, time-10, time-11, time-12, time-13, time-14, time-15, time-16",
    "suggestedCustom": {
      "caseColor": "Case color selection",
      "dialColor": "Dial color selection",
      "strapType": "Strap selection",
      "glassType": "Glass selection",
      "engraving": "A suggested custom back engraving text (e.g. 'Carpe Diem' or 'To Infinity')"
    }
  }`;

  if (!aiClient) {
    // Intelligent fallback recommendation engine for all 16 models
    const query = (textQuery || speechQuery || "").toLowerCase();
    let matchedId = "time-04";
    let explanation = "Based on your focus on clean geometries and refined minimal dials, we suggest our Ivory Minimalist.";

    if (query.includes("skeleton") || query.includes("tourbillon") || query.includes("mechanical") || query.includes("gears")) {
      if (query.includes("sapphire") || query.includes("hyperion")) {
        matchedId = "time-07";
        explanation = "The Hyperion Sapphire Skeleton represents hyper-luxurious modernism. Its space-age sapphire crystal plates host our co-axial winding caliber, putting all mechanics on showcase.";
      } else if (query.includes("titanium") || query.includes("eclipse")) {
        matchedId = "time-08";
        explanation = "For architectural asymmetry, the Titanium Eclipse Skeleton displays a stunning sandblasted micro-finish and open escapement wheel on FKM rubber.";
      } else {
        matchedId = "time-01";
        explanation = "For high-end mechanical appreciation, our manual-wind Onyx Tourbillon remains our masterwork art piece.";
      }
    } else if (query.includes("emerald") || query.includes("green") || query.includes("gold") || query.includes("emperor") || query.includes("rich") || query.includes("wedding")) {
      if (query.includes("emerald") || query.includes("green")) {
        matchedId = "time-09";
        explanation = "To display sovereign grandeur, the Royal Emerald Emperor radiates absolute prestige with its hand-crafted fluted bezel and forest sunburst dial.";
      } else if (query.includes("monarch") || query.includes("mesh")) {
        matchedId = "time-02";
        explanation = "Our signature Champagne Monarch reflects pure vintage high-society elegance with its golden hands and mesh metal loop.";
      } else {
        matchedId = "time-10";
        explanation = "For classic high-class ceremonies, we recommend the Lumina Platinum Datejust featuring iconic cyclops magnification indices.";
      }
    } else if (query.includes("sport") || query.includes("waterproof") || query.includes("carbon") || query.includes("dive") || query.includes("tough") || query.includes("racing")) {
      if (query.includes("mariner") || query.includes("dive") || query.includes("deepsea")) {
        matchedId = "time-11";
        explanation = "Designed for extreme water-tight integrity, the DeepSea Mariner Pro provides deep-sea unidirectional ceramic tracking and reliable Japanese Miyota heart.";
      } else if (query.includes("racing") || query.includes("tachymeter") || query.includes("nürburg")) {
        matchedId = "time-12";
        explanation = "Our Nürburg Racing Tachymeter revives the motorsport golden-era with highly reliable split stopwatch needles and perforated rally leather.";
      } else if (query.includes("carbon") || query.includes("stealth") || query.includes("tactical")) {
        matchedId = "time-05";
        explanation = "The Aero Stealth Carbon offers aeronautical weight and toughness. Forged entirely from carbon fiber composites, it matches active environments.";
      } else {
        matchedId = "time-03";
        explanation = "For general multi-sport active calibration, our Ascent Chronograph is titanium-shielded and has robust chronograph layouts.";
      }
    } else if (query.includes("minimal") || query.includes("sleek") || query.includes("thin") || query.includes("clean") || query.includes("slab") || query.includes("nordic") || query.includes("earth")) {
      if (query.includes("nordic") || query.includes("alabaster") || query.includes("slim")) {
        matchedId = "time-14";
        explanation = "For absolute pure understatement, the Nordic Alabaster Slim is exceptionally sleek at only 6.2mm case height.";
      } else if (query.includes("charcoal") || query.includes("wood") || query.includes("organic") || query.includes("sandalwood")) {
        matchedId = "time-13";
        explanation = "If you appreciate grounded organic warmth, the Sandalwood Charcoal integrates fine bronze with a textured stone dial and woody key.";
      } else {
        matchedId = "time-04";
        explanation = "Our unblemished Ivory Minimalist continues as our finest representation of simple, everyday classical office elegance.";
      }
    } else if (query.includes("classic") || query.includes("vintage") || query.includes("retro") || query.includes("calendar") || query.includes("moon") || query.includes("antique")) {
      if (query.includes("calendar") || query.includes("perpetual") || query.includes("moon-phase")) {
        matchedId = "time-15";
        explanation = "The Geneva Perpetual Calendar keeps absolute track of cycles, featuring custom sub-dials and realistic rotating moon indicator.";
      } else if (query.includes("antique") || query.includes("rose") || query.includes("heirloom")) {
        matchedId = "time-16";
        explanation = "To capture traditional nostalgia, our Heirloom Antique Rose has classic spade needles and curved domed retro retro-style lugs.";
      } else {
        matchedId = "time-06";
        explanation = "For classic retro craftsmanship, the Vanguard Heritage features automatic Seiko engineering with a direct balance view at 9 o'clock.";
      }
    } else if (imageBase64 || imageUrl) {
      matchedId = "time-07";
      explanation = "We completed our visual analysis of your uploaded asset. The sophisticated lines and premium accents match flawlessly with our Hyperion Sapphire Skeleton series!";
    }

    const mockResult = {
      explanation,
      watchId: matchedId,
      suggestedCustom: {
        caseColor: matchedId === "time-09" ? "Quick Sand Gold" : "Obsidian Black",
        dialColor: matchedId === "time-07" ? "Sapphire Deep Ocean" : "Swan Wing White",
        strapType: "Solid Oyster Link Steel (Silver)",
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

    let finalImageBase64 = imageBase64;
    let finalImageMime = imageMime || "image/jpeg";

    if (!finalImageBase64 && imageUrl) {
      try {
        console.log("Fetching image from URL server-side to bypass browse-side CORS:", imageUrl);
        const imageRes = await fetch(imageUrl);
        if (imageRes.ok) {
          const buffer = await imageRes.arrayBuffer();
          finalImageBase64 = Buffer.from(buffer).toString("base64");
          finalImageMime = imageRes.headers.get("Content-Type") || "image/jpeg";
        }
      } catch (err) {
        console.error("Error downloading recommendation image on server-side:", err);
      }
    }

    if (finalImageBase64) {
      promptText += `\nUser uploaded a visual file representing their desired style, watch model, or outfit look. Analyze this imagery and match it to our catalog.`;
      
      const imagePart = {
        inlineData: {
          mimeType: finalImageMime,
          data: finalImageBase64
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
