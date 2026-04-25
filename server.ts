import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock database for fines
  const MOCK_FINES = [
    {
      id: "TKT-1001",
      plateNumber: "GR-1234-22",
      offense: "Speeding above 100km/h",
      location: "Accra-Tema Motorway",
      date: "2024-03-15",
      amount: 250.00,
      status: "unpaid"
    },
    {
      id: "TKT-1002",
      plateNumber: "GW-5678-21",
      offense: "Expired Road Worthiness",
      location: "Tetteh Quarshie Interchange",
      date: "2024-03-20",
      amount: 150.00,
      status: "unpaid"
    },
    {
      id: "TKT-1003",
      plateNumber: "GR-1234-22",
      offense: "Driving without Seatbelt",
      location: "Spintex Road",
      date: "2024-04-10",
      amount: 100.00,
      status: "unpaid"
    },
    {
      id: "TKT-1004",
      plateNumber: "AS-9988-23",
      offense: "Illegal Parking",
      location: "Kumasi Kejetia Market",
      date: "2024-04-12",
      amount: 50.00,
      status: "unpaid"
    }
  ];

  // API Routes
  app.get("/api/fines/:plateNumber", (req, res) => {
    const { plateNumber } = req.params;
    const fines = MOCK_FINES.filter(f => f.plateNumber.toUpperCase() === plateNumber.toUpperCase());
    res.json(fines);
  });

  app.post("/api/pay", (req, res) => {
    const { fineId, phoneNumber, network, amount } = req.body;
    
    // Simulate Mobile Money processing
    setTimeout(() => {
      // In a real app, you'd call a payment gateway here (Hubtel, Paystack, Flutterwave, etc.)
      console.log(`Processing payment for ${fineId} via ${network} (${phoneNumber}) for GHS ${amount}`);
      
      // Update mock fine status
      const fine = MOCK_FINES.find(f => f.id === fineId);
      if (fine) {
        fine.status = "paid";
        res.json({ success: true, message: "Payment successful", reference: `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}` });
      } else {
        res.status(404).json({ success: false, message: "Fine not found" });
      }
    }, 2000);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
