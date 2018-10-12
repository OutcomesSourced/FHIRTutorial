(function(window){
  window.extractData = function() {
    var ret = $.Deferred();

    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

    function displayObservation (observation) {
      var table = document.getElementById("obs_table");
      var row = table.insertRow(1);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      //cell1.innerHTML = '1';
      //cell2.innerHTML = '2';
      
      if (typeof observation.code != 'undefined' &&
          typeof observation.code.coding != 'undefined' &&
          typeof observation.code.coding[0].code != 'undefined') {
          cell1.innerHTML = observation.code.coding[0].code;
        } else {
          cell1.innerHTML = 'Missing Value';
      }     
      if (typeof observation.code != 'undefined' &&
          typeof observation.code.text != 'undefined') {
          cell2.innerHTML = observation.code.text;
        } else {
          cell2.innerHTML = 'Missing Value';
      }
    }
    
    function displayCondition (condition) {
      var table = document.getElementById("cond_table");
      var row = table.insertRow(1);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      //cell1.innerHTML = '1';
      //cell2.innerHTML = condition.code.coding[0].code; //'2';
      
      if (typeof condition.code != 'undefined' &&
          typeof condition.code.coding != 'undefined' &&
          typeof condition.code.coding[0].code != 'undefined') {
          cell1.innerHTML = condition.code.coding[0].code;
        } else {
          cell1.innerHTML = 'Missing Value';
      }    
      if (typeof condition.code != 'undefined' &&
          typeof condition.code.text != 'undefined') {
          cell2.innerHTML = condition.code.text;
        } else {
          cell2.innerHTML = 'Missing Value';
      }
    }
    
    
    
function createFHIRFile(resource){
          let fileContent = "data:text/csv;charset=utf-8,";
          fileContent += JSON.stringify(resource);
  
        var encodedUri = encodeURI(fileContent);
          var link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          if (typeof resource.patient != 'undefined') {
            link.setAttribute("download", resource.patient.reference.replace("Patient/","") + "_" + resource.resourceType + "_" + resource.id + ".fhir");    
          } else { 
            link.setAttribute("download", resource.subject.reference.replace("Patient/","") + "_" + resource.resourceType + "_" + resource.id + ".fhir");
            }
          
  //link.setAttribute("download", resource.patient.reference.replace("Patient/","") + "_" + resource.resourceType + "_" + resource.id + ".fhir");    
    
          link.innerHTML= "Click Here to download";
          document.body.appendChild(link); // Required for FF
          link.click(); // This will download the data file named "my_data.csv".
}

   
    
    function onReady(smart)  {
      if (smart.hasOwnProperty('patient')) {
        var patient = smart.patient;
        var pt = patient.read();
        var obv = smart.patient.api.fetchAll({
                    type: 'Observation',
                    query: {
                      code: {
                        $or: ['http://loinc.org|8302-2', 'http://loinc.org|8462-4',
                              'http://loinc.org|8480-6', 'http://loinc.org|2085-9',
                              'http://loinc.org|2089-1', 'http://loinc.org|55284-4',
                              'http://loinc.org|29463-7']
                      }
                    }
                  });
        
        smart.patient.api.fetchAll({type: 'Observation'})
        .then(function(results, refs) {
          results.forEach(function(observation){
            displayObservation(observation);
          });
        });
        
        smart.patient.api.fetchAll({type: 'Condition'})
        .then(function(results, refs) {
          results.forEach(function(conditiona){
            displayCondition(conditiona);
          });
        });
        

        

        
        $.when(pt, obv).fail(onError);

        $.when(pt, obv).done(function(patient, obv) {
          

          
          
          
          
          //fileContent += "Test";
        /* filename is download
        var encodedUri = encodeURI(fileContent);
        window.open(encodedUri);
          */
          
        
          
          //var resources = ["Observation","Condition"];        
          /*
          var testw = "Observation"
          
          smart.patient.api.fetchAll({type: testw})
          .then(function(results, refs) {
            results.forEach(function(resource){
              createFHIRFile(resource);
            });
          });
          */

          
          
          var i, s, resources = ["Observation","Condition"], len = resources.length;
          for (i=0; i<len; ++i) {
            if (i in resources) {
              //smart.patient.api.fetchAll({type: resources[i]})
              smart.patient.api.fetchAll({type: 'Condition'})
              .then(function(results, refs) {
                results.forEach(function(resource){
                  createFHIRFile(resource);
                });
              });
            }
          }
      
          var byCodes = smart.byCodes(obv, 'code');
          var gender = patient.gender;

          var fname = '';
          var lname = '';

          var ptid = patient.id;

          
          if (typeof patient.name[0] !== 'undefined') {
            fname = patient.name[0].given.join(' ');
            lname = patient.name[0].family.join(' ');
          }
          
          
  


          fname = "Test87";
          //fname = JSON.stringfy(patient);
          var height = byCodes('8302-2');
          var weight = byCodes('29463-7');
          var systolicbp = getBloodPressureValue(byCodes('55284-4'),'8480-6');
          var diastolicbp = getBloodPressureValue(byCodes('55284-4'),'8462-4');
          var hdl = byCodes('2085-9');
          var ldl = byCodes('2089-1');

          var p = defaultPatient();
          p.birthdate = patient.birthDate;
          p.gender = gender;
          //p.gender = xml_to_string(smart.patient.api.fetchAll({type: 'Observation'}));
          p.fname = fname;
          p.lname = lname;
          p.ptid = ptid;
          p.height = getQuantityValueAndUnit(height[0]);
          //p.weight = getQuantityValueAndUnit(weight[1]);
          p.weight = weight.length;

          if (typeof systolicbp != 'undefined')  {
            p.systolicbp = systolicbp;
          }

          if (typeof diastolicbp != 'undefined') {
            p.diastolicbp = diastolicbp;
          }

          p.hdl = getQuantityValueAndUnit(hdl[0]);
          p.ldl = getQuantityValueAndUnit(ldl[0]);

          ret.resolve(p);
        
        
        });
      } else {
        onError();
      }
    }

    FHIR.oauth2.ready(onReady, onError);
    return ret.promise();

  };

  function defaultPatient(){
    return {
      ptid: {value: ''},
      fname: {value: ''},
      lname: {value: ''},
      gender: {value: ''},
      birthdate: {value: ''},
      height: {value: ''},
      weight: {value: ''},
      systolicbp: {value: ''},
      diastolicbp: {value: ''},
      ldl: {value: ''},
      hdl: {value: ''},
    };
  }

  function getBloodPressureValue(BPObservations, typeOfPressure) {
    var formattedBPObservations = [];
    BPObservations.forEach(function(observation){
      var BP = observation.component.find(function(component){
        return component.code.coding.find(function(coding) {
          return coding.code == typeOfPressure;
        });
      });
      if (BP) {
        observation.valueQuantity = BP.valueQuantity;
        formattedBPObservations.push(observation);
      }
    });

    return getQuantityValueAndUnit(formattedBPObservations[0]);
  }

  function getQuantityValueAndUnit(ob) {
    if (typeof ob != 'undefined' &&
        typeof ob.valueQuantity != 'undefined' &&
        typeof ob.valueQuantity.value != 'undefined' &&
        typeof ob.valueQuantity.unit != 'undefined') {
          return ob.valueQuantity.value + ' ' + ob.valueQuantity.unit;
    } else {
      return undefined;
    }
  }

  window.drawVisualization = function(p) {
    $('#holder').show();
    $('#loading').hide();
    $('#ptid').html(p.ptid);
    $('#fname').html(p.fname);
    $('#lname').html(p.lname);
    $('#gender').html(p.gender);
    $('#birthdate').html(p.birthdate);
    $('#height').html(p.height);
    $('#weight').html(p.weight);
    $('#systolicbp').html(p.systolicbp);
    $('#diastolicbp').html(p.diastolicbp);
    $('#ldl').html(p.ldl);
    $('#hdl').html(p.hdl);
  };

})(window);
