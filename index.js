const express = require('express');
	const cors = require('cors');
  require('dotenv').config()
	const app = express();
	const port = process.env.PORT || 5000;

	app.use(cors());
	app.use(express.json());


  
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ktgpsav.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

  

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const jobCollection = client.db('jobDb').collection('allJob')
    const applicationCollection = client.db('jobDb').collection('applications')
      // GET ROUTE
    // getting all jobs
      app.get('/api/v1/jobs', async(req, res) => {
        try{
          const cursor = jobCollection.find();
          const result = await cursor.toArray();
          res.send(result)
        }
        catch(err){
          console.log(err)
        }
      })

      // getting one job for job details page based on id

      app.get('/api/v1/jobs/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await jobCollection.findOne(query);
        res.send(result)
      })

      // posting applied job to the server
      app.post('/api/v1/appliedJob', async(req, res) => {
        try{
          const {name, email, resume, id} = req.body;
          const application = {
            name,
            email,
            resume,
            jobId: id,
          }
          const result = await applicationCollection.insertOne(application)
          if(result.insertedId){
            const query = { _id: new ObjectId(id)};
            const job = await jobCollection.findOne(query);

            const newApplicants = job.applicants + 1;

            const updateResult = await jobCollection.updateOne(query, {
              $set:{applicants: newApplicants}
            })

            if(updateResult.modifiedCount === 1){
              res.status(200).json({message: 'Application Successful'});
            } else{
              res.status(500).json({message: 'Failed to update job application'})
            }
          }
          
        }
        catch(err){
          console.log(err)
          res.send(err)
        }
      })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

	
	app.get('/', (req, res) => {
	res.send('job server is running')
})
	app.listen(port, () => {
	console.log(`Server is running on PORT: ${port}`)
})
