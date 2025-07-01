const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
require("dotenv").config();

// Config
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.siebl7k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const usersCollection = client.db("eventApp").collection("users");
    const eventsCollection = client.db("eventApp").collection("events");

    // Register a new user
    app.post("/auth/register", async (req, res) => {
      const { name, email, password, photoURL } = req.body;

      try {
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
          return res.status(400).send({ error: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { name, email, password: hashedPassword, photoURL };

        await usersCollection.insertOne(newUser);

        res.status(201).send({ message: "User registered successfully" });
      } catch (error) {
        res.status(500).send({ error: "Registration failed" });
      }
    });

    // Login user
    app.post("/auth/login", async (req, res) => {
      const { email, password } = req.body;
      try {
        const user = await usersCollection.findOne({ email });
        if (!user) {
          return res.status(401).send({ error: "user not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).send({ error: "Wrong password " });
        }

        res.send({
          user: {
            name: user.name,
            email: user.email,
            photoURL: user.photoURL,
          },
        });
      } catch (error) {
        res.status(500).send({ error: "Login failed" });
      }
    });

    app.get("/events", async (req, res) => {
      try {
        const search = req.query.search?.trim() || "";
        const sortOrder = req.query.sort === "asc" ? 1 : -1;

        // Build filter query
        const query = {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
          ],
        };

        if (!search) delete query.$or;

        const events = await eventsCollection
          .find(query)
          .sort({ datetime: sortOrder })
          .toArray();

        res.send(events);
      } catch (err) {
        console.error("Error fetching events:", err);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // GET /events/limited - Get 8 latest events
    app.get("/events/limited", async (req, res) => {
      try {
        const events = await eventsCollection
          .find({})
          .sort({ date: -1 })
          .limit(8)
          .toArray();

        res.status(200).send(events);
      } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    // Post event

    app.post(
      "/add/event",

      async (req, res) => {
        try {
          const event = req.body;
          const result = await eventsCollection.insertOne(event);
          res.send(result);
        } catch (error) {
          res.status(500).send({ error: "Internal server error" });
        }
      }
    );

    // Join Event
    app.patch("/events/:id", async (req, res) => {
      const eventId = req.params.id;
      const userEmail = req.body.email;

      try {
        const event = await eventsCollection.findOne({
          _id: new ObjectId(eventId),
        });

        if (!event) {
          return res.status(404).send({ message: "Event not found" });
        }

        if (event.joinedUsers?.includes(userEmail)) {
          return res
            .status(400)
            .send({ message: "You have already joined this event." });
        }

        const result = await eventsCollection.updateOne(
          { _id: new ObjectId(eventId) },
          {
            $inc: { attendeeCount: 1 },
            $push: { joinedUsers: userEmail },
          }
        );

        res.send({ message: "Successfully joined the event", result });
      } catch (error) {
        res.status(500).send({ message: "Something went wrong", error });
      }
    });

    // update events
    app.put("/my-events/:id", async (req, res) => {
      try {
        const eventId = req.params.id;
        const updatedData = req.body;

        const result = await eventsCollection.updateOne(
          { _id: new ObjectId(eventId) },
          { $set: updatedData }
        );

        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Failed to update event" });
      }
    });

    // GET /events?email=user@example.com
    app.get("/my-events", async (req, res) => {
      try {
        const email = req.query.email;

        const query = { createdBy: email };
        const events = await eventsCollection.find(query).toArray();

        res.send(events);
      } catch (err) {
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // delete
    app.delete("/my-events/:id", async (req, res) => {
      try {
        const eventId = req.params.id;

        const result = await eventsCollection.deleteOne({
          _id: new ObjectId(eventId),
        });

        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Failed to delete event" });
      }
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Event Zone");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
