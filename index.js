const express = require("express");
const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();
const uri = "mongodb+srv://hussnainrajpoot5415:123456...@blogsdb.9xfkjee.mongodb.net/?retryWrites=true&w=majority&appName=blogsdb";
const client = new MongoClient(uri);
app.use(express.json());
app.use(cors());

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB Atlas", error);
    throw error;
  }
}

// Call the function to connect to the database
(async () => {
  try {
    await connectToDatabase();
    const db = client.db("TenderDatabase");
    const collection = db.collection("tenders");

    // ✅ API 1: Get All Tenders
    app.get("/api/tenders", async (req, res) => {
      try {
        const tenders = await collection.find({}).toArray();
        res.json({ success: true, data: tenders });
      } catch (error) {
        console.error("Error fetching all tenders:", error);
        res.status(500).json({ success: false, message: "Server error" });
      }
    });

    // ✅ API 3: Get a Single Tender by ID
    app.get("/api/tenders/:id", async (req, res) => {
      try {
        const tenderId = req.params.id;

        // Validate ID format
        if (!ObjectId.isValid(tenderId)) {
          return res.status(400).json({ success: false, message: "Invalid Tender ID" });
        }

        // Find tender by _id
        const tender = await collection.findOne({ _id: new ObjectId(tenderId) });

        if (!tender) {
          return res.status(404).json({ success: false, message: "Tender not found" });
        }

        res.json({ success: true, data: tender });
      } catch (error) {
        console.error("Error fetching tender by ID:", error);
        res.status(500).json({ success: false, message: "Server error" });
      }
    });

    // ✅ API 2: Get Paginated Tenders (10 per page)
    app.get("/api/tenders/page/:page", async (req, res) => {
      try {
        let page = parseInt(req.params.page) || 1;
        let limit = 10;
        let skip = (page - 1) * limit;

        const tenders = await collection.find({})
          .skip(skip)
          .limit(limit)
          .toArray();

        const totalTenders = await collection.countDocuments();
        const totalPages = Math.ceil(totalTenders / limit);

        res.json({
          success: true,
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalTenders,
          data: tenders
        });

      } catch (error) {
        console.error("Error fetching paginated tenders:", error);
        res.status(500).json({ success: false, message: "Server error" });
      }
    });

    // Start the Express server
    const port = process.env.PORT || 8000;
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));

  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
})();
