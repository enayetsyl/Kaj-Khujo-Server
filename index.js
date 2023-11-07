const express = require('express');
	const cors = require('cors');
  require('dotenv').config()
  const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
	const app = express();
	const port = process.env.PORT || 5000;

	app.use(cors());
	app.use(express.json());


  

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
    // await client.connect();
    const jobCollection = client.db('jobDb').collection('allJob')
    const applicationCollection = client.db('jobDb').collection('applications')
      // GET ROUTE
    // getting all jobs
      // app.get('/api/v1/jobs', async(req, res) => {
      //   try{
      //     console.log(req.query)
      //     const cursor = jobCollection.find();
      //     const result = await cursor.toArray();
      //     res.send(result)
      //   }
      //   catch(err){
      //     console.log(err)
      //   }
      // })

      app.get('/api/v1/jobs', async(req, res) => {
        
          console.log(req.query)
          let query = {};
          if(req.query?.userName){
            query = {userName: req.query.userName}
          }
          const result = await jobCollection.find(query).toArray();
          res.send(result)
       
      })

      // getting job for tab component


app.get('/api/v1/tabJobs', async (req, res) => {
  const { category } = req.query;
  let query = {};

  if (category && category !== 'All') {
    query.category = category;
  }

  const result = await jobCollection.find(query).toArray();
  res.send(result);
});


      // getting one job for job details page based on id

      app.get('/api/v1/jobs/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await jobCollection.findOne(query);
        res.send(result)
      })

    //  get applied job

    app.get('/api/v1/myappliedjobs', async (req, res) => {
      console.log(req.query);
      try {
        let query = {};
        if (req.query?.userName) {
          query = { name: req.query.userName };
        }
    
        // Find applications based on the user's name
        const applications = await applicationCollection.find(query).toArray();
    
        // Create an array to store job data for each application
        const jobDataForUser = [];
    
        for (const app of applications) {
          // Find the job document for the application using async/await and ObjectId conversion
          const job = await jobCollection.findOne({ _id: new ObjectId(app.jobId) });
    
          jobDataForUser.push({
            job: job,
          });
        }
    
        res.send(jobDataForUser);
    
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to retrieve applied jobs' });
      }
    });
    
    

    // app.get('/api/v1/myappliedjobs', async(req, res) => {
    //   console.log(req.query)
    //   let query = {};
    //   if(req.query?.userName){
    //     query = {name: req.query.userName}
    //   }
    //   const result = await applicationCollection.find(query).toArray();
    //   res.send(result) 
    // })
      
      

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

      // add a job route 

      app.post('/api/v1/addjob', async(req, res) => {
        try{
          const newJob = req.body;
          const result = await jobCollection.insertOne(newJob)
          console.log(result)
          if(result.insertedId){
            res.status(200).json({message: 'Job Added Successfully'});
            
          }else{
            res.status(500).json({message: 'Failed to add job'})
          }
          
        }
        catch(error){
          console.log(error)
          res.send(error)
        }
      })

      // update job route

      app.put('/api/v1/updatejob/:id', async(req, res) => {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const options = { upsert: true };
        const updatedJob = req.body;

        const job = {
$set: {
      jobTitle:updatedJob.jobTitle,
      jobBanner:updatedJob.jobBannerURL,
      userName:updatedJob.userName,
      salaryRange:updatedJob.salaryRange,
      jobDescription:updatedJob.jobDescription,
      postingDate: updatedJob.postingDate,
      applicationDeadline: updatedJob.applicationDeadline,
      applicants:updatedJob.jobApplicantsNumber,
      category:updatedJob.jobCategory,
}
        }
        const result = await jobCollection.updateOne(filter, job, options)
        res.send(result)
      })

      // job delete route

      app.delete('/api/v1/jobs/delete/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await jobCollection.deleteOne(query)
        res.send(result)
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
