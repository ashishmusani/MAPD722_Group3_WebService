const restify = require('restify');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;

mongoose.connect('mongodb://localhost:27017/MAPD713', {useNewUrlParser: true});
const db = mongoose.connection;
db.once('open', () => {
    console.log("Connected to DB")
})
var patientSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    address: String,
    age: Number,
    birthDate: String,
    department: String,
    doctor: String
});
var Patient = mongoose.model('Patient', patientSchema)

var server = restify.createServer({
    name: "'Health Records (MAPD713-Milestone2)'"
});
server.listen(PORT, () => {
    console.log("Server %s is listening on port %s", server.name, PORT);
    console.log("========Resources========");
    console.log("/patients");
    console.log("/patients/:id");
    console.log("/patients");
    console.log("/patients/:id/tests");
    console.log("=========================")
})
server.use(restify.plugins.fullResponse());
server.use(restify.plugins.bodyParser());

server.get('/patients', (req,res) => {
    Patient.find({}, (err, patients) => {
        console.log(patients)
        res.send(patients)
    })
})

server.post('/patients', (req,res) => {

    const {firstName, lastName, address, age, birthDate, department, doctor } = req.body;

    if(firstName && lastName && address && age && birthDate && department && doctor){
        var newPatient = new Patient({
            firstName: firstName,
            lastName: lastName,
            address: address,
            age: age,
            birthDate: birthDate,
            department: department,
            doctor: doctor
        })

        newPatient.save((err, result) => {
            if(err){
                console.log(err);
                res.send(500, "There was some problem fulfilling the request. Please try again.");
            } else {
                res.send(201, result);
            }
        })
    } else {
        res.send(400, "One or more fields are missing values")
    }
})

server.get('/patients/:id', async (req,res) => {
    try {
        const patientId = req.params?.id;
        if (patientId) {
            var patient = await Patient.findById(patientId);
            if (patient) {
                return res.send(200, patient);
            }
            else {
                return res.send(404, 'Could not find a patient with this ID.');
            }
        }
        else {
            return res.send(400, 'Patient ID is required.');
        }
    }
    catch (err) {
        return res.send(500, `There was an error finding the patient. ${err}`);
    }
})