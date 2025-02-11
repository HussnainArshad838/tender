const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();
const uri = "mongodb+srv://megeshalawa:megeshalawa@cluster0.zaf4v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
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
    const db = client.db("TenderDatabase"); // Replace with your actual database name
    const collection = db.collection("tenders"); // Replace with your actual collection name

    /**
     * ✅ API 1: Get All Tenders
     * Endpoint: GET /api/tenders
     * Returns: All tenders from MongoDB
     */
    app.get("/api/tenders", async (req, res) => {
      try {
        const tenders = await collection.find({}).toArray();
        res.json({ success: true, data: tenders });
      } catch (error) {
        console.error("Error fetching all tenders:", error);
        res.status(500).json({ success: false, message: "Server error" });
      }
    });

    /**
     * ✅ API 2: Get Paginated Tenders
     * Endpoint: GET /api/tenders/page/:page
     * Params: page (number) → Default: 1
     * Returns: 10 tenders per page
     */
    app.get("/api/tenders/page/:page", async (req, res) => {
      try {
        let page = parseInt(req.params.page) || 1;
        let limit = 10; // Show 10 tenders per page
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
    const port = process.env.PORT || 8080;
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));

  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
})();
