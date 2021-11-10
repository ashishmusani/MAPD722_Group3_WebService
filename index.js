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

var testSchema = new mongoose.Schema({
    patientId: String,
    date: String,
    time: String,
    typeOfData: String,
    value: String
});
var Test = mongoose.model('Test', testSchema)

var server = restify.createServer({
    name: "'Health Records (MAPD713-Milestone2)'"
});
server.listen(PORT, () => {
    console.log("Server %s is listening on port %s", server.name, PORT);
    console.log("========Resources========");
    console.log("/patients   [GET,POST,DELETE]");
    console.log("/patients/:id   [GET]");
    console.log("/patients/:id/tests   [GET,POST]");
    console.log("=========================")
})
server.use(restify.plugins.fullResponse());
server.use(restify.plugins.bodyParser());

//  List All Patient Info
server.get('/patients', (req,res) => {
    Patient.find({}, (err, patients) => {
        console.log(patients)
        res.send(patients)
    })
})

//  Add Patient Info
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

//  View Patient Info
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

//  Add Test for a Patient
server.post('/patients/:id/tests', (req,res) => {
    const patientId = req.params?.id;
    if(patientId){
        if(!req.body){
            res.send(400, "Required data missing in request body")
            return
        }
        var patient = Patient.findById(patientId, (err, patient) => {
            if(err){
                return res.send(500, err);
            } else if (patient){
                const {date, time, typeOfData, value} = req.body;
                if(date && time && typeOfData && value){
                    var newTest = new Test({
                        patientId: patientId,
                        date: date,
                        time: time,
                        typeOfData: typeOfData,
                        value: value                
                    })
                    newTest.save((err, result) => {
                        if(err){
                            res.send(500, "There was some problem fulfilling the request. Please try again.");
                        } else {
                            res.send(201, result);
                        }
                    })
                } else {
                    res.send(400, "One or more fields are missing values")
                }

            } else {
                return res.send(404, "Could not find a patient with this ID.");
            }
        });
    } else {
        return res.send(400, 'Patient ID is required.');
    }
})

//  View Tests for a Patient
server.get('/patients/:id/tests', (req,res) => {
    const patientId = req.params?.id;
    if(patientId){
        var patient = Patient.findById(patientId, (err, patient) => {
            if(err){
                return res.send(500, err);
            } else if (patient){
                Test.find({patientId: patientId}, (err, tests) => {
                    if(err){
                        return res.send(500, err);
                    } else {
                        res.send(200, tests);
                    }
                })
            } else {
                return res.send(404, "Could not find a patient with this ID.");
            }
        });
    } else {
        return res.send(400, 'Patient ID is required.');
    }
});

//  Delete Patient Info
server.del('/patients/:id', (req,res) => {
    const patientId = req.params?.id;
    if(patientId){
        var patient = Patient.findById(patientId, (err, patient) => {
            if(err){
                return res.send(500, err);
            } else if(patient){
                Test.deleteMany({patientId: patientId}, (err) => {
                    if(err){
                        res.send(500, "There was some problem fulfilling the request. Please try again.");
                        return;
                    } else {
                        Patient.deleteOne({_id: patientId}, (err) => {
                            if(err){
                                res.send(500, "There was some problem fulfilling the request. Please try again.");
                                return;
                            } else {
                                res.send(200, "Patient successfully deleted")
                            }        
                        })
                    }
                })
            } else {
                return res.send(404, "Could not find a patient with this ID."); 
            }
        });
    } else {
        return res.send(400, 'Patient ID is required.');
    }
})