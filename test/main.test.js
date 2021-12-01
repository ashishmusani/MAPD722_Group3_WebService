const {server, db} = require("../index");
const request = require('supertest');

var newPatientId;

describe('Backend test', function() {
    beforeAll(done => {
        done()
    })
    
    afterAll(done => {
        // Closing the DB connection allows Jest to exit successfully.
        db.close()
        server.close()
        done()
    })

    // test route for posting new patient
    it('post patient', async () => {
        var newPatient = {
            firstName: "firstName",
            lastName: "lastName",
            address: "address",
            age: 30,
            birthDate: "birthDate",
            department: "department",
            doctor: "doctor"
        }

        var response = await request(server)
        .post('/patients')
        .send(newPatient)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)

        newPatientId = response.body._id;

        console.log("post patient response: ", response);
    })

    // test route for getting all patients
    it('get patients', async () => {
        var response = await request(server)
        .get('/patients')
        .expect('Content-Type', /json/)
        .expect(200)

        console.log("get patients response.body: ", response.body);
        expect(response.status).toEqual(200);
        expect(response.body.length).not.toBe(0);
    });
    
    // test route for getting patient by id
    it('get patient by id', async () => {
        var idToSearch;

        // use newly created patient ID if it exists. Otherwise, use first ID from list of patients
        if (newPatientId) {
            idToSearch = newPatientId;
        }
        else {
            var allPatients = await request(server)
            .get('/patients')
            
            idToSearch = allPatients.body[0]._id
        }

        var response = await request(server)
        .get(`/patients/${idToSearch}`)
        .expect('Content-Type', /json/)
        .expect(200)

        console.log("get patient by id response.body: ", response.body);
    })

    // test route for posting test by patient id
    it('post test by patient id', async () => {
        var newTest = {
            patientId: "patientId",
            date: new Date(),
            time: "time",
            typeOfData: "typeOfData",
            value: "value"
        }

        var response = await request(server)
        .post(`/patients/${newPatientId}/tests`)
        .send(newTest)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)

        console.log("post test response: ", response);
        expect(response.body.value).toEqual("value")
        expect(response.body.typeOfData).toEqual("typeOfData")
        expect(response.body.time).toEqual("time")        
    })

    // test route for getting tests by patient id
    it('get test by patient id', async () => {
        var response = await request(server)
        .get(`/patients/${newPatientId}`)
        .expect('Content-Type', /json/)
        .expect(200)

        console.log("get patient by id response.body: ", response.body);
    })

    // test route for deleting patient by id
    it('del patient by id', async () => {
        var response = await request(server)
        .del(`/patients/${newPatientId}`)
        .expect('Content-Type', /json/)
        .expect(200)

        console.log("del patient response.body: ", response.body);
        expect(response.status).toEqual(200);
    });
});
